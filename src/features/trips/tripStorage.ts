import { storage } from '../../storage/mmkv';

const ACTIVE_TRIP_ID_KEY = 'active_trip_id';

export const tripStorage = {
  setActiveTripId: (id: string | null) => {
    if (id) {
      storage.set(ACTIVE_TRIP_ID_KEY, id);
    } else {
      storage.remove(ACTIVE_TRIP_ID_KEY);
    }
  },
  getActiveTripId: () => storage.getString(ACTIVE_TRIP_ID_KEY) ?? null,
};
