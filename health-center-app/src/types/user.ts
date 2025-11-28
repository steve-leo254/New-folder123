export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    bloodType: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    bloodType: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
}