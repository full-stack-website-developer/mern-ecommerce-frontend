// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://13.61.21.193:3002';

// For Production this must be enable 
// const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// For Local this must be enable ->
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const API_ENDPOINTS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        VERIFY_TOKEN: '/auth/verify-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        VERIFY_OTP: '/auth/verify-otp',
        CHANGE_PASSWORD: '/auth/change-password',
        GOOGLE_LOGIN: '/auth/google',
    },
    USER: {
        ME: '/users/me',
        EDIT: '/users/me/personal-info',
        ADDRESS: '/users/me/address',
        PASSWORD: '/users/me/password',
        AVATAR: '/users/me/avatar',
    }
};

export { API_BASE_URL, API_ENDPOINTS };