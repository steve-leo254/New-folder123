import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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
  getPatients: async () => {
    const { data } = await api.get('/patients');
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
  processPayment: async (appointmentId: string | number, payload: {
    payment_method: string;
    payment_amount: number;
    transaction_id?: string;
  }) => {
    const { data } = await api.post('/appointments/payments', { ...payload, appointment_id: appointmentId });
    return data;
  },
  getBillingPayments: async (params?: {
    payment_status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get('/billing/payments', { params });
    return data;
  },
  createMedicationPayment: async (paymentData: {
    transaction_id: string;
    patient_id: number;
    amount: number;
    payment_method: string;
    phone_number: string;
    items: Array<{
      medication_id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    delivery_fee: number;
    payment_status: string;
  }) => {
    const { data } = await api.post('/medications/payments', paymentData);
    return data;
  },

  getMedications: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/medications', { params });
    return data;
  },
  createMedication: async (payload: any) => {
    // Convert price to string to ensure proper Decimal handling on backend
    const processedPayload = {
      ...payload,
      price: payload.price?.toString() || '0.00',
    };
    const { data } = await api.post('/medications', processedPayload);
    return data;
  },
  createPrescription: async (payload: unknown) => {
    const { data } = await api.post('/prescriptions', payload);
    return data;
  },
  getPrescriptions: async () => {
    const { data } = await api.get('/prescriptions');
    return data;
  },
  updateMedication: async (medicationId: string | number, payload: unknown) => {
    const { data } = await api.put(`/medications/${medicationId}`, payload);
    return data;
  },
  deleteMedication: async (medicationId: string | number) => {
    const { data } = await api.delete(`/medications/${medicationId}`);
    return data;
  },
  getBilling: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/billing', { params });
    return data;
  },
  createBilling: async (billingData: any) => {
    const response = await api.post('/billing', billingData);
    return response.data;
  },
  updateBillingStatus: async (id: string | number, data: { status: string; notes?: string }) => {
    const response = await api.patch(`/billing/payments/${id}`, data);
    return response.data;
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
    // Get current medical info first
    const { data: currentData } = await api.get('/api/patient/medical-info');
    const itemType = type === 'allergy' ? 'allergies' : 
                   type === 'condition' ? 'conditions' : 'medications';
    
    // Add new item to array
    const updatedArray = [...(currentData[itemType] || []), value];
    
    // Update entire medical info
    const { data } = await api.put('/api/patient/medical-info', {
      [itemType]: updatedArray
    });
    return data;
  },
  removeMedicalItem: async (type: 'allergy' | 'condition' | 'medication', index: number) => {
    // Get current medical info first
    const { data: currentData } = await api.get('/api/patient/medical-info');
    const itemType = type === 'allergy' ? 'allergies' : 
                   type === 'condition' ? 'conditions' : 'medications';
    
    // Remove item from array
    const updatedArray = (currentData[itemType] || []).filter((_: any, i: number) => i !== index);
    
    // Update entire medical info
    const { data } = await api.put('/api/patient/medical-info', {
      [itemType]: updatedArray
    });
    return data;
  },
  // Emergency Contact endpoints
  getEmergencyContact: async () => {
    try {
      const { data } = await api.get('/api/patient/emergency-contact');
      return data;
    } catch (error) {
      // Mock implementation - get from localStorage
      const stored = localStorage.getItem('emergencyContact');
      if (stored) {
        return JSON.parse(stored);
      }
      // Return default empty contact
      return {
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
      };
    }
  },
  updateEmergencyContact: async (payload: {
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relation?: string;
  }) => {
    try {
      const { data } = await api.put('/api/patient/emergency-contact', payload);
      return data;
    } catch (error) {
      // Mock implementation - save to localStorage
      localStorage.setItem('emergencyContact', JSON.stringify(payload));
      return payload;
    }
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
    insurance_type?: string;
    quarterly_limit?: number;
    quarterly_used?: number;
    coverage_start_date?: string;
    coverage_end_date?: string;
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
