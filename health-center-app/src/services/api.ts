import axios from 'axios';

// Point this to your FastAPI backend root. Override with VITE_API_URL if needed.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  getDashboardSummary: async () => {
    const { data } = await api.get('/dashboard/summary');
    return data;
  },
  createPatientUser: async (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
  }) => {
    const { data } = await api.post('/users', payload);
    return data;
  },
  registerStaffAccount: async (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
  }) => {
    const { data } = await api.post('/auth/register/admin', payload);
    return data;
  },
  getDoctors: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/doctors', { params });
    return data;
  },
  getDoctor: async (doctorId: string | number) => {
    const { data } = await api.get(`/doctors/${doctorId}`);
    return data;
  },
  createDoctor: async (payload: unknown) => {
    const { data } = await api.post('/doctors', payload);
    return data;
  },
  updateDoctor: async (doctorId: string | number, payload: unknown) => {
    const { data } = await api.put(`/doctors/${doctorId}`, payload);
    return data;
  },
  deleteDoctor: async (doctorId: string | number) => {
    const { data } = await api.delete(`/doctors/${doctorId}`);
    return data;
  },
};

export default api;