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
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  doctorId: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  notes?: string;
}

export interface UpdateAppointmentData {
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}