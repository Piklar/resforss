import axios from 'axios';

// 1. Create the Axios Instance
// When you deploy to Render later, you only change this BASE_URL.
const BASE_URL = 'http://localhost:5000/api'; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// 2. Interceptor (The "Middleman")
// This automatically attaches the Token to every request if you are logged in.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;