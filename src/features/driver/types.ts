export type DriverStatus =
  | 'AVAILABLE'
  | 'ON_TRIP'
  | 'OFF_DUTY'
  | 'ON_LEAVE'
  | 'BLOCKED';

/** Shape returned by GET /drivers/profile */
export type DriverProfile = {
  id: string;
  name: string;
  mobileNumber: string;
  licenseNumber: string;
  rating: number;
  rating_count: number;
  status: DriverStatus;
  profileUrl: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
};
