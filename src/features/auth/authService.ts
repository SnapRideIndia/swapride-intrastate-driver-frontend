/**
 * Uses a bare axios instance (no app interceptors) so these functions are safe
 * to call from inside the apiClient response interceptor without a circular loop.
 * Error toasts are handled here directly for the same reason.
 */
import axios, { isAxiosError } from 'axios';
import { APP_CONFIG } from '../../config/app';
import { ENDPOINTS } from '../../api/endpoints';
import { toast } from '../../lib/toast';
import type { AuthTokenResponse, SendOtpResponse } from './types';

const authAxios = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

if (__DEV__) {
  authAxios.interceptors.request.use(config => {
    console.log(`[Auth →] ${config.method?.toUpperCase()} ${config.url}`, config.data ?? '');
    return config;
  });
}

authAxios.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(`[Auth ✓] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.log(
        `[Auth ✗] ${error.response?.status ?? 'ERR'} ${error.config?.url}`,
        error.response?.data ?? error.message,
      );
    }

    if (!isAxiosError(error)) {
      toast.error('Unexpected Error', 'Something went wrong. Please try again.');
      return Promise.reject(error);
    }

    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        toast.error('Request Timed Out', 'The server took too long to respond.');
      } else {
        toast.network();
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response as { status: number; data: Record<string, unknown> };
    const serverMessage = typeof data?.message === 'string' ? data.message : undefined;

    if (status === 401) {
      toast.error('Invalid OTP', serverMessage ?? 'The OTP entered is incorrect or has expired.');
    } else if (status === 404) {
      // Caller handles 404 inline (unregistered number) — no global toast.
    } else if (status === 429) {
      toast.warning('Too Many Requests', 'Please wait before requesting another OTP.');
    } else if (status >= 500) {
      toast.error('Server Error', 'Our servers are having issues. Please try again later.');
    } else if (status !== 422) {
      toast.error('Something Went Wrong', serverMessage ?? 'Please try again.');
    }

    return Promise.reject(error);
  },
);

export const sendOtpApi = (mobileNumber: string) =>
  authAxios.post<SendOtpResponse>(ENDPOINTS.AUTH.SEND_OTP, { mobileNumber });

export const verifyOtpApi = (mobileNumber: string, otp: string) =>
  authAxios.post<AuthTokenResponse>(ENDPOINTS.AUTH.VERIFY_OTP, { mobileNumber, otp });

export const refreshTokenApi = (refreshToken: string) =>
  authAxios.post<AuthTokenResponse>(ENDPOINTS.AUTH.REFRESH, { refreshToken });
