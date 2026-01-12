import { useMutation } from '@tanstack/react-query';
import {
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../../api/authApi';

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: ['forgotPassword'],
    mutationFn: async (email) => {
      try {
        const response = await forgotPassword(email);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationKey: ['resetPassword'],
    mutationFn: async ({ token, password }) => {
      try {
        const response = await resetPassword(token, password);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationKey: ['updatePassword'],
    mutationFn: async ({ currentPassword, newPassword }) => {
      try {
        const response = await updatePassword(currentPassword, newPassword);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
  });
};
