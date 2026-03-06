import apiClient, { ApiError } from "../api/api.client"
import { API_ENDPOINTS } from "../api/api.config"

class SellerService {
    async register(formData) {
        try {
            const res = await apiClient.post(API_ENDPOINTS.SELLER.REGISTER, formData)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getAll() {
        try {
            const res = await apiClient.get(API_ENDPOINTS.SELLER.ALL)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateSellerStatus(id, status) {
        try {
            const res = await apiClient.patch(API_ENDPOINTS.ADMIN.UPDATE_SELLER_STATUS(id), { status });
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getPublicStoreBySlug(slug) {
        try {
            const res = await apiClient.get(API_ENDPOINTS.SELLER.STORE(slug));
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

export default new SellerService();
