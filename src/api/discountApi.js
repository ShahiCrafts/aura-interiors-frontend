import api from "./index";

const discountApi = {
    // ========== ADMIN OPERATIONS ==========

    // Get all discounts (Admin)
    getAll: async (params = {}) => {
        const response = await api.get("/discounts", { params });
        return response.data;
    },

    // Get single discount (Admin)
    getById: async (id) => {
        const response = await api.get(`/discounts/${id}`);
        return response.data;
    },

    // Create discount (Admin)
    create: async (data) => {
        const response = await api.post("/discounts", data);
        return response.data;
    },

    // Update discount (Admin)
    update: async (id, data) => {
        const response = await api.patch(`/discounts/${id}`, data);
        return response.data;
    },

    // Delete discount (Admin)
    delete: async (id) => {
        const response = await api.delete(`/discounts/${id}`);
        return response.data;
    },

    // ========== USER OPERATIONS ==========

    // Apply discount to cart (User)
    apply: async (code) => {
        const response = await api.post("/discounts/apply", { code });
        return response.data;
    },

    // Validate discount code (User)
    validate: async (code) => {
        const response = await api.get(`/discounts/validate/${code}`);
        return response.data;
    },
};

export default discountApi;
