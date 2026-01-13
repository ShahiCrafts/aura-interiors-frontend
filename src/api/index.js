import axios from 'axios';
import { API_V1_URL } from '../config/constants';

const api = axios.create({
    baseURL: API_V1_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        // You can attach the message to the error object if needed
        error.displayMessage = message;
        return Promise.reject(error);
    }
);

export default api;
