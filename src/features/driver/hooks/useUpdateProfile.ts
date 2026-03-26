import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDriverProfile, type UpdateProfilePayload } from '../driverService';
import { DRIVER_PROFILE_KEY } from './useDriverProfile';
import { toast } from '../../../lib/toast';
import { profileStorage } from '../../../storage/profileStorage';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateDriverProfile(payload),
    onSuccess: ({ data }) => {
      // Sync cache to disk immediately
      profileStorage.save(data);
      queryClient.setQueryData(DRIVER_PROFILE_KEY, data);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });
};
