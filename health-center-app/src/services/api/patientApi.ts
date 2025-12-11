import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface PatientUpdateData {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  blood_type?: string;
  height?: string;
  weight?: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  insurance_holder_name?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  appointment_reminders?: boolean;
  lab_results_notifications?: boolean;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceGroupNumber: string;
  insuranceHolderName: string;
  memberId: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  labResultsNotifications: boolean;
}

export const patientApi = {
  // Get patient profile
  getProfile: async (): Promise<PatientProfile> => {
    const { data } = await apiClient.get('/api/patient/profile');
    return transformPatientData(data);
  },

  // Update patient profile
  updateProfile: async (updateData: PatientUpdateData): Promise<PatientProfile> => {
    const { data } = await apiClient.put('/api/patient/profile', updateData);
    return transformPatientData(data);
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ img_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/api/patient/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/patient/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Download medical records
  downloadRecords: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/api/patient/medical-records/download', {
      responseType: 'blob',
    });
    return data;
  },

  // Export patient data
  exportData: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/api/patient/export-data', {
      responseType: 'blob',
    });
    return data;
  },
};

// Transform backend data to frontend format
function transformPatientData(data: any): PatientProfile {
  const [firstName = '', lastName = ''] = (data.full_name || '').split(' ');
  
  return {
    id: data.id,
    user_id: data.user_id,
    firstName,
    lastName,
    email: data.email || '',
    phone: data.phone || '',
    dateOfBirth: data.date_of_birth || '',
    gender: data.gender || '',
    avatar: data.profile_picture || '/images/patient-default.jpg',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    zipCode: data.zip_code || '',
    country: data.country || '',
    bloodType: data.blood_type || '',
    height: data.height || '',
    weight: data.weight || '',
    allergies: data.allergies || [],
    conditions: data.conditions || [],
    medications: data.medications || [],
    emergencyContactName: data.emergency_contact_name || '',
    emergencyContactPhone: data.emergency_contact_phone || '',
    emergencyContactRelation: data.emergency_contact_relation || '',
    insuranceProvider: data.insurance_provider || '',
    insurancePolicyNumber: data.insurance_policy_number || '',
    insuranceGroupNumber: data.insurance_group_number || '',
    insuranceHolderName: data.insurance_holder_name || '',
    memberId: data.member_id || '',
    registrationDate: data.created_at || '',
    status: data.status || 'active',
    emailNotifications: data.email_notifications ?? true,
    smsNotifications: data.sms_notifications ?? true,
    appointmentReminders: data.appointment_reminders ?? true,
    labResultsNotifications: data.lab_results_notifications ?? true,
  };
}

export default apiClient;
