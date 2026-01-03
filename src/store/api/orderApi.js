import api from "./api";

const orderApi = {
  // Guest checkout
  guestCheckout: async (data) => {
    const response = await api.post("/orders/guest-checkout", data);
    return response.data;
  },

  // Authenticated checkout
  checkout: async (data) => {
    const response = await api.post("/orders/checkout", data);
    return response.data;
  },

  // Track order (guest)
  trackOrder: async ({ orderId, email }) => {
    const response = await api.post("/orders/track", { orderId, email });
    return response.data;
  },

  // Get my orders (authenticated)
  getMyOrders: async (params = {}) => {
    const response = await api.get("/orders/my-orders", { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // ========== ADMIN ==========

  // Get all orders (admin)
  getAllOrders: async (params = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  // Get order details (admin)
  getOrderAdmin: async (id) => {
    const response = await api.get(`/orders/admin/${id}`);
    return response.data;
  },

  // Update order status (admin)
  updateOrderStatus: async (id, data) => {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
  },

  // Cancel order (user)
  cancelOrder: async (id, data) => {
    const response = await api.patch(`/orders/${id}/cancel`, data);
    return response.data;
  },

  // Request return (user)
  requestReturn: async (id, data) => {
    const response = await api.post(`/orders/${id}/return`, data);
    return response.data;
  },

  // Process return request (admin)
  processReturnRequest: async (id, data) => {
    const response = await api.patch(`/orders/${id}/return`, data);
    return response.data;
  },
};

export default orderApi;
