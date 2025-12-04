import { useMutation } from '@tanstack/react-query';
import {
  signupService,
  verifyEmailService,
  resendVerificationCodeService,
} from '../services/authService';

export const useSignup = () => {
  return useMutation({
    mutationKey: ['signup'],
    mutationFn: signupService,
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationKey: ['verifyEmail'],
    mutationFn: verifyEmailService,
    onError: (error) => {
      console.error('Email verification error:', error);
    },
  });
};

export const useResendVerificationCode = () => {
  return useMutation({
    mutationKey: ['resendVerificationCode'],
    mutationFn: resendVerificationCodeService,
    onError: (error) => {
      console.error('Resend verification code error:', error);
    },
  });
};
