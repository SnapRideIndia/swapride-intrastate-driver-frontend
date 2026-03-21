import { useQuery } from '@tanstack/react-query';
import { fetchMyTrips, type TripsListParams } from '../tripService';

export const MY_TRIPS_QUERY_ROOT = ['trips', 'my'] as const;

export const myTripsKey = (params?: TripsListParams) => [...MY_TRIPS_QUERY_ROOT, params] as const;

export const useMyTrips = (params?: TripsListParams) =>
  useQuery({
    queryKey: myTripsKey(params),
    queryFn: async () => {
      const { data } = await fetchMyTrips(params);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
