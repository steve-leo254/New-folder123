import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions for user-specific localStorage
const getUserSpecificKey = (baseKey: string, userId?: string) => {
  // Try to get user ID from token or use a default
  const token = localStorage.getItem('token');
  let currentUserId = userId;
  
  if (!currentUserId && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.id?.toString() || 'anonymous';
    } catch (e) {
      currentUserId = 'anonymous';
    }
  }
  
  return `${baseKey}_${currentUserId}`;
};

// User-specific localStorage getters/setters
const setUserSpecificItem = (baseKey: string, data: any, userId?: string) => {
  localStorage.setItem(getUserSpecificKey(baseKey, userId), JSON.stringify(data));
};

const getUserSpecificItem = (baseKey: string, userId?: string) => {
  return localStorage.getItem(getUserSpecificKey(baseKey, userId));
};

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
      const { data } = await apiClient.get('/api/patient/profile');
      const transformedData = transformPatientData(data);
      
      // Check if there's a locally stored avatar (user-specific)
      const storedAvatar = getUserSpecificItem('patientAvatar');
      if (storedAvatar) {
        transformedData.avatar = storedAvatar;
      }
      
      return transformedData;
    } catch (error) {
      // If backend is not available, return mock data with user-specific stored data
      const storedAvatar = getUserSpecificItem('patientAvatar');
      const storedEmergencyContact = getUserSpecificItem('emergencyContact');
      const storedInsurance = getUserSpecificItem('insuranceData');
      
      // Parse stored emergency contact if exists
      let emergencyContactData = {
        emergencyContactName: 'Jane Smith',
        emergencyContactPhone: '+254723456789',
        emergencyContactRelation: 'Spouse'
      };
      
      if (storedEmergencyContact) {
        try {
          const parsed = JSON.parse(storedEmergencyContact);
          emergencyContactData = {
            emergencyContactName: parsed.emergency_contact_name || 'Jane Smith',
            emergencyContactPhone: parsed.emergency_contact_phone || '+254723456789',
            emergencyContactRelation: parsed.emergency_contact_relation || 'Spouse'
          };
        } catch (e) {
          console.error('Error parsing stored emergency contact:', e);
        }
      }
      
      // Parse stored insurance data if exists - PRIORITIZE STORED DATA
      let insuranceData = {
        insuranceProvider: 'Blue Cross Blue Shield',
        insurancePolicyNumber: 'POL123456',
        insuranceGroupNumber: 'GRP789',
        insuranceHolderName: 'John Doe',
        insuranceType: 'sha', // Ensure SHA type is set
        insuranceQuarterlyLimit: 10000, // Match user's example
        insuranceQuarterlyUsed: 0, // Start with 0 used
        insuranceCoverageStartDate: '2024-01-01',
        insuranceCoverageEndDate: '2024-12-31'
      };
      
      if (storedInsurance) {
        try {
          const parsed = JSON.parse(storedInsurance);
          insuranceData = {
            insuranceProvider: parsed.insurance_provider || insuranceData.insuranceProvider,
            insurancePolicyNumber: parsed.insurance_policy_number || insuranceData.insurancePolicyNumber,
            insuranceGroupNumber: parsed.insurance_group_number || insuranceData.insuranceGroupNumber,
            insuranceHolderName: parsed.insurance_holder_name || insuranceData.insuranceHolderName,
            insuranceType: parsed.insurance_type || insuranceData.insuranceType,
            insuranceQuarterlyLimit: parsed.quarterly_limit || insuranceData.insuranceQuarterlyLimit,
            insuranceQuarterlyUsed: parsed.quarterly_used || insuranceData.insuranceQuarterlyUsed,
            insuranceCoverageStartDate: parsed.coverage_start_date || insuranceData.insuranceCoverageStartDate,
            insuranceCoverageEndDate: parsed.coverage_end_date || insuranceData.insuranceCoverageEndDate
          };
        } catch (e) {
          console.error('Error parsing stored insurance data:', e);
        }
      }
      
      return {
        id: '1',
        user_id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+254712345678',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        avatar: storedAvatar || '',
        address: 'Nairobi, Kenya',
        city: 'Nairobi',
        state: 'Nairobi County',
        zipCode: '00100',
        country: 'Kenya',
        bloodType: 'O+',
        height: '180 cm',
        weight: '75 kg',
        allergies: [],
        conditions: [],
        medications: [],
        ...emergencyContactData,
        ...insuranceData,
        memberId: 'MEM001',
        registrationDate: new Date().toISOString(),
        status: 'active',
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        labResultsNotifications: true
      };
    }
  },

  // Update patient profile
  updateProfile: async (updateData: PatientUpdateData): Promise<PatientProfile> => {
    try {
      const { data } = await apiClient.put('/api/patient/profile', updateData);
      return transformPatientData(data);
    } catch (error) {
      // If backend is not available, save emergency contact and insurance to user-specific localStorage and return current profile with updates
      if (updateData.emergency_contact_name || updateData.emergency_contact_phone || updateData.emergency_contact_relation) {
        const emergencyContactPayload = {
          emergency_contact_name: updateData.emergency_contact_name,
          emergency_contact_phone: updateData.emergency_contact_phone,
          emergency_contact_relation: updateData.emergency_contact_relation,
        };
        setUserSpecificItem('emergencyContact', emergencyContactPayload);
      }
      
      if (updateData.insurance_provider || updateData.insurance_policy_number || updateData.insurance_group_number || 
          updateData.insurance_holder_name || updateData.insurance_type || updateData.quarterly_limit || 
          updateData.quarterly_used || updateData.coverage_start_date || updateData.coverage_end_date) {
        const insurancePayload = {
          insurance_provider: updateData.insurance_provider,
          insurance_policy_number: updateData.insurance_policy_number,
          insurance_group_number: updateData.insurance_group_number,
          insurance_holder_name: updateData.insurance_holder_name,
          insurance_type: updateData.insurance_type,
          quarterly_limit: updateData.quarterly_limit,
          quarterly_used: updateData.quarterly_used,
          coverage_start_date: updateData.coverage_start_date,
          coverage_end_date: updateData.coverage_end_date,
        };
        setUserSpecificItem('insuranceData', insurancePayload);
      }
      
      const currentProfile = await patientApi.getProfile();
      return { ...currentProfile, ...updateData };
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ img_url: string }> => {
    // Since we don't have a backend, create a mock implementation
    // In a real app, this would upload to a server and return the URL
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a local URL for the uploaded image
    const localUrl = URL.createObjectURL(file);
    
    // Store in user-specific localStorage for persistence (mock implementation)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setUserSpecificItem('patientAvatar', base64data);
    };
    reader.readAsDataURL(file);
    
    // Return the local URL
    return { img_url: localUrl };
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
    avatar: data.profile_picture || '',
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
