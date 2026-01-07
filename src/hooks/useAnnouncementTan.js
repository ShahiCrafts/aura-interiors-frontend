import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import announcementApi from "../store/api/announcementApi";

const ANNOUNCEMENT_KEYS = {
  all: ["announcements"],
  list: (params) => [...ANNOUNCEMENT_KEYS.all, "list", params],
  detail: (id) => [...ANNOUNCEMENT_KEYS.all, "detail", id],
  stats: () => [...ANNOUNCEMENT_KEYS.all, "stats"],
  public: (params) => [...ANNOUNCEMENT_KEYS.all, "public", params],
  publicDetail: (id) => [...ANNOUNCEMENT_KEYS.all, "public", "detail", id],
};

// ==================== ADMIN HOOKS ====================

// Get all announcements (Admin)
export const useAnnouncements = (params = {}) => {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.list(params),
    queryFn: () => announcementApi.getAll(params),
  });
};

// Get single announcement (Admin)
export const useAnnouncement = (id, options = {}) => {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.detail(id),
    queryFn: () => announcementApi.getById(id),
    enabled: !!id,
    ...options,
  });
};

// Get announcement statistics (Admin)
export const useAnnouncementStats = (options = {}) => {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.stats(),
    queryFn: () => announcementApi.getStats(),
    ...options,
  });
};

// Create announcement (Admin)
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => announcementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all });
    },
  });
};

// Update announcement (Admin)
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => announcementApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.detail(id) });
    },
  });
};

// Delete announcement (Admin)
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => announcementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all });
    },
  });
};

// Publish announcement (Admin)
export const usePublishAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => announcementApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.detail(id) });
    },
  });
};

// Schedule announcement (Admin)
export const useScheduleAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledAt }) => announcementApi.schedule(id, scheduledAt),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.detail(id) });
    },
  });
};

// Archive announcement (Admin)
export const useArchiveAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => announcementApi.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.detail(id) });
    },
  });
};

// ==================== PUBLIC HOOKS ====================

// Get public announcements (User)
export const usePublicAnnouncements = (params = {}) => {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.public(params),
    queryFn: () => announcementApi.getPublic(params),
  });
};

// Get single public announcement (User)
export const usePublicAnnouncement = (id, options = {}) => {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.publicDetail(id),
    queryFn: () => announcementApi.getPublicById(id),
    enabled: !!id,
    ...options,
  });
};
