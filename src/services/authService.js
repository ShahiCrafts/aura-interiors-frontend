import { signup, login, verifyEmail, resendVerificationCode } from '../api/authApi';

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
