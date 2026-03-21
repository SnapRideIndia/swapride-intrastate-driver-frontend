/** Response from verify-otp and refresh endpoints */
export type AuthTokenResponse = {
  accessToken: string;
  tokenType: string;
  /** Seconds until access token expires (e.g. 3600) */
  expiresIn: number;
  refreshToken: string;
  isNewUser?: boolean;
};

/** Response from send-otp endpoint */
export type SendOtpResponse = {
  message: string;
};
