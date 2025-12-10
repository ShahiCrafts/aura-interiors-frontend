import api from './api';

export const categoryApi = {
  // Get all categories
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Get category tree
  getTree: async () => {
    const response = await api.get('/categories', { params: { tree: 'true' } });
    return response.data;
  },

  // Get single category by ID or slug
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Get category products
  getProducts: async (id, params = {}) => {
    const response = await api.get(`/categories/${id}/products`, { params });
    return response.data;
  },

  // Create category (Admin)
  create: async (data) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key]);
      } else if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });

    const response = await api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update category (Admin)
  update: async (id, data) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key]);
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const response = await api.patch(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete category (Admin)
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryApi;
