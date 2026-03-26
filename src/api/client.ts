import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../config/app';
import { tokenStorage } from './tokenStorage';
import { refreshTokenApi } from '../features/auth/authService';
import { toast } from '../lib/toast';
import { resetToLogin } from '../navigation/navigationRef';

/** Verbose auth + HTTP trace in dev. */
function devAuthLog(message: string, ...args: unknown[]) {
  if (__DEV__) {
    console.log(`[SwapRide API][auth] ${message}`, ...args);
  }
}

function devAuthWarn(message: string, ...args: unknown[]) {
  if (__DEV__) {
    console.warn(`[SwapRide API][auth] ${message}`, ...args);
  }
}

function devAuthError(message: string, ...args: unknown[]) {
  if (__DEV__) {
    console.error(`[SwapRide API][auth] ${message}`, ...args);
  }
}

export const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


// ─── Interceptors ────────────────────────────────────────────────────────────
if (__DEV__) {
  apiClient.interceptors.request.use(config => {
    console.log(`[API →] ${config.method?.toUpperCase()} ${config.url}`, config.data ?? '');
    return config;
  });

  apiClient.interceptors.response.use(
    response => {
      console.log(`[API ✓] ${response.status} ${response.config.url}`, response.data);
      return response;
    },
    error => {
      if (isAxiosError(error)) {
        console.log(
          `[API ✗] ${error.response?.status ?? 'ERR'} ${error.config?.url}`,
          error.response?.data ?? error.message,
        );
      }
      return Promise.reject(error);
    },
  );
}

// Prevents multiple concurrent refresh calls.
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let isRefreshing = false;
let pendingQueue: QueueEntry[] = [];

const processQueue = (error: unknown, token: string | null): void => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (tokenStorage.hasToken() && tokenStorage.isAboutToExpire()) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken && !isRefreshing) {
        devAuthLog('Proactive refresh: access token expiring soon', {
          url: config.url,
          expiresAt: tokenStorage.getExpiresAt(),
        });
        isRefreshing = true;
        try {
          const { data } = await refreshTokenApi(refreshToken);
          tokenStorage.saveAuthResponse(data);
          apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          devAuthLog('Proactive refresh: OK', { expiresInSec: data.expiresIn });
          processQueue(null, data.accessToken);
        } catch (refreshErr) {
          devAuthError('Proactive refresh: FAILED → clearing session', refreshErr);
          processQueue(refreshErr, null);
          tokenStorage.clearAll();
          resetToLogin();
        } finally {
          isRefreshing = false;
        }
      }
    }

    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (!isAxiosError(error)) {
      toast.error('Unexpected Error', 'Something went wrong. Please try again.');
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipGlobalErrorToast?: boolean;
    };
    const skipGlobalErrorToast = Boolean(originalRequest?.skipGlobalErrorToast);

    if (!error.response) {
      devAuthWarn('Network error (no response)', {
        url: originalRequest?.url,
        code: error.code,
        message: error.message,
        skipGlobalErrorToast,
      });
      if (!skipGlobalErrorToast) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          toast.error('Request Timed Out', 'The server took too long to respond.');
        } else {
          toast.network();
        }
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response as { status: number; data: Record<string, unknown> };
    const serverMessage = typeof data?.message === 'string' ? data.message : undefined;

    if (status === 401) {
      const reqUrl = originalRequest.url ?? '';
      const isScanTicket = reqUrl.includes('scan-ticket');
      devAuthWarn('401 Unauthorized', {
        url: reqUrl,
        method: originalRequest.method,
        _retry: originalRequest._retry,
        isRefreshing,
        skipGlobalErrorToast,
        serverMessage,
        isScanTicket,
      });

      // _retry flag prevents an infinite refresh → retry → 401 loop
      if (originalRequest._retry) {
        devAuthError(
          '401 after token refresh retry → logout (JWT still rejected or same business 401)',
          { url: reqUrl, serverMessage },
        );
        tokenStorage.clearAll();
        resetToLogin();
        return Promise.reject(error);
      }

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        devAuthError('401 but no refresh token → logout', { url: reqUrl });
        tokenStorage.clearAll();
        resetToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        devAuthLog('401 while refresh in progress → queue request', { url: reqUrl });
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(newToken => {
          devAuthLog('Queued request retry after refresh', { url: reqUrl });
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      devAuthLog('401 → attempting refresh + retry', { url: reqUrl });

      try {
        const { data: authData } = await refreshTokenApi(refreshToken);
        tokenStorage.saveAuthResponse(authData);
        apiClient.defaults.headers.common.Authorization = `Bearer ${authData.accessToken}`;
        processQueue(null, authData.accessToken);
        originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
        devAuthLog('Refresh OK → retrying original request', { url: reqUrl });
        return apiClient(originalRequest);
      } catch (refreshError) {
        devAuthError('Refresh FAILED → logout', { url: reqUrl, refreshError });
        processQueue(refreshError, null);
        tokenStorage.clearAll();
        resetToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (skipGlobalErrorToast) {
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('Access Denied', 'You do not have permission to perform this action.');
    } else if (status === 404) {
      toast.error('Not Found', serverMessage ?? 'The requested resource was not found.');
    } else if (status === 408 || status === 504) {
      toast.error('Request Timed Out', 'The server took too long to respond.');
    } else if (status === 422) {
      // 422 validation errors are surfaced by the caller; no global toast.
    } else if (status === 429) {
      toast.warning('Too Many Requests', 'Please slow down and try again shortly.');
    } else if (status >= 500) {
      toast.error('Server Error', 'Our servers are having issues. Please try again later.');
    } else {
      toast.error('Something Went Wrong', serverMessage ?? 'Please try again.');
    }

    return Promise.reject(error);
  },
);
