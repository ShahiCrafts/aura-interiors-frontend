import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import blogApi from "../../api/blogApi";

const BLOG_KEYS = {
  all: ["blogs"],
  list: (params) => [...BLOG_KEYS.all, "list", params],
  detail: (id) => [...BLOG_KEYS.all, "detail", id],
  categories: () => [...BLOG_KEYS.all, "categories"],
  popular: (limit) => [...BLOG_KEYS.all, "popular", limit],
  featured: (limit) => [...BLOG_KEYS.all, "featured", limit],
  related: (id, limit) => [...BLOG_KEYS.all, "related", id, limit],
};

export const useBlogs = (params = {}) => {
  return useQuery({
    queryKey: BLOG_KEYS.list(params),
    queryFn: () => blogApi.getAll(params),
  });
};

export const useBlog = (id, options = {}) => {
  return useQuery({
    queryKey: BLOG_KEYS.detail(id),
    queryFn: () => blogApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: BLOG_KEYS.categories(),
    queryFn: () => blogApi.getCategories(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const usePopularBlogs = (limit = 5) => {
  return useQuery({
    queryKey: BLOG_KEYS.popular(limit),
    queryFn: () => blogApi.getPopular(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedBlogs = (limit = 3) => {
  return useQuery({
    queryKey: BLOG_KEYS.featured(limit),
    queryFn: () => blogApi.getFeatured(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRelatedBlogs = (id, limit = 3) => {
  return useQuery({
    queryKey: BLOG_KEYS.related(id, limit),
    queryFn: () => blogApi.getRelated(id, limit),
    enabled: !!id,
  });
};

export const useToggleBlogLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => blogApi.toggleLike(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.all });
    },
  });
};

export const useBlogSources = () => {
  return useQuery({
    queryKey: [...BLOG_KEYS.all, "sources"],
    queryFn: () => blogApi.getSources(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useBlogStats = () => {
  return useQuery({
    queryKey: [...BLOG_KEYS.all, "stats"],
    queryFn: () => blogApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
};
