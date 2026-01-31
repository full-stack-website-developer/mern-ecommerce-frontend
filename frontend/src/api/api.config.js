// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://13.61.21.193:3002';


const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        VERIFY_TOKEN: '/api/auth/verify-token',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        VERIFY_OTP: '/api/auth/verify-otp',
        CHANGE_PASSWORD: '/api/auth/change-password',
        GOOGLE_LOGIN: '/api/auth/google',
    },
};

export { API_BASE_URL, API_ENDPOINTS };