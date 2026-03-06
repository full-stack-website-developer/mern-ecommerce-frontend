import apiClient, { ApiError } from '../../../api/api.client';
import { API_ENDPOINTS } from '../../../api/api.config';

class AdminUserService {
  async listUsers({ page = 1, limit = 10, role, status, search } = {}) {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (role && role !== 'all') params.set('role', role);
      if (status && status !== 'all') params.set('status', status);
      if (search) params.set('search', search);

      const url = `${API_ENDPOINTS.ADMIN.USERS}?${params.toString()}`;
      return await apiClient.get(url);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Failed to fetch users', 500, error);
    }
  }
}

export default new AdminUserService();

