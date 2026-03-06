import apiClient, { ApiError } from "../api/api.client"
import { API_ENDPOINTS } from "../api/api.config"

class ProductService {
    /**
     * Get all products with filtering, sorting, and pagination
     * @param {Object} params - Query parameters for filtering
     * @returns {Promise<Object>} API response with products and metadata
     */
    async getAll(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Add all filter parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== false) {
                    queryParams.append(key, value);
                }
            });

            const queryString = queryParams.toString();
            const url = queryString ? `${API_ENDPOINTS.PRODUCTS}?${queryString}` : API_ENDPOINTS.PRODUCTS;

            return await apiClient.get(url); 
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get available filter options (categories, brands, price ranges, tags)
     * @returns {Promise<Object>} API response with filter options
     */
    async getFilterOptions() {
        try {
            return await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/filter-options`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async create(payload) {
        try {
            const res = await apiClient.post(API_ENDPOINTS.PRODUCTS, payload)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async update(payload, id) {
        try {
            const res = await apiClient.put(`${API_ENDPOINTS.PRODUCTS}/${id}`, payload)
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async products() {
        try {
            const res = await apiClient.get(API_ENDPOINTS.PRODUCTS);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getFlashSaleProducts() {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/flash-sale`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async setFlashSale(id, payload) {
        try {
            const res = await apiClient.patch(`${API_ENDPOINTS.PRODUCTS}/${id}/flash-sale`, payload);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getById(id) {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getByUserId() {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/me`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(id) {
        try {
            const res = await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${id}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async editSellerProduct(id, formData) {
        try {
            const res = await apiClient.patch(`${API_ENDPOINTS.PRODUCTS}/${id}/seller`, formData);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deleteSellerProduct(id) {
        try {
            const res = await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${id}/seller`);
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

export default new ProductService();
