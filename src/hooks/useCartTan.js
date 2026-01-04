import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cartApi from '../store/api/cartApi';

const CART_KEYS = {
  all: ['cart'],
  list: () => [...CART_KEYS.all, 'list'],
};

export const useCart = (options = {}) => {
  return useQuery({
    queryKey: CART_KEYS.list(),
    queryFn: () => cartApi.getCart(),
    ...options,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => cartApi.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => cartApi.updateCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};
