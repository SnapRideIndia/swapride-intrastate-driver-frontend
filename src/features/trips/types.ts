/** Raw status enum returned by detail API */
export type BackendTripStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELLED';

/** Boarding status enum returned by passengers API */
export type BoardingStatus = 'NOT_BOARDED' | 'BOARDED' | 'NO_SHOW';

/** Shape returned by GET /drivers/trips (list) */
export type ApiTripSummary = {
  id: string;
  date: string;                  // "2026-03-18"
  routeId: string;
  routeName: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  scheduledStartTime: string;    // "08:30 AM"
  scheduledEndTime: string;      // "02:30 PM"
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;                // formatted: "Scheduled" | "In Progress" | "Completed" etc.
  shiftType?: string;
  tripStatus: string;            // "On Time" | "Delayed" | "Early"
  delayMinutes: number;
  totalPassengers: number;
  createdAt: string;
  updatedAt: string;
};

export type TripStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
  durationToNext: number | null;
  distanceFromStart: number | null;
  images: string[];
};


export type ApiTripDetail = {
  id: string;
  date: string;
  routeId: string;
  routeName: string;
  busId: string;
  busNumber: string;
  driverId: string;
  scheduledDepartureAt: string;
  scheduledArrivalAt: string;
  actualDepartureAt: string | null;
  actualArrivalAt: string | null;
  status: BackendTripStatus;
  shiftType: string | null;
  isCancelled: boolean;
  cancellationReason: string | null;
  totalPassengers: number;
  boardedCount: number;
  notBoardedCount: number;
  noShowCount: number;
  stops: TripStop[];
  liveLocation: { latitude: number; longitude: number } | null;
  createdAt: string;
  updatedAt: string;
};

export type BoardedPassenger = {
  id: string;
  name: string;
  seat: string;
  boardedAt: string;
};

export type TripPassenger = {
  bookingId: string;
  seats: string[];
  passengerName: string;
  passengerPhone: string;
  pickupStop: string;
  dropStop: string;
  boardingStatus: BoardingStatus;
  bookingStatus: string;
  boardedAt?: string | null;
};

export type ScanTicketSuccessResponse = {
  message: string;
  bookingId: string;
  status: string;
  passenger: {
    id?: string;
    name?: string;
    mobileNumber?: string;
    profileUrl?: string | null;
  };
  booking: {
    seats: string[];
    pickup?: string;
    dropoff?: string;
  };
  trip: {
    id: string;
    route?: string;
    busNumber?: string;
  };
};
