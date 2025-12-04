import { useMutation } from '@tanstack/react-query';
import { loginService } from '../services/authService';

export const useLogin = () => {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: loginService,
  });
};
