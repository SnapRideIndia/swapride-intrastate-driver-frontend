export const ENDPOINTS = {
  // Auth
  AUTH: {
    SEND_OTP: '/drivers/auth/send-otp',
    VERIFY_OTP: '/drivers/auth/verify-otp',
    REFRESH: '/drivers/auth/refresh',
  },

  // Driver 
  DRIVER: {
    PROFILE: '/drivers/profile',
    UPDATE_PROFILE: '/drivers/profile',
    LOCATION_UPDATE: (id: string) => `/drivers/trips/${id}/location`,
    DOCUMENTS: '',
    BANK_ACCOUNT: '',
  },

  // Trips
  TRIPS: {
    LIST: '/drivers/trips',
    DETAIL: (id: string) => `/drivers/trips/${id}`,
    UPDATE_STATUS: (id: string) => `/drivers/trips/${id}/status`,
    PASSENGERS: (id: string) => `/drivers/trips/${id}/passengers`,
    BOARD_PASSENGER: (id: string) => `/drivers/bookings/${id}/board`,
    SCAN_TICKET: '/drivers/scan-ticket',
  },

} as const;
