import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  login: (credentials: any) => api.post('/admin/login', credentials),
  getStats: () => api.get('/admin/stats'),
  getUsers: (role: string, query: string = '') => api.get(`/admin/users?role=${role}&query=${query}`),
  toggleUserStatus: (type: string, id: string, active: boolean) => 
    api.patch(`/admin/users/${type}/${id}/status`, { active }),
  getLogs: () => api.get('/admin/logs'),
  getHealth: () => api.get('/admin/health'),
  getProviderStats: () => api.get('/admin/provider-stats'),
  getDoctorReports: () => api.get('/reports/admin/all'),
  updateReportStatus: (id: string, status: string, adminNotes?: string) => 
    api.patch(`/reports/admin/${id}/status`, { status, adminNotes }),
};

export default api;
