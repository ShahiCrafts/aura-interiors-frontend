import { useMutation } from '@tanstack/react-query';
import {
  signup,
  verifyEmail,
  resendVerificationCode,
} from '../../api/authApi';

export const useSignup = () => {
  return useMutation({
    mutationKey: ['signup'],
    mutationFn: async (data) => {
      try {
        const response = await signup(data);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationKey: ['verifyEmail'],
    mutationFn: async (code) => {
      try {
        const response = await verifyEmail(code);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onError: (error) => {
      console.error('Email verification error:', error);
    },
  });
};

export const useResendVerificationCode = () => {
  return useMutation({
    mutationKey: ['resendVerificationCode'],
    mutationFn: async (email) => {
      try {
        const response = await resendVerificationCode(email);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
    onError: (error) => {
      console.error('Resend verification code error:', error);
    },
  });
};
