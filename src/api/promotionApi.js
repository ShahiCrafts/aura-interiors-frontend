import api from "./index";

const promotionApi = {
    // ========== ADMIN OPERATIONS ==========

    // Get all promotions (Admin)
    getAll: async (params = {}) => {
        const response = await api.get("/promotions", { params });
        return response.data;
    },

    // Get single promotion (Admin)
    getById: async (id) => {
        const response = await api.get(`/promotions/${id}`);
        return response.data;
    },

    // Create promotion (Admin)
    create: async (data) => {
        const response = await api.post("/promotions", data);
        return response.data;
    },

    // Update promotion (Admin)
    update: async (id, data) => {
        const response = await api.patch(`/promotions/${id}`, data);
        return response.data;
    },

    // Delete promotion (Admin)
    delete: async (id) => {
        const response = await api.delete(`/promotions/${id}`);
        return response.data;
    },

    // Send promotion immediately (Admin)
    send: async (id) => {
        const response = await api.post(`/promotions/${id}/send`);
        return response.data;
    },

    // Schedule promotion (Admin)
    schedule: async (id, scheduledAt) => {
        const response = await api.post(`/promotions/${id}/schedule`, { scheduledAt });
        return response.data;
    },

    // Cancel promotion (Admin)
    cancel: async (id) => {
        const response = await api.post(`/promotions/${id}/cancel`);
        return response.data;
    },

    // Get promotion analytics (Admin)
    getAnalytics: async (id) => {
        const response = await api.get(`/promotions/${id}/analytics`);
        return response.data;
    },

    // Preview target audience count (Admin)
    preview: async (targetAudience) => {
        const response = await api.post("/promotions/preview", { targetAudience });
        return response.data;
    },

    // ========== USER OPERATIONS ==========

    // Track engagement (User)
    trackEngagement: async (promotionId, action) => {
        const response = await api.post("/promotions/track", { promotionId, action });
        return response.data;
    },
};

export default promotionApi;
