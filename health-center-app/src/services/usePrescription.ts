import { useState, useCallback } from 'react';
import { Medication } from '../types';
import api from './api'; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface PrescriptionResponse {
  doctorName?: string;
  id: number;
  patientId: number;
  doctorId: number;
  medications: Medication[];
  issuedDate: string;
  expiryDate: string;
  instructions: string;
  status: 'active' | 'expired' | 'fulfilled';
}

export interface CreatePrescriptionRequest {
  patientId: number;
  doctorId: number;
  appointmentId?: number | null;
  medications: Array<{
    medicationId: number;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  instructions: string;
  expiryDate: string;
}

export interface UpdatePrescriptionRequest {
  status?: 'active' | 'expired' | 'fulfilled';
  instructions?: string;
}

export const usePrescription = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // helper to transform backend snake_case to camelCase expected by UI
  const mapPrescription = (p: any): PrescriptionResponse => ({
    id: p.id,
    patientId: p.patient_id,
    doctorId: p.issued_by_doctor_id ?? p.doctor_id,
    doctorName: p.doctor_name ?? undefined,
    medications: (p.medications_json ?? p.medications ?? []).map((m: any, idx: number) => ({
      id: m.id ?? idx,
      name: m.name ?? m.medicine ?? m.drug ?? m.medication_name ?? 'Medication',
      dosage: m.dosage ?? m.dose ?? '',
      frequency: m.frequency ?? m.freq ?? '',
      duration: m.duration ?? '',
      price: m.price ?? m.cost ?? m.unit_price ?? 0,
    })),
    issuedDate: p.issued_date,
    expiryDate: p.expiry_date,
    instructions: p.instructions ?? '',
    // convert backend status (pending/approved/fulfilled) to frontend vocabulary
    status: p.status === 'fulfilled' ? 'fulfilled' : p.status === 'pending' || p.status === 'approved' ? 'active' : 'expired',
  });

  // Fetch all prescriptions for current user
  const fetchPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(Array.isArray(data) ? data.map(mapPrescription) : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prescriptions';
      setError(errorMessage);
      console.error('Error fetching prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [])

  // Fetch prescriptions for a specific patient (doctor view)
  const fetchPatientPrescriptions = useCallback(async (patientId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/prescriptions', { params: { patientId } });
      setPrescriptions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient prescriptions';
      setError(errorMessage);
      console.error('Error fetching patient prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [])

  // Create a new prescription (doctor only)
  const createPrescription = useCallback(async (payload: CreatePrescriptionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiPayload = {
        appointment_id: payload.appointmentId ?? null,
        patient_id: payload.patientId,
        doctor_id: payload.doctorId,
        medications: payload.medications,
        instructions: payload.instructions,
        expiry_date: payload.expiryDate,
      };

      console.log('usePrescription - Creating prescription with payload:', payload);
      console.log('usePrescription - API payload (/prescriptions):', apiPayload);
      const { data: newPrescription } = await api.post('/prescriptions', apiPayload);
      console.log('usePrescription - Prescription created successfully:', newPrescription);
      setPrescriptions(prev => [...prev, mapPrescription(newPrescription)]);
      return newPrescription;
    } catch (err: any) {
      console.error('usePrescription - Error creating prescription:', err);
      console.error('usePrescription - Error response:', err.response);
      console.error('usePrescription - Error status:', err.response?.status);
      console.error('usePrescription - Error data:', err.response?.data);
      console.error('usePrescription - Error message:', err.message);
      
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create prescription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [])

  // Update prescription status
  const updatePrescription = useCallback(async (prescriptionId: number, payload: UpdatePrescriptionRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: updatedPrescription } = await api.patch(`/prescriptions/${prescriptionId}`, payload);
      setPrescriptions(prev =>
        prev.map(p => p.id === prescriptionId ? mapPrescription(updatedPrescription) : p)
      );
      return updatedPrescription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prescription';
      setError(errorMessage);
      console.error('Error updating prescription:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [])

  // Get single prescription by ID
  const getPrescriptionById = useCallback(async (prescriptionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: prescription } = await api.get(`/prescriptions/${prescriptionId}`);
      return mapPrescription(prescription);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prescription';
      setError(errorMessage);
      console.error('Error fetching prescription:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    prescriptions,
    isLoading,
    error,
    fetchPrescriptions,
    fetchPatientPrescriptions,
    createPrescription,
    updatePrescription,
    getPrescriptionById,
  };
};
