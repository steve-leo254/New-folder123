// types/telemedicine.ts
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  nextAvailable: string;
  consultationFee: number;
  bio: string;
  education: string[];
  badges: string[];
  totalConsultations: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Symptom {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface Appointment {
  id: string;
  doctor: Doctor;
  date: string;
  time: string;
  type: 'video' | 'audio' | 'chat';
  status: 'upcoming' | 'completed' | 'cancelled';
  symptoms: string[];
  notes?: string;
}

export interface ConsultationType {
  id: string;
  type: 'video' | 'audio' | 'chat';
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  duration: string;
}