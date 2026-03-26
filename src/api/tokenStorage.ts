import { storage } from '../storage/mmkv';
import type { AuthTokenResponse } from '../features/auth/types';
import { queryClient } from '../providers/QueryProvider';
import { profileStorage } from '../storage/profileStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';

export const tokenStorage = {
  getToken: (): string | undefined => storage.getString(STORAGE_KEYS.AUTH_TOKEN),

  setToken: (token: string): void => storage.set(STORAGE_KEYS.AUTH_TOKEN, token),

  getRefreshToken: (): string | undefined => storage.getString(STORAGE_KEYS.AUTH_REFRESH_TOKEN),

  setRefreshToken: (token: string): void => storage.set(STORAGE_KEYS.AUTH_REFRESH_TOKEN, token),

  getExpiresAt: (): number | undefined => storage.getNumber(STORAGE_KEYS.AUTH_EXPIRES_AT),

  saveAuthResponse: (res: AuthTokenResponse): void => {
    queryClient.clear();
    storage.set(STORAGE_KEYS.AUTH_TOKEN, res.accessToken);
    storage.set(STORAGE_KEYS.AUTH_REFRESH_TOKEN, res.refreshToken);
    storage.set(STORAGE_KEYS.AUTH_EXPIRES_AT, Date.now() + res.expiresIn * 1000);
  },

  clearAll: (): void => {
    queryClient.clear();
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.AUTH_EXPIRES_AT);
    storage.remove(STORAGE_KEYS.FCM_TOKEN);
    profileStorage.clear();
  },

  hasToken: (): boolean => storage.contains(STORAGE_KEYS.AUTH_TOKEN),

  isAboutToExpire: (): boolean => {
    const expiresAt = storage.getNumber(STORAGE_KEYS.AUTH_EXPIRES_AT);
    if (!expiresAt) return false;
    return Date.now() >= expiresAt - 60_000;
  },
};
