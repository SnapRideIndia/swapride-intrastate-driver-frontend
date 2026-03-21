import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import type { DriverProfile } from './types';
import { normalizeDriverProfile } from './profileUtils';

export const fetchDriverProfile = async () => {
  const res = await apiClient.get<unknown>(ENDPOINTS.DRIVER.PROFILE);
  const data = normalizeDriverProfile(res.data);
  return { ...res, data };
};

export type UpdateProfilePayload = {
  name?: string;
  status?: string;
};

export const updateDriverProfile = async (payload: UpdateProfilePayload) => {
  const res = await apiClient.patch<unknown>(ENDPOINTS.DRIVER.UPDATE_PROFILE, payload);
  const data = normalizeDriverProfile(res.data);
  return { ...res, data };
};
