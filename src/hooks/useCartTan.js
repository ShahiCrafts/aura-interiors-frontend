import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cartApi from '../store/api/cartApi';

const CART_KEYS = {
  all: ['cart'],
  list: () => [...CART_KEYS.all, 'list'],
};

// Get user's cart
export const useCart = (options = {}) => {
  return useQuery({
    queryKey: CART_KEYS.list(),
    queryFn: () => cartApi.getCart(),
    ...options,
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => cartApi.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => cartApi.updateCartItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

// Clear entire cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};
