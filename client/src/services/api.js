import axios from 'axios';

// Base URL – change this to your actual backend URL
const BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling (optional)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized – maybe redirect to login
    const requestUrl = error.config?.url || "";
    if (error.response?.status === 401 && !requestUrl.includes('/auth/change-password')) {
      localStorage.removeItem('kk_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// auth
export const login = (credentials) => API.post('/auth/login', credentials);
export const signup = (data) => API.post('/auth/signup', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = ({oldPassword, newPassword}) => API.put('/auth/change-password', { oldPassword, newPassword });

// Crops
export const getCrops = (params) => API.get('/crops', { params });
export const getCrop = (id) => API.get(`/crops/${id}`);
export const createCrop = (formData) => API.post('/crops', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateCrop = (id, formData) => API.put(`/crops/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteCrop = (id) => API.delete(`/crops/${id}`);
export const togglePauseCrop = (id) => API.patch(`/crops/${id}/pause`);

// Bargains
export const getBargains = () => API.get('/bargains');
export const getBargain = (id) => API.get(`/bargains/${id}`);
export const createBargain = (data) => API.post('/bargains', data);
export const sendBargainMessage = (bargainId, data) => API.post(`/bargains/${bargainId}/messages`, data);

// Orders
export const getOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}/status`, { status });
export const recordPayment = (id, amount, type) => API.patch(`/orders/${id}/payment`, { amount, type });

// Ratings
export const rateCrop = (data) => API.post('/ratings/crop', data);
export const rateBuyer = (data) => API.post('/ratings/buyer', data);
export const getCropRatings = (cropId) => API.get(`/ratings/crop/${cropId}`);
export const getBuyerRatings = (buyerId) => API.get(`/ratings/buyer/${buyerId}`);
export const getMyRatings = () => API.get('/ratings/my');

// Notifications
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllRead = () => API.patch('/notifications/read-all');