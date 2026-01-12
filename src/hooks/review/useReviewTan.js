import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reviewApi from "../../api/reviewApi";

const REVIEW_KEYS = {
  all: ['reviews'],
  productReviews: (productId, params) => [...REVIEW_KEYS.all, 'product', productId, params],
  userReview: (productId) => [...REVIEW_KEYS.all, 'user', productId],
  canReview: (productId) => [...REVIEW_KEYS.all, 'canReview', productId],
  adminList: (params) => [...REVIEW_KEYS.all, 'admin', params],
};

// Get reviews for a product
export const useProductReviews = (productId, params = {}) => {
  return useQuery({
    queryKey: REVIEW_KEYS.productReviews(productId, params),
    queryFn: () => reviewApi.getProductReviews(productId, params),
    enabled: !!productId,
  });
};

// Get user's review for a product
export const useUserReview = (productId) => {
  return useQuery({
    queryKey: REVIEW_KEYS.userReview(productId),
    queryFn: () => reviewApi.getUserReview(productId),
    enabled: !!productId,
  });
};

// Check if user can review
export const useCanReview = (productId, options = {}) => {
  return useQuery({
    queryKey: REVIEW_KEYS.canReview(productId),
    queryFn: () => reviewApi.canReview(productId),
    enabled: !!productId,
    ...options,
  });
};

// Create review mutation
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }) => reviewApi.create(productId, data),
    onSuccess: (_, { productId }) => {
      // Invalidate all review-related queries for this product
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.productReviews(productId, {}) });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.userReview(productId) });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.canReview(productId) });
      // Also invalidate the product query to update rating
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', productId] });
    },
  });
};

// Update review mutation
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewId, data }) =>
      reviewApi.update(productId, reviewId, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.productReviews(productId, {}) });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.userReview(productId) });
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', productId] });
    },
  });
};

// Delete review mutation
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewId }) => reviewApi.delete(productId, reviewId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.productReviews(productId, {}) });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.userReview(productId) });
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.canReview(productId) });
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', productId] });
    },
  });
};

// Mark review as helpful mutation
export const useMarkHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, reviewId }) => reviewApi.markHelpful(productId, reviewId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.productReviews(productId, {}) });
    },
  });
};

// Admin: Get all reviews
export const useAllReviews = (params = {}) => {
  return useQuery({
    queryKey: REVIEW_KEYS.adminList(params),
    queryFn: () => reviewApi.getAllReviews(params),
  });
};

// Admin: Add response mutation
export const useAddAdminResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, comment }) => reviewApi.addAdminResponse(reviewId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};

// Admin: Toggle approval mutation
export const useToggleApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId) => reviewApi.toggleApproval(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};

// Admin: Delete review mutation
export const useAdminDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId) => reviewApi.adminDeleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};

export default {
  useProductReviews,
  useUserReview,
  useCanReview,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useMarkHelpful,
  useAllReviews,
  useAddAdminResponse,
  useToggleApproval,
  useAdminDeleteReview,
};
