import apiClient, { ApiError } from '../api/api.client';
import { API_ENDPOINTS } from '../api/api.config';

class ReviewService {
    async createReview(payload) {
        try {
            return await apiClient.post(API_ENDPOINTS.REVIEWS, payload);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getProductReviews(productId, params = {}) {
        try {
            const search = new URLSearchParams();

            if (params.page) {
                search.set('page', String(params.page));
            }

            if (params.limit) {
                search.set('limit', String(params.limit));
            }

            const query = search.toString();
            const suffix = query ? `?${query}` : '';

            return await apiClient.get(`${API_ENDPOINTS.REVIEWS}/product/${productId}${suffix}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserReviews() {
        try {
            return await apiClient.get(`${API_ENDPOINTS.REVIEWS}/my`);
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

export default new ReviewService();
