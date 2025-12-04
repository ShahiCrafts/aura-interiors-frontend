import api from './api';

export const signup = (data) => api.post('/auth/signup', data);

export const login = (data) => api.post('/auth/login', data);

export const verifyEmail = (code) => api.post('/auth/verify-email', { code });

export const resendVerificationCode = (email) =>
  api.post('/auth/resend-verification', { email });

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });


export const resetPassword = (token, password) =>
  api.patch(`/auth/reset-password/${token}`, { password });

export const updatePassword = (currentPassword, newPassword) =>
  api.patch('/auth/update-password', { currentPassword, newPassword });

