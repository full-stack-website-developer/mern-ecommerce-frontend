import apiClient, { ApiError } from '../api/api.client';
import { API_ENDPOINTS } from '../api/api.config';

class AuthService {
    async register(userData) {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.AUTH.REGISTER,
                this.transformUserData(userData)
            );

            if (response.success && response.data.token) {
                this.setAuthData(response.data);
            }
            
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async login(credentials) {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.AUTH.LOGIN,
                credentials
            );

            if (response.success && response.data.token) {
                this.setAuthData(response.data, credentials.rememberMe);
            }
            
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async verifyToken() {
        try {
            return await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
        } catch (error) {
            this.clearAuthData();
            throw this.handleError(error);
        }
    }

    async forgotPassword(email) {
        try {
            const response =  await apiClient.post(
                API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
                email
            );

            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async verifyOTP(email, otp) {
        try {
            const url = `${API_ENDPOINTS.AUTH.VERIFY_OTP}/${encodeURIComponent(email)}`;
            const response = await apiClient.post(url, { otp });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async changePassword(email, password, confirmPassword) {
        try {
            const url = `${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}/${encodeURIComponent(email)}`;
            const response = await apiClient.post(url, { password, confirmPassword });
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async googleAuth(code) {
        try {
            const url = `${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}/${encodeURIComponent(code)}`;
            const response = await apiClient.post(url);

            if (response.success && response.data.token) {
                this.setAuthData(response.data);
            }

            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Private methods
    setAuthData(data, rememberMe=false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem('rememberMe', rememberMe);
        storage.setItem('token', data.token);
        storage.setItem('user', JSON.stringify(data.user));
    }

    clearAuthData() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberMe');
    }

    getToken() {
        return localStorage.getItem('token') ||
            sessionStorage.getItem('token');
    }

    getRemember() {
        return localStorage.getItem('rememberMe') ||
            sessionStorage.getItem('rememberMe');
    }

    getCurrUser() {
        const user =
            localStorage.getItem('user') ||
            sessionStorage.getItem('user');

        try {
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }

    transformUserData(user) {
        return {
            firstName: user.fName,
            lastName: user.lName,
            email: user.email,
            phone: user.phone,
            password: user.password,
            terms: user.terms
        };
    }

    handleError(error) {
        if (error instanceof ApiError) {
            return error;
        }
        return new ApiError('An unexpected error occurred', 500, error);
    }
}

export default new AuthService();