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
  date_of_birth: string;
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
      console.log('Raw profile data from backend:', profileData);
      const transformedData = transformPatientData(profileData);
      console.log('Transformed profile data:', transformedData);
      
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
      
      // Fetch medical info separately
      try {
        const { data: medicalData } = await apiClient.get('/api/patient/medical-info');
        console.log('Raw medical data from backend:', medicalData);
        
        // Map backend medical data to frontend format
        if (medicalData) {
          transformedData.bloodType = medicalData.blood_type || '';
          transformedData.height = medicalData.height || '';
          transformedData.weight = medicalData.weight || '';
          transformedData.allergies = medicalData.allergies || [];
          transformedData.conditions = medicalData.conditions || [];
          transformedData.medications = medicalData.medications || [];
        }
        console.log('Profile data after medical merge:', transformedData);
      } catch (medicalError) {
        console.warn('Could not fetch medical data:', medicalError);
        // Set default medical values if API fails
        transformedData.bloodType = '';
        transformedData.height = '';
        transformedData.weight = '';
        transformedData.allergies = [];
        transformedData.conditions = [];
        transformedData.medications = [];
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
      // Separate basic profile data, emergency contact data, insurance data, and medical data
      const profileData: any = {};
      const emergencyData: any = {};
      const insuranceData: any = {};
      const medicalData: any = {};
      
      // Map frontend fields to backend profile fields
      if (updateData.full_name) profileData.full_name = updateData.full_name;
      if (updateData.phone) profileData.phone = updateData.phone;
      if (updateData.gender) profileData.gender = updateData.gender;
      if (updateData.date_of_birth) profileData.date_of_birth = updateData.date_of_birth;
      if (updateData.address) profileData.address = updateData.address;
      
      // Map frontend emergency contact fields to backend emergency contact fields
      if (updateData.emergency_contact_name) emergencyData.name = updateData.emergency_contact_name;
      if (updateData.emergency_contact_phone) emergencyData.phone = updateData.emergency_contact_phone;
      if (updateData.emergency_contact_relation) emergencyData.relation = updateData.emergency_contact_relation;
      
      // Map frontend insurance fields to backend insurance fields
      if (updateData.insurance_provider && updateData.insurance_provider.trim() !== '') {
        insuranceData.provider = updateData.insurance_provider;
      }
      if (updateData.insurance_policy_number && updateData.insurance_policy_number.trim() !== '') {
        insuranceData.policy_number = updateData.insurance_policy_number;
      }
      if (updateData.insurance_group_number && updateData.insurance_group_number.trim() !== '') {
        insuranceData.group_number = updateData.insurance_group_number;
      }
      if (updateData.insurance_holder_name && updateData.insurance_holder_name.trim() !== '') {
        insuranceData.holder_name = updateData.insurance_holder_name;
      }
      if (updateData.insurance_type && updateData.insurance_type.trim() !== '') {
        insuranceData.insurance_type = updateData.insurance_type;
      }
      if (updateData.quarterly_limit !== undefined && updateData.quarterly_limit !== null && updateData.quarterly_limit > 0) {
        insuranceData.quarterly_limit = updateData.quarterly_limit;
      }
      if (updateData.quarterly_used !== undefined && updateData.quarterly_used !== null && updateData.quarterly_used >= 0) {
        insuranceData.quarterly_used = updateData.quarterly_used;
      }
      if (updateData.coverage_start_date && updateData.coverage_start_date.trim() !== '') {
        insuranceData.coverage_start_date = updateData.coverage_start_date;
      }
      if (updateData.coverage_end_date && updateData.coverage_end_date.trim() !== '') {
        insuranceData.coverage_end_date = updateData.coverage_end_date;
      }
      
      // Map frontend medical fields to backend medical fields
      if (updateData.blood_type && updateData.blood_type.trim() !== '') {
        medicalData.blood_type = updateData.blood_type;
      }
      if (updateData.height && updateData.height.trim() !== '') {
        medicalData.height = updateData.height;
      }
      if (updateData.weight && updateData.weight.trim() !== '') {
        medicalData.weight = updateData.weight;
      }
      if (updateData.allergies && Array.isArray(updateData.allergies) && updateData.allergies.length > 0) {
        medicalData.allergies = updateData.allergies;
      }
      if (updateData.conditions && Array.isArray(updateData.conditions) && updateData.conditions.length > 0) {
        medicalData.conditions = updateData.conditions;
      }
      if (updateData.medications && Array.isArray(updateData.medications) && updateData.medications.length > 0) {
        medicalData.medications = updateData.medications;
      }
      
      // Update basic profile if there's data
      if (Object.keys(profileData).length > 0) {
        console.log('Sending profile data:', profileData);
        await apiClient.put('/api/patient/profile', profileData);
      }
      
      // Update emergency contact if there's data
      if (Object.keys(emergencyData).length > 0) {
        console.log('Sending emergency contact data:', emergencyData);
        await apiClient.put('/api/patient/emergency-contact', emergencyData);
      }
      
      // Update insurance if there's data
      const hasValidInsuranceData = 
        insuranceData.provider !== undefined && insuranceData.provider.trim() !== '' &&
        insuranceData.policy_number !== undefined && insuranceData.policy_number.trim() !== '' &&
        insuranceData.holder_name !== undefined && insuranceData.holder_name.trim() !== '';
      
      if (hasValidInsuranceData) {
        console.log('Sending insurance data:', insuranceData);
        await apiClient.put('/api/patient/insurance', insuranceData);
      }
      
      // Update medical info if there's data
      const hasValidMedicalData = 
        medicalData.blood_type !== undefined ||
        medicalData.height !== undefined ||
        medicalData.weight !== undefined ||
        (medicalData.allergies !== undefined && Array.isArray(medicalData.allergies)) ||
        (medicalData.conditions !== undefined && Array.isArray(medicalData.conditions)) ||
        (medicalData.medications !== undefined && Array.isArray(medicalData.medications));
      
      if (hasValidMedicalData) {
        console.log('Sending medical data:', medicalData);
        await apiClient.put('/api/patient/medical-info', medicalData);
      }
      
      // Return updated profile
      const { data } = await apiClient.get('/api/patient/profile');
      return transformPatientData(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Error response data:', axiosError.response?.data);
        console.error('Error response status:', axiosError.response?.status);
        console.error('Error response headers:', axiosError.response?.headers);
      }
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
    date_of_birth: data.date_of_birth ? (new Date(data.date_of_birth).toISOString().split('T')[0]) : '',
    gender: data.gender || '',
    avatar: getFullImageUrl(data.profile_picture) || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    zipCode: data.zip_code || '',
    country: data.country || '',
    bloodType: data.bloodType || data.blood_type || '',
    height: data.height || '',
    weight: data.weight || '',
    allergies: data.allergies ? (Array.isArray(data.allergies) ? data.allergies : data.allergies.split(', ').filter((a: string) => a.trim())) : [],
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
