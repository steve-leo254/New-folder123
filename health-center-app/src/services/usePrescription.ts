import { useState, useCallback } from 'react';
import { Medication } from '../types';
import api from './api'; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface PrescriptionResponse {
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

  // Fetch all prescriptions for current user
  const fetchPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data);
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
      const { data: newPrescription } = await api.post('/prescriptions', payload);
      setPrescriptions(prev => [...prev, newPrescription]);
      return newPrescription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prescription';
      setError(errorMessage);
      console.error('Error creating prescription:', err);
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
        prev.map(p => p.id === prescriptionId ? updatedPrescription : p)
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
      return prescription;
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
