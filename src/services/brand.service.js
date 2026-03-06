import apiClient, { ApiError } from "../api/api.client";
import { API_ENDPOINTS } from "../api/api.config";

class BrandService {
    async create(payload) {
        try {
            const res = await apiClient.post(API_ENDPOINTS.BRANDS, payload);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getBrands() {
        try {
            const res = await apiClient.get(API_ENDPOINTS.BRANDS);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async update(payload, id) {
        try {
            const res = await apiClient.put(`${API_ENDPOINTS.BRANDS}/${id}`, payload)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getById(id) {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.BRANDS}/${id}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(id) {
        try {
            const res = await apiClient.delete(`${API_ENDPOINTS.BRANDS}/${id}`);
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

export default new BrandService();