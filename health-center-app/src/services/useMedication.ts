import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';

export interface MedicationRecord {
  id: string | number;
  name: string;
  category: string;
  dosage?: string;
  price: number;
  stock: number;
  description?: string;
  inStock: boolean;
  prescriptionRequired?: boolean;
  expiryDate?: string;
  batchNumber?: string;
  supplier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationCreateRequest {
  name: string;
  category: string;
  dosage?: string;
  price: number;
  stock: number;
  description?: string;
  prescription_required?: boolean;
  expiry_date?: string;
  batch_number?: string;
  supplier?: string;
}

export interface MedicationUpdateRequest extends Partial<MedicationCreateRequest> {}

const normalizeMedication = (medication: any): MedicationRecord => ({
  id: medication.id,
  name: medication.name,
  category: medication.category,
  dosage: medication.dosage,
  price: medication.price,
  stock: medication.stock,
  description: medication.description,
  inStock: medication.in_stock !== undefined ? Boolean(medication.in_stock) : medication.stock > 0,
  prescriptionRequired: medication.prescription_required,
  expiryDate: medication.expiry_date || medication.expiryDate,
  batchNumber: medication.batch_number || medication.batchNumber,
  supplier: medication.supplier,
  createdAt: medication.created_at || medication.createdAt,
  updatedAt: medication.updated_at || medication.updatedAt,
});

const toArrayResponse = (response: any): MedicationRecord[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response.map(normalizeMedication);
  if (response.items && Array.isArray(response.items)) {
    return response.items.map(normalizeMedication);
  }
  return [normalizeMedication(response)];
};

export const useMedications = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(
    async (params?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getMedications(params);
        const normalized = toArrayResponse(response);
        setMedications(normalized);
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch medications';
        setError(errorMessage);
        console.error('Error fetching medications:', axiosError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createMedication = useCallback(
    async (medicationData: MedicationCreateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.createMedication(medicationData);
        const normalized = normalizeMedication(response);
        setMedications((prev) => [normalized, ...prev]);
        return normalized;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to create medication';
        setError(errorMessage);
        console.error('Error creating medication:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateMedication = useCallback(
    async (medicationId: string | number, medicationData: MedicationUpdateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.updateMedication(medicationId, medicationData);
        const normalized = normalizeMedication(response);
        setMedications((prev) =>
          prev.map((med) => (med.id === medicationId ? normalized : med))
        );
        return normalized;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to update medication';
        setError(errorMessage);
        console.error('Error updating medication:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    medications,
    error,
    fetchMedications,
    createMedication,
    updateMedication,
  };
};
