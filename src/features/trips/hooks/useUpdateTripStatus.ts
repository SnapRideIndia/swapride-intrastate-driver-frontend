import { isAxiosError } from 'axios';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTripStatus, type TripsListResponse, type TripsListParams } from '../tripService';
import type { ApiTripSummary } from '../types';
import { tripDetailKey } from './useTripDetail';
import { MY_TRIPS_QUERY_ROOT } from './useMyTrips';
import { toast } from '../../../lib/toast';

function findTripInMyTripsCaches(
  qc: QueryClient,
  tripId: string,
): ApiTripSummary | undefined {
  const queries = qc.getQueryCache().findAll({ queryKey: [...MY_TRIPS_QUERY_ROOT] });
  for (const q of queries) {
    const d = q.state.data as TripsListResponse | undefined;
    const hit = d?.data?.find(t => t.id === tripId);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Optimistically move list caches so Home updates immediately while refetch runs.
 */
function applyMyTripsOptimistic(
  qc: QueryClient,
  tripId: string,
  nextStatus: 'IN_PROGRESS' | 'COMPLETED',
): () => void {
  const rollbacks: { key: readonly unknown[]; data: unknown }[] = [];
  const queries = qc.getQueryCache().findAll({ queryKey: [...MY_TRIPS_QUERY_ROOT] });

  const snapshot = (key: readonly unknown[]) => {
    rollbacks.push({ key, data: qc.getQueryData(key) });
  };

  if (nextStatus === 'IN_PROGRESS') {
    const trip = findTripInMyTripsCaches(qc, tripId);
    if (!trip) return () => {};

    for (const q of queries) {
      const key = q.queryKey as readonly unknown[];
      const params = key[2] as TripsListParams | undefined;
      snapshot(key);

      qc.setQueryData(key, (old: TripsListResponse | undefined) => {
        if (!old?.data) return old;
        if (params?.status === 'SCHEDULED') {
          const filtered = old.data.filter(t => t.id !== tripId);
          return {
            ...old,
            data: filtered,
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
        if (params?.status === 'IN_PROGRESS') {
          const updated: ApiTripSummary = { ...trip, status: 'In Progress' };
          return {
            ...old,
            data: [updated],
            pagination: { ...old.pagination, total: Math.max(1, old.pagination.total) },
          };
        }
        return old;
      });
    }
  } else {
    for (const q of queries) {
      const key = q.queryKey as readonly unknown[];
      const params = key[2] as TripsListParams | undefined;
      snapshot(key);

      qc.setQueryData(key, (old: TripsListResponse | undefined) => {
        if (!old?.data) return old;
        if (params?.status === 'IN_PROGRESS') {
          const filtered = old.data.filter(t => t.id !== tripId);
          return {
            ...old,
            data: filtered,
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
        return old;
      });
    }
  }

  return () => {
    rollbacks.forEach(({ key, data }) => {
      qc.setQueryData(key, data);
    });
  };
}

export const useUpdateTripStatus = (tripId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: 'IN_PROGRESS' | 'COMPLETED') => updateTripStatus(tripId, status),
    onMutate: async nextStatus => {
      await queryClient.cancelQueries({ queryKey: [...MY_TRIPS_QUERY_ROOT] });
      const rollback = applyMyTripsOptimistic(queryClient, tripId, nextStatus);
      return { rollback };
    },
    onError: (error, _vars, ctx) => {
      ctx?.rollback?.();
      if (isAxiosError(error)) return;
      toast.error('Failed to update trip status. Please try again.');
    },
    onSuccess: (_axiosResponse, variables) => {
      const msg = variables === 'IN_PROGRESS' ? 'Trip started!' : 'Trip completed!';
      toast.success(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...MY_TRIPS_QUERY_ROOT] });
      queryClient.invalidateQueries({ queryKey: tripDetailKey(tripId) });
    },
  });
};
