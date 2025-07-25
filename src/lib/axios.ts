import axios from 'axios';

const PROD_BASE_URL = 'https://astrolabe.coursesystem.app/api/';
const DEV_BASE_URL = 'http://localhost:5000/api/';

// An axios instance configured for the Rift backend
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? PROD_BASE_URL : DEV_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Adjust this for production
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  },
  withCredentials: true, // Enable cookies and credentials
});

// Middleware to return only the response body
api.interceptors.response.use(
  (response) => response.data.data || response.data, // Return the data field or the entire response if data is not present
  (error) => Promise.reject(error)
);

export { api };
