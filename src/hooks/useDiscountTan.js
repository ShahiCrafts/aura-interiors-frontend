import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import discountApi from "../store/api/discountApi";

const DISCOUNT_KEYS = {
  all: ["discounts"],
  list: (params) => [...DISCOUNT_KEYS.all, "list", params],
  detail: (id) => [...DISCOUNT_KEYS.all, "detail", id],
  applied: ["discount", "applied"],
};

export const useDiscounts = (params = {}) => {
  return useQuery({
    queryKey: DISCOUNT_KEYS.list(params),
    queryFn: () => discountApi.getAll(params),
  });
};

// Get single discount (Admin)
export const useDiscount = (id, options = {}) => {
  return useQuery({
    queryKey: DISCOUNT_KEYS.detail(id),
    queryFn: () => discountApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Create discount (Admin)
export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => discountApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
    },
  });
};

// Update discount (Admin)
export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => discountApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.detail(id) });
    },
  });
};

// Delete discount (Admin)
export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => discountApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
    },
  });
};

// Apply discount to cart (User)
export const useApplyDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code) => discountApi.apply(code),
    onSuccess: (data) => {
      queryClient.setQueryData(DISCOUNT_KEYS.applied, data);
    },
  });
};

// Validate discount code (User)
export const useValidateDiscount = (code, options = {}) => {
  return useQuery({
    queryKey: ["discount", "validate", code],
    queryFn: () => discountApi.validate(code),
    enabled: !!code && code.length >= 3,
    ...options,
  });
};

// Get currently applied discount from cache
export const useAppliedDiscount = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(DISCOUNT_KEYS.applied);
};

// Clear applied discount
export const useClearAppliedDiscount = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: DISCOUNT_KEYS.applied });
  };
};
