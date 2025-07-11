import { useAuthStore } from '@/features/auth/stores/auth-store';
import axios from 'axios';

// An axios instance configured for the Rift backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api/',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Adjust this for production
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  },
});

// Middleware to return only the response body
api.interceptors.response.use(
  (response) => response.data.data || response.data, // Return the data field or the entire response if data is not present
  (error) => {
    console.error('Axios response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Middleware to add auth token from Zustand store if present
api.interceptors.request.use(
  (config) => {
    // Importing Zustand store directly in a non-React context
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { api };
