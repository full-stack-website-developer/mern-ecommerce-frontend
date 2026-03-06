import apiClient, { ApiError } from "../api/api.client";
import { API_ENDPOINTS } from "../api/api.config";

class CartService {
    async create(payload) {
        try {
            const res = await apiClient.post(API_ENDPOINTS.CART, payload);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async bulkCreate(payload) {
        try {
            const res = await apiClient.post(`${API_ENDPOINTS.CART}/merge`, payload);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getByUserId(id) {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.CART}/${id}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async preview(payload) {
        try {
            const res = await apiClient.post(`${API_ENDPOINTS.CART}/preview`, payload);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(id) {
        try {
            const res = await apiClient.delete(`${API_ENDPOINTS.CART}/${id}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async clear(userId) {
        try {
            const res = await apiClient.delete(`${API_ENDPOINTS.CART}/clear/${userId}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateQuantity(itemId, userId, quantity) {
        try {
            const res = await apiClient.patch(`${API_ENDPOINTS.CART}/${itemId}`, { userId, quantity });
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error instanceof ApiError) {
            return error;
        }
        return new ApiError('An unexpected error occurred', 500, error);
    }
}

export default new CartService();