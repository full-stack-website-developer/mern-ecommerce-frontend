import apiClient, { ApiError } from '../api/api.client';
import { API_ENDPOINTS } from '../api/api.config';

const BASE = API_ENDPOINTS.DASHBOARD.BASE;

class DashboardService {
    getPublicCms() {
        return apiClient.get(`${BASE}/public/cms`);
    }

    getPublicPlatformSettings() {
        return apiClient.get(`${BASE}/public/platform-settings`);
    }

    getPublicSellerProfile(sellerId) {
        return apiClient.get(`${BASE}/public/sellers/${sellerId}/profile`);
    }

    getNotifications() {
        return apiClient.get(`${BASE}/notifications`);
    }

    markNotificationRead(notificationId) {
        return apiClient.patch(`${BASE}/notifications/${notificationId}/read`, {});
    }

    markAllNotificationsRead() {
        return apiClient.patch(`${BASE}/notifications/read-all`, {});
    }

    getUserTickets() {
        return apiClient.get(`${BASE}/user/support-tickets`);
    }

    createUserTicket(payload) {
        return apiClient.post(`${BASE}/user/support-tickets`, payload);
    }

    getReturnRequests() {
        return apiClient.get(`${BASE}/user/return-requests`);
    }

    createReturnRequest(payload) {
        return apiClient.post(`${BASE}/user/return-requests`, payload);
    }

    createReturnRequestDispute(requestId, payload) {
        return apiClient.post(`${BASE}/user/return-requests/${requestId}/dispute`, payload);
    }

    getWishlist() {
        return apiClient.get(`${BASE}/user/wishlist`);
    }

    addWishlistItem(payload) {
        return apiClient.post(`${BASE}/user/wishlist`, payload);
    }

    removeWishlistItem(productId) {
        return apiClient.delete(`${BASE}/user/wishlist/${productId}`);
    }

    clearWishlist() {
        return apiClient.delete(`${BASE}/user/wishlist`);
    }

    getSavedForLater() {
        return apiClient.get(`${BASE}/user/save-for-later`);
    }

    addSavedForLaterItem(payload) {
        return apiClient.post(`${BASE}/user/save-for-later`, payload);
    }

    removeSavedForLaterItem(productId) {
        return apiClient.delete(`${BASE}/user/save-for-later/${productId}`);
    }

    clearSavedForLater() {
        return apiClient.delete(`${BASE}/user/save-for-later`);
    }

    getAdminTickets(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiClient.get(`${BASE}/admin/support-tickets${qs ? `?${qs}` : ''}`);
    }

    updateAdminTicket(ticketId, payload) {
        return apiClient.patch(`${BASE}/admin/support-tickets/${ticketId}`, payload);
    }

    getAdminDisputes(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiClient.get(`${BASE}/admin/disputes${qs ? `?${qs}` : ''}`);
    }

    updateAdminDispute(disputeId, payload) {
        return apiClient.patch(`${BASE}/admin/disputes/${disputeId}`, payload);
    }

    getAdminReturnRequests(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiClient.get(`${BASE}/admin/return-requests${qs ? `?${qs}` : ''}`);
    }

    interveneInReturnRequest(requestId, payload) {
        return apiClient.patch(`${BASE}/admin/return-requests/${requestId}/intervene`, payload);
    }

    getAdminSettings() {
        return apiClient.get(`${BASE}/admin/settings`);
    }

    getAdminCoupons() {
        return apiClient.get(`${BASE}/admin/coupons`);
    }

    updateAdminCoupons(coupons) {
        return apiClient.put(`${BASE}/admin/coupons`, { coupons });
    }

    updateAdminSettings(key, payload) {
        return apiClient.put(`${BASE}/admin/settings/${key}`, payload);
    }

    getAdminAnalytics(days = 30) {
        return apiClient.get(`${BASE}/admin/analytics?days=${days}`);
    }

    getSellerSettings() {
        return apiClient.get(`${BASE}/seller/settings`);
    }

    updateSellerProfile(payload) {
        return apiClient.put(`${BASE}/seller/settings/profile`, payload);
    }

    updateSellerPayout(payload) {
        return apiClient.put(`${BASE}/seller/settings/payout`, payload);
    }

    getSellerPayoutSummary() {
        return apiClient.get(`${BASE}/seller/payout/summary`);
    }

    withdrawSellerPayout(payload) {
        return apiClient.post(`${BASE}/seller/payout/withdraw`, payload);
    }

    getSellerAnalytics(days = 30) {
        return apiClient.get(`${BASE}/seller/analytics?days=${days}`);
    }

    getSellerReturnRequests(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiClient.get(`${BASE}/seller/return-requests${qs ? `?${qs}` : ''}`);
    }

    decideSellerReturnRequest(requestId, payload) {
        return apiClient.patch(`${BASE}/seller/return-requests/${requestId}/decision`, payload);
    }

    handleError(error) {
        if (error instanceof ApiError) return error;
        return new ApiError('An unexpected error occurred', 500, error);
    }
}

export default new DashboardService();
