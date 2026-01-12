import api from './index';

export const blogApi = {
    // Get all blogs
    getAll: async (params = {}) => {
        const response = await api.get('/blogs', { params });
        return response.data;
    },

    // Get single blog by ID or slug
    getById: async (id) => {
        const response = await api.get(`/blogs/${id}`);
        return response.data;
    },

    // Get blog categories with counts
    getCategories: async () => {
        const response = await api.get('/blogs/categories');
        return response.data;
    },

    // Get popular blogs
    getPopular: async (limit = 5) => {
        const response = await api.get('/blogs/popular', { params: { limit } });
        return response.data;
    },

    // Get featured blogs
    getFeatured: async (limit = 3) => {
        const response = await api.get('/blogs/featured', { params: { limit } });
        return response.data;
    },

    // Get related blogs
    getRelated: async (id, limit = 3) => {
        const response = await api.get(`/blogs/${id}/related`, { params: { limit } });
        return response.data;
    },

    // Like a blog (simple increment)
    toggleLike: async (id) => {
        const response = await api.post(`/blogs/${id}/like`);
        return response.data;
    },

    // Get feed sources
    getSources: async () => {
        const response = await api.get('/blogs/sources');
        return response.data;
    },

    // Get blog stats
    getStats: async () => {
        const response = await api.get('/blogs/stats');
        return response.data;
    },
};

export default blogApi;
