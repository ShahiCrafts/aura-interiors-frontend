import api from './index';

/**
 * Subscribe to newsletter
 * @param {string} email - Email address
 * @param {string} source - Source of subscription ('footer' or 'blog')
 * @returns {Promise} API response
 */
export const subscribeNewsletter = async (data) => {
    const { email, source = 'footer' } = data;
    const response = await api.post('/newsletter/subscribe', { email, source });
    return response.data;
};

/**
 * Unsubscribe from newsletter
 * @param {string} email - Email address
 * @returns {Promise} API response
 */
export const unsubscribeNewsletter = async (email) => {
    const response = await api.post('/newsletter/unsubscribe', { email });
    return response.data;
};

/**
 * Get all newsletter subscribers (Admin only)
 * @param {object} params - Query parameters { page, limit, isActive }
 * @returns {Promise} API response
 */
export const getNewsletterSubscribers = async (params) => {
    const response = await api.get('/newsletter/subscribers', { params });
    return response.data;
};

/**
 * Send trend email to all subscribers (Admin only)
 * @param {object} data - Email data { subject, htmlContent, textContent }
 * @returns {Promise} API response
 */
export const sendTrendEmail = async (data) => {
    const response = await api.post('/newsletter/send-trend', data);
    return response.data;
};

/**
 * Get newsletter statistics (Admin only)
 * @returns {Promise} API response
 */
export const getNewsletterStats = async () => {
    const response = await api.get('/newsletter/stats');
    return response.data;
};
