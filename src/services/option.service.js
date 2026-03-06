import apiClient, { ApiError } from "../api/api.client"
import { API_ENDPOINTS } from "../api/api.config"

class OptionsService {
    async create(payload) {
        try {
            const res = await apiClient.post(API_ENDPOINTS.OPTIONS, payload)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async update(payload, id) {
        try {
            const res = await apiClient.put(`${API_ENDPOINTS.OPTIONS}/${id}`, payload)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getAll() {
        try {
            const res = await apiClient.get(API_ENDPOINTS.OPTIONS)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getById(id) {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.OPTIONS}/${id}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(id) {
        try {
            const res = await apiClient.delete(`${API_ENDPOINTS.OPTIONS}/${id}`);
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

export default new OptionsService();
