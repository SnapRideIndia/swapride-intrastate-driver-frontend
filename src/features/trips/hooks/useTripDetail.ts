import { useQuery } from '@tanstack/react-query';
import { fetchTripDetail } from '../tripService';

export const tripDetailKey = (id: string) => ['trips', 'detail', id] as const;

export const useTripDetail = (id: string) =>
  useQuery({
    queryKey: tripDetailKey(id),
    queryFn: async () => {
      const { data } = await fetchTripDetail(id);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  });
