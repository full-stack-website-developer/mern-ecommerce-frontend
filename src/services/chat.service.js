import apiClient from '../api/api.client';

const BASE = '/chat';

const chatService = {
    startConversation: (sellerId, subject = '', orderId = null) =>
        apiClient.post(`${BASE}/conversations`, { sellerId, subject, orderId }),

    // Smart endpoint - works for both buyers and sellers
    getMyConversations: (page = 1, limit = 30) =>
        apiClient.get(`${BASE}/conversations/me?page=${page}&limit=${limit}`),

    // Role-specific (kept for backwards compat)
    getUserConversations: (page = 1, limit = 30) =>
        apiClient.get(`${BASE}/conversations/user?page=${page}&limit=${limit}`),

    getSellerConversations: (page = 1, limit = 30) =>
        apiClient.get(`${BASE}/conversations/seller?page=${page}&limit=${limit}`),

    getConversationById: (id) =>
        apiClient.get(`${BASE}/conversations/${id}`),

    getMessages: (conversationId, page = 1, limit = 50) =>
        apiClient.get(`${BASE}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),

    sendMessage: (conversationId, body) =>
        apiClient.post(`${BASE}/conversations/${conversationId}/messages`, { body }),

    sendMessageWithFile: (conversationId, formData) =>
        apiClient.post(`${BASE}/conversations/${conversationId}/messages`, formData),

    markRead: (conversationId) =>
        apiClient.patch(`${BASE}/conversations/${conversationId}/read`, {}),

    reactToMessage: (messageId, emoji, conversationId) =>
        apiClient.post(`${BASE}/messages/${messageId}/react`, { emoji, conversationId }),

    removeReaction: (messageId, conversationId) =>
        apiClient.delete(`${BASE}/messages/${messageId}/react`, { body: JSON.stringify({ conversationId }) }),

    deleteMessage: (messageId, conversationId) =>
        apiClient.delete(`${BASE}/messages/${messageId}`, { body: JSON.stringify({ conversationId }) }),

    getUnreadCount: () =>
        apiClient.get(`${BASE}/unread-count`),
};

export default chatService;