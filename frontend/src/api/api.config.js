// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://13.61.21.193:3002';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';



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
};

export { API_BASE_URL, API_ENDPOINTS };