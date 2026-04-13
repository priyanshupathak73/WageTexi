import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url;
    
    console.error(`API Error [${status}]: ${url}`, data);
    
    if (status === 401) {
      console.log('Unauthorized - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      console.error('Forbidden - user may not have required role');
    } else if (status === 400) {
      console.error('Bad request:', data?.errors || data?.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
