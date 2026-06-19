import axios from 'axios';

// API instance
const API = axios.create({
  baseURL: 'https://exampilot-backend-x66t.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT Token into request headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('exampilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await API.post('/auth/register', { name, email, password });
    return response.data;
  },
  googleLogin: async (email, name) => {
    const response = await API.post('/auth/google', { email, name });
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (name, password) => {
    const data = {};
    if (name) data.name = name;
    if (password) data.password = password;
    const response = await API.put('/auth/profile', data);
    return response.data;
  },
};

// Plan services
export const planService = {
  getPlans: async () => {
    const response = await API.get('/plans');
    return response.data;
  },
  getPlan: async (id) => {
    const response = await API.get(`/plans/${id}`);
    return response.data;
  },
  createPlan: async (planData) => {
    const response = await API.post('/plans', planData);
    return response.data;
  },
  deletePlan: async (id) => {
    const response = await API.delete(`/plans/${id}`);
    return response.data;
  },
};

export default API;
