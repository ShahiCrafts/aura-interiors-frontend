import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import orderApi from "../store/api/orderApi";

const ORDER_KEYS = {
  all: ["orders"],
  myOrders: (params) => [...ORDER_KEYS.all, "my", params],
  detail: (id) => [...ORDER_KEYS.all, "detail", id],
  admin: (params) => [...ORDER_KEYS.all, "admin", params],
};

// Guest checkout
export const useGuestCheckout = () => {
  return useMutation({
    mutationFn: (data) => orderApi.guestCheckout(data),
  });
};

// Authenticated checkout
export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderApi.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

// Track order (guest)
export const useTrackOrder = () => {
  return useMutation({
    mutationFn: (data) => orderApi.trackOrder(data),
  });
};

// Get my orders
export const useMyOrders = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ORDER_KEYS.myOrders(params),
    queryFn: () => orderApi.getMyOrders(params),
    ...options,
  });
};

// Get single order
export const useOrder = (id, options = {}) => {
  return useQuery({
    queryKey: ORDER_KEYS.detail(id),
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
    ...options,
  });
};

// ========== ADMIN HOOKS ==========

export const useAllOrders = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ORDER_KEYS.admin(params),
    queryFn: () => orderApi.getAllOrders(params),
    ...options,
  });
};

export const useOrderAdmin = (id, options = {}) => {
  return useQuery({
    queryKey: [...ORDER_KEYS.all, "admin-detail", id],
    queryFn: () => orderApi.getOrderAdmin(id),
    enabled: !!id,
    ...options,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => orderApi.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => orderApi.cancelOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
