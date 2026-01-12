import api from './index';

export const productApi = {
    // Get all products with filtering
    getAll: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    // Get single product by ID or slug
    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Get featured products
    getFeatured: async (limit = 8) => {
        const response = await api.get('/products/featured', { params: { limit } });
        return response.data;
    },

    // Get new arrivals
    getNewArrivals: async (limit = 8) => {
        const response = await api.get('/products/new-arrivals', { params: { limit } });
        return response.data;
    },

    // Get related products
    getRelated: async (id, limit = 4) => {
        const response = await api.get(`/products/${id}/related`, { params: { limit } });
        return response.data;
    },

    // Create product (Admin)
    create: async (data) => {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if (key === 'images' && Array.isArray(data[key])) {
                data[key].forEach(file => {
                    if (file instanceof File) {
                        formData.append('images', file);
                    }
                });
            } else if (key === 'modelFiles' && Array.isArray(data[key])) {
                data[key].forEach(file => {
                    if (file instanceof File) {
                        formData.append('modelFiles', file);
                    }
                });
            } else if (key === 'modelUrls' && Array.isArray(data[key])) {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key === 'dimensions' || key === 'weight' || key === 'colors' || key === 'materials' || key === 'tags') {
                if (data[key]) {
                    formData.append(key, JSON.stringify(data[key]));
                }
            } else if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        const response = await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Update product (Admin)
    update: async (id, data) => {
        const formData = new FormData();

        Object.keys(data).forEach(key => {
            if (key === 'images' && Array.isArray(data[key])) {
                data[key].forEach(file => {
                    if (file instanceof File) {
                        formData.append('images', file);
                    }
                });
            } else if (key === 'modelFiles' && Array.isArray(data[key])) {
                data[key].forEach(file => {
                    if (file instanceof File) {
                        formData.append('modelFiles', file);
                    }
                });
            } else if (key === 'modelUrls' && Array.isArray(data[key])) {
                formData.append(key, JSON.stringify(data[key]));
            } else if ((key === 'removeImages' || key === 'removeModelFiles') && Array.isArray(data[key])) {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key === 'dimensions' || key === 'weight' || key === 'colors' || key === 'materials' || key === 'tags') {
                if (data[key]) {
                    formData.append(key, JSON.stringify(data[key]));
                }
            } else if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });

        const response = await api.patch(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Delete product - soft delete (Admin)
    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    // Hard delete product (Admin)
    hardDelete: async (id) => {
        const response = await api.delete(`/products/${id}/permanent`);
        return response.data;
    },

    // Set primary image (Admin)
    setPrimaryImage: async (id, imageId) => {
        const response = await api.patch(`/products/${id}/primary-image`, { imageId });
        return response.data;
    },

    // Update stock (Admin)
    updateStock: async (id, stock) => {
        const response = await api.patch(`/products/${id}/stock`, { stock });
        return response.data;
    },
};

export default productApi;
