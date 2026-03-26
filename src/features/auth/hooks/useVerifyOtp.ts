import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { verifyOtpApi } from '../authService';
import { tokenStorage } from '../../../api/tokenStorage';
import { DRIVER_PROFILE_KEY } from '../../driver/hooks/useDriverProfile';
import { fetchDriverProfile } from '../../driver/driverService';
import { profileStorage } from '../../../storage/profileStorage';
import { syncFcmToken } from '../../../utils/notificationUtility';

type Variables = { mobileNumber: string; otp: string };

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mobileNumber, otp }: Variables) =>
      verifyOtpApi(mobileNumber, otp),
    onSuccess: async ({ data }) => {
      tokenStorage.saveAuthResponse(data);
      try {
        const { data: profile } = await fetchDriverProfile();
        profileStorage.save(profile);
        queryClient.setQueryData(DRIVER_PROFILE_KEY, profile);
        syncFcmToken(true);
      } catch {
        queryClient.invalidateQueries({ queryKey: DRIVER_PROFILE_KEY });
      }
    },
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response) return false;
      return failureCount < 1;
    },
  });
};
