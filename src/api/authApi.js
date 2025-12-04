import api from './api';

export const signup = (data) => api.post('/auth/signup', data);

export const verifyEmail = (code) => api.post('/auth/verify-email', { code });

export const resendVerificationCode = (email) =>
  api.post('/auth/resend-verification', { email });

