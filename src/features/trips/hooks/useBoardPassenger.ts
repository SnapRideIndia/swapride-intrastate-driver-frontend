import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardPassenger } from '../tripService';
import { tripPassengersKey } from './useTripPassengers';
import { tripDetailKey } from './useTripDetail';
import { toast } from '../../../lib/toast';

export const useBoardPassenger = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => boardPassenger(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripPassengersKey(tripId) });
      queryClient.invalidateQueries({ queryKey: tripDetailKey(tripId) });
      toast.success('Passenger boarded successfully!');
    },
    onError: () => {
      toast.error('Failed to board passenger. Please try again.');
    },
  });
};
