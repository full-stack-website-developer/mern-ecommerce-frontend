// import apiClient, { ApiError } from '../api/api.client';
// import { API_ENDPOINTS } from '../api/api.config';

// // ─────────────────────────────────────────────────────────────────────────────
// //  Checkout Service
// //  All API calls related to checkout and payments.
// // ─────────────────────────────────────────────────────────────────────────────

// class OrderService {
//     async getOrders(params = {}) {
//         try {
//             const query = new URLSearchParams();
//             Object.entries(params).forEach(([key, value]) => {
//                 if (value !== undefined && value !== null && value !== '') {
//                     query.set(key, String(value));
//                 }
//             });
//             const suffix = query.toString() ? `?${query.toString()}` : '';
//             return await apiClient.get(`${API_ENDPOINTS.ORDERS}${suffix}`);
//         } catch (error) {
//             throw this._handleError(error);
//         }
//     }

//     async updateFulfillmentStatus(orderId, payload) {
//         try {
//             return await apiClient.patch(`${API_ENDPOINTS.ORDERS}/${orderId}/fulfillment`, payload);
//         } catch (error) {
//             throw this._handleError(error);
//         }
//     }

//     async updatePaymentStatus(orderId, paymentStatus) {
//         try {
//             return await apiClient.patch(`${API_ENDPOINTS.ORDERS}/${orderId}/payment-status`, { paymentStatus });
//         } catch (error) {
//             throw this._handleError(error);
//         }
//     }

//     async updateOrderStatus(orderId, status) {
//         try {
//             return await apiClient.patch(`${API_ENDPOINTS.ORDERS}/${orderId}/status`, { status });
//         } catch (error) {
//             throw this._handleError(error);
//         }
//     }

//     _handleError(error) {
//         if (error instanceof ApiError) return error;
//         return new ApiError('An unexpected error occurred', 500, error);
//     }
// }

// export default new OrderService();

import apiClient, { ApiError } from '../api/api.client';
import { API_ENDPOINTS } from '../api/api.config';

// ─────────────────────────────────────────────────────────────────────────────
//  OrderService — all order-related API calls
// ─────────────────────────────────────────────────────────────────────────────

class OrderService {

    // List orders — role is inferred from the JWT on the backend
    // Supports query filters: status, paymentStatus, fulfillmentStatus, search, page, limit
    async getOrders(params = {}) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, v); });
        const qs = query.toString();
        return apiClient.get(`${API_ENDPOINTS.ORDERS}${qs ? `?${qs}` : ''}`);
    }

    // Single order — works for all roles (seller sees their sub-order, admin sees full)
    async getOrderById(id) {
        return apiClient.get(`${API_ENDPOINTS.ORDERS}/${id}`);
    }

    // Seller: update fulfillment status for their sub-order
    // body: { fulfillmentStatus, trackingNumber?, carrier?, sellerNote? }
    async updateFulfillment(orderId, subOrderId, body) {
        return apiClient.patch(
            `${API_ENDPOINTS.ORDERS}/${orderId}/suborders/${subOrderId}/fulfillment`,
            body
        );
    }

    // Admin: update global order status or payment status
    // body: { status?, paymentStatus?, adminNote? }
    async adminUpdateOrderStatus(orderId, body) {
        return apiClient.patch(
            `${API_ENDPOINTS.ORDERS}/${orderId}/status`,
            body
        );
    }

    _handleError(error) {
        if (error instanceof ApiError) return error;
        return new ApiError('An unexpected error occurred', 500, error);
    }
}

export default new OrderService();