import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfileService,
  updateProfileService,
  updateAvatarService,
  removeAvatarService,
} from '../services/profileService';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfileService,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateProfile'],
    mutationFn: updateProfileService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateAvatar'],
    mutationFn: updateAvatarService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['removeAvatar'],
    mutationFn: removeAvatarService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
