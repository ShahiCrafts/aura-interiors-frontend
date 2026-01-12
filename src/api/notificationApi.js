import api from "./index";

const notificationApi = {
    // ==================== IN-APP NOTIFICATIONS ====================

    /**
     * Fetch user notifications
     */
    getNotifications: async (page = 1, limit = 20, filters = {}) => {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters,
        });

        const response = await api.get(`/notifications?${params.toString()}`);
        return response.data;
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async () => {
        const response = await api.get(`/notifications/unread-count`);
        return response.data;
    },

    /**
     * Get notification detail
     */
    getNotificationDetail: async (id) => {
        const response = await api.get(`/notifications/${id}`);
        return response.data;
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`, {});
        return response.data;
    },

    /**
     * Mark multiple notifications as read
     */
    markMultipleAsRead: async (notificationIds) => {
        const response = await api.post(`/notifications/mark-multiple-read`, { notificationIds });
        return response.data;
    },

    /**
     * Archive notification
     */
    archiveNotification: async (id) => {
        const response = await api.put(`/notifications/${id}/archive`, {});
        return response.data;
    },

    /**
     * Archive multiple notifications
     */
    archiveMultiple: async (notificationIds) => {
        const response = await api.post(`/notifications/archive-multiple`, { notificationIds });
        return response.data;
    },

    // ==================== PUSH TOKENS ====================

    /**
     * Register device for push notifications
     */
    registerPushToken: async (tokenData) => {
        const response = await api.post(`/notifications/push-tokens/register`, tokenData);
        return response.data;
    },

    /**
     * Get user's registered devices
     */
    getUserDevices: async () => {
        const response = await api.get(`/notifications/push-tokens/devices`);
        return response.data;
    },

    /**
     * Unregister device
     */
    unregisterDevice: async (deviceId) => {
        const response = await api.delete(`/notifications/push-tokens/${deviceId}`);
        return response.data;
    },

    // ==================== PREFERENCES ====================

    /**
     * Get notification preferences
     */
    getPreferences: async () => {
        const response = await api.get(`/notifications/preferences`);
        return response.data;
    },

    /**
     * Update notification preferences
     */
    updatePreferences: async (preferences) => {
        const response = await api.put(`/notifications/preferences`, preferences);
        return response.data;
    },
};

export default notificationApi;
