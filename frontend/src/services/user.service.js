import apiClient, { ApiError } from "../api/api.client.js"
import { API_BASE_URL, API_ENDPOINTS } from "../api/api.config.js";

class UserService {
    async getUser() {
        try {
            return await apiClient.get(API_ENDPOINTS.USER.ME);
        } catch (error) {
            this.clearAuthData();
            throw this.handleError(error);
        }
    }
    
    async updateUser(user) {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.USER.EDIT, user);

            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateAddress(address, id) {
        try {
            const response = await apiClient.patch(`${API_ENDPOINTS.USER.ADDRESS}/${id}`, address);

            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createAddress(address) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.USER.ADDRESS, address);

            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getAddress() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER.ADDRESS);

            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updatePassword(data) {
        try {
            const response = await apiClient.patch(API_ENDPOINTS.USER.PASSWORD, data);
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createPassword(data) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.USER.PASSWORD, data);

            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async uploadAvatar(formData) {
        try {
            console.log(formData instanceof FormData)
            const response = await apiClient.patch(API_ENDPOINTS.USER.AVATAR, formData);

            return response;
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

export default new UserService();