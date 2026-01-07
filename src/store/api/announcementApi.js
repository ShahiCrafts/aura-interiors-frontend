import api from "./api";

const announcementApi = {
  // ==================== ADMIN OPERATIONS ====================

  // Get all announcements (Admin)
  getAll: async (params = {}) => {
    const response = await api.get("/announcements", { params });
    return response.data;
  },

  // Get single announcement (Admin)
  getById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  // Create announcement (Admin)
  create: async (data) => {
    const response = await api.post("/announcements", data);
    return response.data;
  },

  // Update announcement (Admin)
  update: async (id, data) => {
    const response = await api.patch(`/announcements/${id}`, data);
    return response.data;
  },

  // Delete announcement (Admin)
  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },

  // Publish announcement immediately (Admin)
  publish: async (id) => {
    const response = await api.post(`/announcements/${id}/publish`);
    return response.data;
  },

  // Schedule announcement (Admin)
  schedule: async (id, scheduledAt) => {
    const response = await api.post(`/announcements/${id}/schedule`, { scheduledAt });
    return response.data;
  },

  // Archive announcement (Admin)
  archive: async (id) => {
    const response = await api.post(`/announcements/${id}/archive`);
    return response.data;
  },

  // Get announcement statistics (Admin)
  getStats: async () => {
    const response = await api.get("/announcements/stats");
    return response.data;
  },

  // ==================== PUBLIC OPERATIONS ====================

  // Get active announcements for users (Public)
  getPublic: async (params = {}) => {
    const response = await api.get("/announcements/public", { params });
    return response.data;
  },

  // Get single public announcement (Public)
  getPublicById: async (id) => {
    const response = await api.get(`/announcements/public/${id}`);
    return response.data;
  },
};

export default announcementApi;
