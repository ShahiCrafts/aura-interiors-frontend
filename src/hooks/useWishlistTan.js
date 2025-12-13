import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wishlistApi from '../store/api/wishlistApi';

const WISHLIST_KEYS = {
  all: ['wishlist'],
  list: () => [...WISHLIST_KEYS.all, 'list'],
  check: (productId) => [...WISHLIST_KEYS.all, 'check', productId],
};

// Get user's wishlist
export const useWishlist = (options = {}) => {
  return useQuery({
    queryKey: WISHLIST_KEYS.list(),
    queryFn: () => wishlistApi.getWishlist(),
    ...options,
  });
};

// Check if product is in wishlist
export const useCheckWishlist = (productId, options = {}) => {
  return useQuery({
    queryKey: WISHLIST_KEYS.check(productId),
    queryFn: () => wishlistApi.checkWishlist(productId),
    enabled: !!productId,
    ...options,
  });
};

// Add product to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => wishlistApi.addToWishlist(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
      queryClient.setQueryData(WISHLIST_KEYS.check(productId), { data: { inWishlist: true } });
    },
  });
};

// Remove product from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
      queryClient.setQueryData(WISHLIST_KEYS.check(productId), { data: { inWishlist: false } });
    },
  });
};

// Clear entire wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
    },
  });
};
