import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hrm360-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const orgId = localStorage.getItem('orgId');

  console.log('API Request:', config.method?.toUpperCase(), config.url, { orgId });

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (orgId && orgId !== 'undefined' && orgId !== 'null') {
    config.headers.set('x-org-id', orgId);
  }

  return config;
});

export default api;
