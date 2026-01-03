import api from './api';

export const reviewApi = {
  // Get all reviews for a product
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  // Get user's review for a product
  getUserReview: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/my-review`);
    return response.data;
  },

  // Check if user can review a product
  canReview: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews/can-review`);
    return response.data;
  },

  // Create a new review
  create: async (productId, data) => {
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  // Update a review
  update: async (productId, reviewId, data) => {
    const response = await api.patch(`/products/${productId}/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  delete: async (productId, reviewId) => {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (productId, reviewId) => {
    const response = await api.post(`/products/${productId}/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Admin: Get all reviews
  getAllReviews: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  // Admin: Add response to review
  addAdminResponse: async (reviewId, comment) => {
    const response = await api.post(`/reviews/${reviewId}/response`, { comment });
    return response.data;
  },

  // Admin: Toggle review approval
  toggleApproval: async (reviewId) => {
    const response = await api.patch(`/reviews/${reviewId}/toggle-approval`);
    return response.data;
  },

  // Admin: Delete review
  adminDeleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default reviewApi;
