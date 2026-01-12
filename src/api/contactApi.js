import api from './index';

export const contactApi = {
    // Public: Submit contact form
    submit: async (data) => {
        const response = await api.post('/contacts', data);
        return response.data;
    },

    // Admin: Get all contacts
    getAll: async (params = {}) => {
        const response = await api.get('/contacts', { params });
        return response.data;
    },

    // Admin: Get single contact
    getById: async (id) => {
        const response = await api.get(`/contacts/${id}`);
        return response.data;
    },

    // Admin: Update contact
    update: async (id, data) => {
        const response = await api.patch(`/contacts/${id}`, data);
        return response.data;
    },

    // Admin: Mark as read/unread
    markAsRead: async (id, isRead = true) => {
        const response = await api.patch(`/contacts/${id}/read`, { isRead });
        return response.data;
    },

    // Admin: Respond to contact
    respond: async (id, message) => {
        const response = await api.post(`/contacts/${id}/respond`, { message });
        return response.data;
    },

    // Admin: Delete contact
    delete: async (id) => {
        const response = await api.delete(`/contacts/${id}`);
        return response.data;
    },

    // Admin: Bulk update
    bulkUpdate: async (ids, data) => {
        const response = await api.patch('/contacts/bulk/update', { ids, ...data });
        return response.data;
    },

    // Admin: Get stats
    getStats: async () => {
        const response = await api.get('/contacts/stats');
        return response.data;
    },
};

export default contactApi;
