import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import categoryApi from "../store/api/categoryApi";

const CATEGORY_KEYS = {
  all: ["categories"],
  list: (params) => [...CATEGORY_KEYS.all, "list", params],
  tree: () => [...CATEGORY_KEYS.all, "tree"],
  detail: (id) => [...CATEGORY_KEYS.all, "detail", id],
  products: (id, params) => [...CATEGORY_KEYS.all, "products", id, params],
};

export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: () => categoryApi.getAll(params),
  });
};

export const useCategoryTree = () => {
  return useQuery({
    queryKey: CATEGORY_KEYS.tree(),
    queryFn: () => categoryApi.getTree(),
  });
};

export const useCategory = (id, options = {}) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCategoryProducts = (id, params = {}) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.products(id, params),
    queryFn: () => categoryApi.getProducts(id, params),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.detail(id) });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};
