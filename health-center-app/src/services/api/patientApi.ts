import axios, { AxiosError } from 'axios';
import { getFullImageUrl } from '../../utils/imageUtils';

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
  insurance_type?: string;
  quarterly_limit?: number;
  quarterly_used?: number;
  coverage_start_date?: string;
  coverage_end_date?: string;
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
  insuranceType: string;
  insuranceQuarterlyLimit: number;
  insuranceQuarterlyUsed: number;
  insuranceCoverageStartDate: string;
  insuranceCoverageEndDate: string;
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
    try {
      // Fetch basic profile data
      const { data: profileData } = await apiClient.get('/api/patient/profile');
      const transformedData = transformPatientData(profileData);
      
      // Fetch emergency contact data separately
      try {
        const { data: emergencyData } = await apiClient.get('/api/patient/emergency-contact');
        
        // Map backend emergency contact data to frontend format
        if (emergencyData && emergencyData.name) {
          transformedData.emergencyContactName = emergencyData.name;
          transformedData.emergencyContactPhone = emergencyData.phone;
          transformedData.emergencyContactRelation = emergencyData.relation;
        }
      } catch (emergencyError) {
        console.warn('Could not fetch emergency contact data:', emergencyError);
        // Set default emergency contact values if API fails
        transformedData.emergencyContactName = '';
        transformedData.emergencyContactPhone = '';
        transformedData.emergencyContactRelation = '';
      }
      
      // Fetch insurance data separately
      try {
        const { data: insuranceData } = await apiClient.get('/api/patient/insurance');
        
        // Map backend insurance data to frontend format
        if (insuranceData && insuranceData.provider) {
          transformedData.insuranceProvider = insuranceData.provider;
          transformedData.insurancePolicyNumber = insuranceData.policy_number;
          transformedData.insuranceGroupNumber = insuranceData.group_number || '';
          transformedData.insuranceHolderName = insuranceData.holder_name;
          transformedData.insuranceType = insuranceData.insurance_type || 'standard';
          transformedData.insuranceQuarterlyLimit = insuranceData.quarterly_limit || 0;
          transformedData.insuranceQuarterlyUsed = insuranceData.quarterly_used || 0;
          transformedData.insuranceCoverageStartDate = insuranceData.coverage_start_date || '';
          transformedData.insuranceCoverageEndDate = insuranceData.coverage_end_date || '';
        }
      } catch (insuranceError) {
        console.warn('Could not fetch insurance data:', insuranceError);
        // Set default insurance values if API fails
        transformedData.insuranceProvider = '';
        transformedData.insurancePolicyNumber = '';
        transformedData.insuranceGroupNumber = '';
        transformedData.insuranceHolderName = '';
        transformedData.insuranceType = 'standard';
        transformedData.insuranceQuarterlyLimit = 0;
        transformedData.insuranceQuarterlyUsed = 0;
        transformedData.insuranceCoverageStartDate = '';
        transformedData.insuranceCoverageEndDate = '';
      }
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update patient profile
  updateProfile: async (updateData: PatientUpdateData): Promise<PatientProfile> => {
    try {
      // Separate basic profile data, emergency contact data, and insurance data
      const profileData: any = {};
      const emergencyData: any = {};
      const insuranceData: any = {};
      
      // Map frontend fields to backend profile fields
      if (updateData.full_name) profileData.full_name = updateData.full_name;
      if (updateData.phone) profileData.phone = updateData.phone;
      
      // Map frontend emergency contact fields to backend emergency contact fields
      if (updateData.emergency_contact_name) emergencyData.name = updateData.emergency_contact_name;
      if (updateData.emergency_contact_phone) emergencyData.phone = updateData.emergency_contact_phone;
      if (updateData.emergency_contact_relation) emergencyData.relation = updateData.emergency_contact_relation;
      
      // Map frontend insurance fields to backend insurance fields
      if (updateData.insurance_provider) insuranceData.provider = updateData.insurance_provider;
      if (updateData.insurance_policy_number) insuranceData.policy_number = updateData.insurance_policy_number;
      if (updateData.insurance_group_number) insuranceData.group_number = updateData.insurance_group_number;
      if (updateData.insurance_holder_name) insuranceData.holder_name = updateData.insurance_holder_name;
      if (updateData.insurance_type) insuranceData.insurance_type = updateData.insurance_type;
      if (updateData.quarterly_limit !== undefined) insuranceData.quarterly_limit = updateData.quarterly_limit;
      if (updateData.quarterly_used !== undefined) insuranceData.quarterly_used = updateData.quarterly_used;
      if (updateData.coverage_start_date) insuranceData.coverage_start_date = updateData.coverage_start_date;
      if (updateData.coverage_end_date) insuranceData.coverage_end_date = updateData.coverage_end_date;
      
      // Update basic profile if there's data
      if (Object.keys(profileData).length > 0) {
        await apiClient.put('/api/patient/profile', profileData);
      }
      
      // Update emergency contact if there's data
      if (Object.keys(emergencyData).length > 0) {
        await apiClient.put('/api/patient/emergency-contact', emergencyData);
      }
      
      // Update insurance if there's data
      if (Object.keys(insuranceData).length > 0) {
        await apiClient.put('/api/patient/insurance', insuranceData);
      }
      
      // Return updated profile
      const { data } = await apiClient.get('/api/patient/profile');
      return transformPatientData(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ img_url: string }> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to backend
      const response = await apiClient.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
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
    avatar: getFullImageUrl(data.profile_picture) || '',
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
    insuranceType: data.insurance_type || 'standard',
    insuranceQuarterlyLimit: data.quarterly_limit || 0,
    insuranceQuarterlyUsed: data.quarterly_used || 0,
    insuranceCoverageStartDate: data.coverage_start_date || '',
    insuranceCoverageEndDate: data.coverage_end_date || '',
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
