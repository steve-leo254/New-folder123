import { Medication } from './index';

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  issuedDate: string;
  expiryDate: string;
  instructions: string;
  diagnosis?: string;
  notes?: string;
  isActive: boolean;
}

export interface CreatePrescriptionData {
  patientId: string;
  medications: Omit<Medication, 'id' | 'price' | 'description' | 'category' | 'inStock'>[];
  instructions: string;
  diagnosis?: string;
  notes?: string;
}