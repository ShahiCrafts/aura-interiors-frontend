import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
} from '../../api/profileApi';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getProfile();
      return response.data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateProfile'],
    mutationFn: async (data) => {
      try {
        const response = await updateProfile(data);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['updateAvatar'],
    mutationFn: async (file) => {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await updateAvatar(formData);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['removeAvatar'],
    mutationFn: async () => {
      try {
        const response = await removeAvatar();
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
