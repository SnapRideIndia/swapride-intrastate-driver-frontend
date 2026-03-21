import { useQuery } from '@tanstack/react-query';
import { fetchDriverProfile } from '../driverService';
import { tokenStorage } from '../../../api/tokenStorage';

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
    /** Physical devices / slower networks often need a second try after login. */
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 4000),
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
