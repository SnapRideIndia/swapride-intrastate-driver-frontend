import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

export type LocationPayload = {
  latitude: number;
  longitude: number;
};

export const postLocationUpdate = (tripId: string, payload: LocationPayload) =>
  apiClient.patch(ENDPOINTS.DRIVER.LOCATION_UPDATE(tripId), payload);
