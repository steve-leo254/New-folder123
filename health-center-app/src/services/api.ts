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
    const { data } = await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
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
  // Medical Info endpoints
  getMedicalInfo: async () => {
    const { data } = await api.get('/api/patient/medical-info');
    return data;
  },
  updateMedicalInfo: async (payload: {
    blood_type?: string;
    height?: string;
    weight?: string;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
  }) => {
    const { data } = await api.put('/api/patient/medical-info', payload);
    return data;
  },
  addMedicalItem: async (type: 'allergy' | 'condition' | 'medication', value: string) => {
    const { data } = await api.post(`/api/patient/medical-info/${type}`, { value });
    return data;
  },
  removeMedicalItem: async (type: 'allergy' | 'condition' | 'medication', index: number) => {
    const { data } = await api.delete(`/api/patient/medical-info/${type}/${index}`);
    return data;
  },
  // Emergency Contact endpoints
  getEmergencyContact: async () => {
    const { data } = await api.get('/api/patient/emergency-contact');
    return data;
  },
  updateEmergencyContact: async (payload: {
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
  }) => {
    const { data } = await api.put('/api/patient/emergency-contact', payload);
    return data;
  },
  // Insurance endpoints
  getInsurance: async () => {
    const { data } = await api.get('/api/patient/insurance');
    return data;
  },
  updateInsurance: async (payload: {
    insurance_provider?: string;
    insurance_policy_number?: string;
    insurance_group_number?: string;
    insurance_holder_name?: string;
  }) => {
    const { data } = await api.put('/api/patient/insurance', payload);
    return data;
  },
  // Notifications endpoints
  getNotifications: async () => {
    const { data } = await api.get('/api/patient/notifications');
    return data;
  },
  updateNotifications: async (payload: {
    email_notifications?: boolean;
    sms_notifications?: boolean;
    appointment_reminders?: boolean;
    lab_results_notifications?: boolean;
  }) => {
    const { data } = await api.put('/api/patient/notifications', payload);
    return data;
  },
  // Security endpoints
  getSecuritySettings: async () => {
    const { data } = await api.get('/api/patient/security');
    return data;
  },
  updateSecuritySettings: async (payload: {
    two_factor_enabled?: boolean;
    login_alerts?: boolean;
    session_timeout?: number;
  }) => {
    const { data } = await api.put('/api/patient/security', payload);
    return data;
  },
  getActivityLogs: async () => {
    const { data } = await api.get('/api/patient/activity-logs');
    return data;
  },
  // Wishlist endpoints
  getWishlist: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/api/patient/wishlist', { params });
    return data;
  },
  addToWishlist: async (payload: { medication_id: string | number }) => {
    const { data } = await api.post('/api/patient/wishlist', payload);
    return data;
  },
  removeFromWishlist: async (wishlistItemId: string | number) => {
    const { data } = await api.delete(`/api/patient/wishlist/${wishlistItemId}`);
    return data;
  },
  clearWishlist: async () => {
    const { data } = await api.delete('/api/patient/wishlist');
    return data;
  },
};

export default api;