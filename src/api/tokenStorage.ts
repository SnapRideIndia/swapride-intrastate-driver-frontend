import { storage } from '../storage/mmkv';
import type { AuthTokenResponse } from '../features/auth/types';
import { queryClient } from '../providers/QueryProvider';

const KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at', 
} as const;

export const tokenStorage = {
  getToken: (): string | undefined => storage.getString(KEYS.TOKEN),

  setToken: (token: string): void => storage.set(KEYS.TOKEN, token),

  getRefreshToken: (): string | undefined => storage.getString(KEYS.REFRESH_TOKEN),

  setRefreshToken: (token: string): void => storage.set(KEYS.REFRESH_TOKEN, token),

  getExpiresAt: (): number | undefined => storage.getNumber(KEYS.EXPIRES_AT),

  saveAuthResponse: (res: AuthTokenResponse): void => {
    queryClient.clear();
    storage.set(KEYS.TOKEN, res.accessToken);
    storage.set(KEYS.REFRESH_TOKEN, res.refreshToken);
    storage.set(KEYS.EXPIRES_AT, Date.now() + res.expiresIn * 1000);
  },

  clearAll: (): void => {
    queryClient.clear();
    storage.remove(KEYS.TOKEN);
    storage.remove(KEYS.REFRESH_TOKEN);
    storage.remove(KEYS.EXPIRES_AT);
  },

  hasToken: (): boolean => storage.contains(KEYS.TOKEN),

  /**
   * True when access token expires within the next 60s.
   * If expiry was never stored, returns false — let 401 + refresh handle it
   * (treating "missing" as expired caused proactive refresh on every call and races).
   */
  isAboutToExpire: (): boolean => {
    const expiresAt = storage.getNumber(KEYS.EXPIRES_AT);
    if (!expiresAt) return false;
    return Date.now() >= expiresAt - 60_000;
  },
};
