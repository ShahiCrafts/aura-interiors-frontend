import api from './index';

export const startChat = async (data) => {
    const response = await api.post('/chats', data);
    return response.data;
};

export const getMyChats = async ({ page = 1, limit = 20, status } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);

    const response = await api.get(`/chats/my?${params}`);
    return response.data;
};

export const getChatDetails = async (chatId) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
};

export const getChatMessages = async ({ chatId, page = 1, limit = 50 }) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    const response = await api.get(`/chats/${chatId}/messages?${params}`);
    return response.data;
};

export const sendMessage = async ({ chatId, content, attachments }) => {
    if (attachments && attachments.length > 0) {
        const formData = new FormData();

        if (content) {
            formData.append('content', content);
        }

        attachments.forEach((file) => {
            formData.append('attachments', file);
        });

        const response = await api.post(`/chats/${chatId}/messages`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    const response = await api.post(`/chats/${chatId}/messages`, { content });
    return response.data;
};

export const markMessagesAsRead = async (chatId) => {
    const response = await api.patch(`/chats/${chatId}/read`);
    return response.data;
};

export const closeChat = async (chatId) => {
    const response = await api.patch(`/chats/${chatId}/close`);
    return response.data;
};

export const getAllChats = async ({ page = 1, limit = 20, status, priority, sortBy = 'lastMessageAt' } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    params.append('sortBy', sortBy);

    const response = await api.get(`/chats/admin/all?${params}`);
    return response.data;
};

export const getWaitingQueue = async () => {
    const response = await api.get('/chats/admin/queue');
    return response.data;
};

export const resolveChat = async (chatId) => {
    const response = await api.patch(`/chats/${chatId}/resolve`);
    return response.data;
};

export const getChatStats = async () => {
    const response = await api.get('/chats/admin/stats');
    return response.data;
};
