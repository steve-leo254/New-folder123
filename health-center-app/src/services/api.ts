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
    role: string;
  }) => {
    const { data } = await api.post('/auth/register/staff', payload);
    return data;
  },
  getDoctors: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/doctors', { params });
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },
  updateCurrentUser: async (payload: {
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
  }) => {
    const { data } = await api.put('/users/me', payload);
    return data;
  },
  getStaff: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/staff', { params });
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
  getAppointments: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/appointments', { params });
    return data;
  },
  createAppointment: async (payload: unknown) => {
    const { data } = await api.post('/appointments', payload);
    return data;
  },
  updateAppointment: async (appointmentId: string | number, payload: unknown) => {
    const { data } = await api.put(`/appointments/${appointmentId}`, payload);
    return data;
  },
  cancelAppointment: async (appointmentId: string | number) => {
    const { data } = await api.put(`/appointments/${appointmentId}/cancel`, {});
    return data;
  },
  getMedications: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/medications', { params });
    return data;
  },
  createMedication: async (payload: unknown) => {
    const { data } = await api.post('/medications', payload);
    return data;
  },
  updateMedication: async (medicationId: string | number, payload: unknown) => {
    const { data } = await api.put(`/medications/${medicationId}`, payload);
    return data;
  },
  getBilling: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/billing', { params });
    return data;
  },
};

export default api;