import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { sendOtpApi } from '../authService';

type Variables = { mobileNumber: string };

export const useSendOtp = () =>
  useMutation({
    mutationFn: ({ mobileNumber }: Variables) => sendOtpApi(mobileNumber),
    onError: () => {
      // Interceptor handles global toasts; callers check status 404 for inline errors.
    },
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response) return false;
      return failureCount < 1;
    },
  });
