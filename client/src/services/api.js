import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  completeOnboarding: (data) => api.put('/auth/onboarding', data),
};

// Activity API
export const activityAPI = {
  create: (data) => api.post('/activities', data),
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  getDailySummary: (date) => api.get('/activities/summary/daily', { params: { date } }),
  getWeeklyTrends: () => api.get('/activities/trends/weekly'),
  getMonthlyTrends: () => api.get('/activities/trends/monthly'),
};

// Goal API
export const goalAPI = {
  getCurrent: () => api.get('/goals/current'),
  updateLimit: (monthlyLimit) => api.put('/goals/limit', { monthlyLimit }),
  getHistory: () => api.get('/goals/history'),
  getDashboard: () => api.get('/goals/dashboard'),
  getEmissionFactors: () => api.get('/goals/emission-factors'),
};

// Group API
export const groupAPI = {
  createGroup: (data) => api.post('/groups', data),
  joinGroup: (data) => api.post('/groups/join', data),
  getMyGroups: () => api.get('/groups'),
  getLeaderboard: (groupId, period = 'month') => api.get(`/groups/${groupId}/leaderboard?period=${period}`),
  leaveGroup: (groupId) => api.delete(`/groups/${groupId}/leave`),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
};

// Report API
export const reportAPI = {
  getWeeklyReport: () => api.get('/reports/weekly'),
  getMonthlyReport: () => api.get('/reports/monthly'),
};

// Reward API
export const rewardAPI = {
  getStatus: () => api.get('/rewards/status'),
  claim: () => api.post('/rewards/claim'),
};

// Shop API
export const shopAPI = {
  getItems: () => api.get('/shop/items'),
  redeem: (shopItemId) => api.post('/shop/redeem', { shopItemId }),
  seed: () => api.post('/shop/seed'),
};

export default api;
