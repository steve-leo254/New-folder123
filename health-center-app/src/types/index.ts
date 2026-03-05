export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'super_admin' | 'clinician_admin' | 'nurse' | 'receptionist' | 'lab_technician' | 'pharmacist';
  roleIdentifier?: string; // Unique identifier like "doctor_123" or "patient_456"
  permissions?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  fullName: string;
  name: string; // Alias for fullName for compatibility
  email: string;
  phone: string;
  specialization: string;
  specialty: string; // Alias for specialization for compatibility
  bio: string;
  rating: number;
  isAvailable: boolean;
  available: boolean; // Alias for isAvailable for compatibility
  consultationFee: number;
  video_consultation_fee?: number;
  phone_consultation_fee?: number;
  chat_consultation_fee?: number;
  patientsCount: number;
  reviewCount?: number;
  experience?: number;
  avatar: string;
  license_number?: string;
  education?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  medications: Medication[];
  issuedDate: string;
  expiryDate: string;
  instructions: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  price: number;
  description: string;
  category: string;
  inStock: boolean;
  prescriptionRequired: boolean;
  image?: string;
}

export interface VideoCall {
  id: string;
  appointmentId: string;
  roomId: string;
  participants: string[];
  status: 'waiting' | 'active' | 'ended';
  startTime?: string;
  endTime?: string;
}

export interface StaffRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  requiresSpecialization?: boolean;
  requiresLicense?: boolean;
  defaultConsultationFee?: number;
  customizable?: boolean;
}

export interface StaffMember {
  id: string | number;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  roleName?: string;
  specialization?: string;
  status?: 'active' | 'on-leave' | 'inactive';
  rating?: number;
  patients?: number;
  avatar?: string;
  experience?: number;
  consultationFee?: number;
  bio?: string;
  availability?: TimeSlot[];
}