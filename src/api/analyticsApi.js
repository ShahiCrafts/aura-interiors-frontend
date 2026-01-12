import api from './index';

const analyticsApi = {
    getStats: async () => {
        const response = await api.get('/analytics/stats');
        return response.data;
    },
    getRevenue: async (days) => {
        const response = await api.get('/analytics/revenue', { params: { days } });
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get('/analytics/categories');
        return response.data;
    },
    getTopProducts: async () => {
        const response = await api.get('/analytics/top-products');
        return response.data;
    },
    getSalesReports: async (range) => {
        const response = await api.get('/analytics/sales-reports', { params: { range } });
        return response.data;
    }
};

export default analyticsApi;
