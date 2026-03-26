import { storage } from './mmkv';
import type { DriverProfile } from '../features/driver/types';
import { normalizeDriverProfile } from '../features/driver/profileUtils';
import { STORAGE_KEYS } from '../constants/storageKeys';

export const profileStorage = {
  save(profile: DriverProfile): void {
    try {
      storage.set(STORAGE_KEYS.DRIVER_PROFILE, JSON.stringify(profile));
    } catch {}
  },

  read(): DriverProfile | null {
    try {
      const raw = storage.getString(STORAGE_KEYS.DRIVER_PROFILE);
      if (!raw) return null;
      return normalizeDriverProfile(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      storage.remove(STORAGE_KEYS.DRIVER_PROFILE);
    } catch {}
  },
};
