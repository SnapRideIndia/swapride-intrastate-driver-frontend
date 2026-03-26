import { useQuery } from '@tanstack/react-query';
import { fetchDriverProfile } from '../driverService';
import { tokenStorage } from '../../../api/tokenStorage';
import { profileStorage } from '../../../storage/profileStorage';

export const DRIVER_PROFILE_KEY = ['driver', 'profile'] as const;

export const useDriverProfile = (enabled?: boolean) =>
  useQuery({
    queryKey: DRIVER_PROFILE_KEY,
    queryFn: async () => {
      const { data } = await fetchDriverProfile();
      return data;
    },
    enabled: enabled ?? tokenStorage.hasToken(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 4000),
    refetchOnMount: true,
    refetchOnReconnect: true,
    // Serve cached profile instantly on cold start; refetch runs in background
    initialData: () => profileStorage.read() ?? undefined,
    select: profile => {
      if (profile) profileStorage.save(profile);
      return profile;
    },
  });
