import { useMutation } from '@tanstack/react-query';
import { login } from '../../api/authApi';

export const useLogin = () => {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (data) => {
      try {
        const response = await login(data);
        return response.data;
      } catch (error) {
        throw error.displayMessage;
      }
    },
  });
};
