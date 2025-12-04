import { useMutation } from '@tanstack/react-query';
import {
  forgotPasswordService,
  resetPasswordService,
  updatePasswordService,
} from '../services/authService';

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: ['forgotPassword'],
    mutationFn: forgotPasswordService,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationKey: ['resetPassword'],
    mutationFn: ({ token, password }) => resetPasswordService(token, password),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationKey: ['updatePassword'],
    mutationFn: ({ currentPassword, newPassword }) =>
      updatePasswordService(currentPassword, newPassword),
  });
};
