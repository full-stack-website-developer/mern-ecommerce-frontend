import apiClient from '../api/api.client';
import { API_ENDPOINTS } from '../api/api.config';
import { ApiError } from '../api/api.client';

class CategoryService {
    /**
     * Get all categories with optional filtering
     * @param {Object} params - Query parameters
     * @param {string} params.type - Category type filter
     * @param {string} params.parentId - Parent category ID for subcategories
     * @returns {Promise<Object>} API response with categories
     */
    async getAll(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });
            
            const queryString = queryParams.toString();
            const url = queryString ? `${API_ENDPOINTS.CATEGORIES}?${queryString}` : API_ENDPOINTS.CATEGORIES;
            
            return await apiClient.get(url);
        } catch (error) {
            throw error;
        }
    }

    async categories(type) {
        try {
            const res = await apiClient.get(`${API_ENDPOINTS.CATEGORIES}?type=${type}`);
            return res;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get category by ID
     * @param {string} id - Category ID
     * @returns {Promise<Object>} API response with category
     */
    async getById(id) {
        try {
            return await apiClient.get(`${API_ENDPOINTS.CATEGORIES}/${id}`);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get main categories (no parent)
     * @returns {Promise<Object>} API response with main categories
     */
    async getMainCategories() {
        try {
            return await this.getAll({ parentId: null });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get subcategories for a parent category
     * @param {string} parentId - Parent category ID
     * @returns {Promise<Object>} API response with subcategories
     */
    async getSubcategories(parentId) {
        try {
            return await this.getAll({ parentId });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get category hierarchy (categories with their subcategories)
     * @returns {Promise<Array>} Hierarchical category structure
     */
    async getCategoryHierarchy() {
        try {
            const response = await this.getAll();
            if (!response.success) {
                throw new Error('Failed to fetch categories');
            }

            const categories = response.data || [];
            
            // Separate main categories and subcategories
            const mainCategories = categories.filter(cat => !cat.parentId);
            const subcategories = categories.filter(cat => cat.parentId);
            
            // Build hierarchy
            const hierarchy = mainCategories.map(mainCat => ({
                ...mainCat,
                subcategories: subcategories.filter(subCat => 
                    subCat.parentId === mainCat._id || subCat.parentId === mainCat.id
                )
            }));

            return hierarchy;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async create(formData) {
        try {
            // Let the browser/axios set the correct multipart boundary
            return await apiClient.post(API_ENDPOINTS.CATEGORIES, formData);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async update(formData, id) {
        try {
            // Let the browser/axios set the correct multipart boundary
            return await apiClient.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, formData);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(id) {
        try {
            return await apiClient.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error instanceof ApiError) return error;
        return new ApiError(error.message || 'Category request failed', 500, error);
    }
}

export default new CategoryService();