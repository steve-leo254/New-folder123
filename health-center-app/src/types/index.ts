export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  experience: number;
  rating: number;
  avatar: string;
  bio: string;
  availability: TimeSlot[];
  consultationFee: number;
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

export interface StaffMember {
  id: string | number;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
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