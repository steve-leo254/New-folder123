/**
 * Doctor Profile API Service
 * Handles all API calls for doctor profile management
 */

import api from './api';

// Types
export interface DoctorEducation {
  id: number;
  doctor_id: number;
  title: string;
  institution: string;
  year: string;
  type: 'degree' | 'certification' | 'license';
  license_number?: string;
  expiry_date?: string;
  created_at: string;
}

export interface DoctorContactInfo {
  id: number;
  doctor_id: number;
  hospital?: string;
  department?: string;
  location?: string;
  languages?: string[];
  consultation_fee?: number;
  response_rate?: number;
  on_time_rate?: number;
  patient_satisfaction?: number;
  created_at: string;
}

export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  is_open: boolean;
  start_time?: string;
  end_time?: string;
  break_start?: string;
  break_end?: string;
  appointment_duration: number;
  buffer_time: number;
  max_appointments_per_day: number;
  created_at: string;
}

export interface DoctorSettings {
  id: number;
  doctor_id: number;
  // Profile visibility settings
  show_profile_to_patients: boolean;
  show_rating_reviews: boolean;
  allow_online_booking: boolean;
  show_availability: boolean;
  
  // Notification settings
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  new_appointment_requests: boolean;
  cancellation_alerts: boolean;
  patient_messages: boolean;
  weekly_summary: boolean;
  marketing_emails: boolean;
  
  // Consultation types enabled
  in_person_consultations: boolean;
  video_consultations: boolean;
  phone_consultations: boolean;
  chat_consultations: boolean;
  
  created_at: string;
}

export interface DoctorProfile {
  doctor: {
    id: number;
    user_id: number;
    specialization?: string;
    bio?: string;
    rating: number;
    is_available: boolean;
    consultation_fee?: number;
    license_number?: string;
  };
  education: DoctorEducation[];
  contact_info: DoctorContactInfo;
  availability: DoctorAvailability[];
  settings: DoctorSettings;
}

// API Functions
export const doctorProfileService = {
  // Education & Certifications
  async getEducation(): Promise<DoctorEducation[]> {
    const { data } = await api.get('/api/doctor/profile/education');
    return data;
  },

  async addEducation(education: Omit<DoctorEducation, 'id' | 'doctor_id' | 'created_at'>): Promise<DoctorEducation> {
    const { data } = await api.post('/api/doctor/profile/education', education);
    return data;
  },

  async updateEducation(id: number, education: Omit<DoctorEducation, 'id' | 'doctor_id' | 'created_at'>): Promise<DoctorEducation> {
    const { data } = await api.put(`/api/doctor/profile/education/${id}`, education);
    return data;
  },

  async deleteEducation(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/api/doctor/profile/education/${id}`);
    return data;
  },

  // Contact Information
  async getContactInfo(): Promise<DoctorContactInfo> {
    const { data } = await api.get('/api/doctor/profile/contact');
    return data;
  },

  async updateContactInfo(contactInfo: Partial<DoctorContactInfo>): Promise<DoctorContactInfo> {
    const { data } = await api.put('/api/doctor/profile/contact', contactInfo);
    return data;
  },

  // Availability Schedule
  async getAvailability(): Promise<DoctorAvailability[]> {
    const { data } = await api.get('/api/doctor/profile/availability');
    return data;
  },

  async updateAvailability(id: number, availability: Partial<DoctorAvailability>): Promise<DoctorAvailability> {
    const { data } = await api.put(`/api/doctor/profile/availability/${id}`, availability);
    return data;
  },

  async updateBulkAvailability(availability: Partial<DoctorAvailability>[]): Promise<DoctorAvailability[]> {
    const { data } = await api.put('/api/doctor/profile/availability/bulk', availability);
    return data;
  },

  // Settings & Preferences
  async getSettings(): Promise<DoctorSettings> {
    const { data } = await api.get('/api/doctor/profile/settings');
    return data;
  },

  async updateSettings(settings: Partial<DoctorSettings>): Promise<DoctorSettings> {
    const { data } = await api.put('/api/doctor/profile/settings', settings);
    return data;
  },

  // Complete Profile
  async getCompleteProfile(): Promise<DoctorProfile> {
    const { data } = await api.get('/api/doctor/profile/complete');
    return data;
  }
};

// Helper function to handle API errors
export const handleProfileError = (error: any, defaultMessage: string) => {
  console.error('Profile API Error:', error);
  const message = error.response?.data?.detail || defaultMessage;
  throw new Error(message);
};

// Validation helpers
export const validateEducation = (education: any): string[] => {
  const errors: string[] = [];
  
  if (!education.title?.trim()) errors.push('Title is required');
  if (!education.institution?.trim()) errors.push('Institution is required');
  if (!education.year?.match(/^\d{4}$/)) errors.push('Valid year is required');
  if (!['degree', 'certification', 'license'].includes(education.type)) errors.push('Invalid type');
  
  return errors;
};

export const validateContactInfo = (contactInfo: any): string[] => {
  const errors: string[] = [];
  
  if (contactInfo.consultation_fee && contactInfo.consultation_fee < 0) {
    errors.push('Consultation fee must be positive');
  }
  if (contactInfo.response_rate && (contactInfo.response_rate < 0 || contactInfo.response_rate > 100)) {
    errors.push('Response rate must be between 0 and 100');
  }
  if (contactInfo.on_time_rate && (contactInfo.on_time_rate < 0 || contactInfo.on_time_rate > 100)) {
    errors.push('On-time rate must be between 0 and 100');
  }
  if (contactInfo.patient_satisfaction && (contactInfo.patient_satisfaction < 0 || contactInfo.patient_satisfaction > 5)) {
    errors.push('Patient satisfaction must be between 0 and 5');
  }
  
  return errors;
};

export const validateAvailability = (availability: any): string[] => {
  const errors: string[] = [];
  
  if (availability.is_open) {
    if (!availability.start_time?.match(/^\d{2}:\d{2}$/)) {
      errors.push('Valid start time is required when open');
    }
    if (!availability.end_time?.match(/^\d{2}:\d{2}$/)) {
      errors.push('Valid end time is required when open');
    }
    if (availability.appointment_duration < 15 || availability.appointment_duration > 180) {
      errors.push('Appointment duration must be between 15 and 180 minutes');
    }
    if (availability.max_appointments_per_day < 1 || availability.max_appointments_per_day > 50) {
      errors.push('Max appointments per day must be between 1 and 50');
    }
  }
  
  return errors;
};
