import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scanTicket } from '../tripService';
import { tripPassengersKey } from './useTripPassengers';
import { tripDetailKey } from './useTripDetail';

export const useScanTicket = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await scanTicket(token);
      return data;
    },
    onSuccess: () => {
      if (tripId) {
        queryClient.invalidateQueries({ queryKey: tripPassengersKey(tripId) });
        queryClient.invalidateQueries({ queryKey: tripDetailKey(tripId) });
      }
    },
  });
};
