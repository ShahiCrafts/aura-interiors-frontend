import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import promotionApi from "../../api/promotionApi";

const PROMOTION_KEYS = {
  all: ["promotions"],
  list: (params) => [...PROMOTION_KEYS.all, "list", params],
  detail: (id) => [...PROMOTION_KEYS.all, "detail", id],
  analytics: (id) => [...PROMOTION_KEYS.all, "analytics", id],
};

// Get all promotions (Admin)
export const usePromotions = (params = {}) => {
  return useQuery({
    queryKey: PROMOTION_KEYS.list(params),
    queryFn: () => promotionApi.getAll(params),
  });
};

// Get single promotion (Admin)
export const usePromotion = (id, options = {}) => {
  return useQuery({
    queryKey: PROMOTION_KEYS.detail(id),
    queryFn: () => promotionApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Get promotion analytics (Admin)
export const usePromotionAnalytics = (id, options = {}) => {
  return useQuery({
    queryKey: PROMOTION_KEYS.analytics(id),
    queryFn: () => promotionApi.getAnalytics(id),
    enabled: !!id,
    ...options,
  });
};

// Create promotion (Admin)
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => promotionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.all });
    },
  });
};

// Update promotion (Admin)
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => promotionApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.detail(id) });
    },
  });
};

// Delete promotion (Admin)
export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => promotionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.all });
    },
  });
};

// Send promotion (Admin)
export const useSendPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => promotionApi.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.detail(id) });
    },
  });
};

// Schedule promotion (Admin)
export const useSchedulePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledAt }) => promotionApi.schedule(id, scheduledAt),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.detail(id) });
    },
  });
};

// Cancel promotion (Admin)
export const useCancelPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => promotionApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PROMOTION_KEYS.detail(id) });
    },
  });
};

// Preview target audience (Admin)
export const usePreviewAudience = () => {
  return useMutation({
    mutationFn: (targetAudience) => promotionApi.preview(targetAudience),
  });
};

// Track engagement (User) - called when user views/clicks promotional notification
export const useTrackEngagement = () => {
  return useMutation({
    mutationFn: ({ promotionId, action }) =>
      promotionApi.trackEngagement(promotionId, action),
  });
};
