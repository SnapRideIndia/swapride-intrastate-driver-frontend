import { useQuery } from '@tanstack/react-query';
import { fetchTripPassengers } from '../tripService';

export const tripPassengersKey = (id: string) => ['trips', 'passengers', id] as const;

export const useTripPassengers = (tripId: string) =>
  useQuery({
    queryKey: tripPassengersKey(tripId),
    queryFn: async () => {
      const { data } = await fetchTripPassengers(tripId);
      return data;
    },
    enabled: !!tripId,
    staleTime: 1000 * 15,
  });
