import api from './index';

const cartApi = {
    // Get user's cart
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    // Add item to cart
    addToCart: async ({ productId, quantity = 1, variant = {} }) => {
        const response = await api.post('/cart', { productId, quantity, variant });
        return response.data;
    },

    // Update cart item quantity
    updateCartItem: async ({ itemId, quantity }) => {
        const response = await api.patch(`/cart/items/${itemId}`, { quantity });
        return response.data;
    },

    // Remove item from cart
    removeFromCart: async (itemId) => {
        const response = await api.delete(`/cart/items/${itemId}`);
        return response.data;
    },

    // Clear entire cart
    clearCart: async () => {
        const response = await api.delete('/cart');
        return response.data;
    },
};

export default cartApi;
