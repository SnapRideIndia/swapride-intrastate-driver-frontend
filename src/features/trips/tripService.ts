import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import type {
  ApiTripSummary,
  ApiTripDetail,
  TripPassenger,
  BackendTripStatus,
  ScanTicketSuccessResponse,
} from './types';

export type TripsListParams = {
  status?: BackendTripStatus;
  date?: string;
  limit?: number;
  offset?: number;
};

export type TripsListResponse = {
  data: ApiTripSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export const fetchMyTrips = (params?: TripsListParams) =>
  apiClient.get<TripsListResponse>(ENDPOINTS.TRIPS.LIST, { params });

export const fetchTripDetail = (id: string) =>
  apiClient.get<ApiTripDetail>(ENDPOINTS.TRIPS.DETAIL(id));

export const updateTripStatus = (id: string, status: 'IN_PROGRESS' | 'COMPLETED') =>
  apiClient.patch<ApiTripDetail>(ENDPOINTS.TRIPS.UPDATE_STATUS(id), { status });

export const fetchTripPassengers = (id: string) =>
  apiClient.get<TripPassenger[]>(ENDPOINTS.TRIPS.PASSENGERS(id));

export const boardPassenger = (bookingId: string) =>
  apiClient.patch(ENDPOINTS.TRIPS.BOARD_PASSENGER(bookingId));

export const scanTicket = (token: string) =>
  apiClient.post<ScanTicketSuccessResponse>(
    ENDPOINTS.TRIPS.SCAN_TICKET,
    { token },
    { skipGlobalErrorToast: true },
  );
