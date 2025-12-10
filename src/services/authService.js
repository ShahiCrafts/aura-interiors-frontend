import {
  signup,
  login,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../store/api/authApi';

export const signupService = async (data) => {
  try {
    const response = await signup(data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Signup failed';
  }
};

export const loginService = async (data) => {
  try {
    const response = await login(data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const verifyEmailService = async (code) => {
  try {
    const response = await verifyEmail(code);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Email verification failed';
  }
};

export const resendVerificationCodeService = async (email) => {
  try {
    const response = await resendVerificationCode(email);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to resend verification code';
  }
};

export const forgotPasswordService = async (email) => {
  try {
    const response = await forgotPassword(email);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send reset link';
  }
};

export const resetPasswordService = async (token, password) => {
  try {
    const response = await resetPassword(token, password);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to reset password';
  }
};

export const updatePasswordService = async (currentPassword, newPassword) => {
  try {
    const response = await updatePassword(currentPassword, newPassword);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update password';
  }
};
