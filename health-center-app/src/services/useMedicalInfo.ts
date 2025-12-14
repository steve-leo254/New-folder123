import { useState, useEffect, useCallback } from 'react';
import { apiService } from './api';
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios';

export interface MedicalInfo {
  bloodType: string;
  height: string;
  weight: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
}

interface UseMedicalInfoReturn {
  medicalInfo: MedicalInfo | null;
  loading: boolean;
  error: string | null;
  updateMedicalInfo: (data: Partial<MedicalInfo>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  addItem: (type: 'allergy' | 'condition' | 'medication', value: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  removeItem: (type: 'allergy' | 'condition' | 'medication', index: number) => Promise<{
    success: boolean;
    error?: string;
  }>;
  refreshMedicalInfo: () => Promise<void>;
}

const defaultMedicalInfo: MedicalInfo = {
  bloodType: '',
  height: '',
  weight: '',
  allergies: [],
  conditions: [],
  medications: [],
};

export const useMedicalInfo = (): UseMedicalInfoReturn => {
  const { token } = useAuth();
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch medical info
  const fetchMedicalInfo = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getMedicalInfo();
      
      // Map backend response (snake_case) to frontend interface (camelCase)
      const mappedData: MedicalInfo = {
        bloodType: data.blood_type || '',
        height: data.height || '',
        weight: data.weight || '',
        allergies: data.allergies || [],
        conditions: data.conditions || [],
        medications: data.medications || [],
      };
      
      setMedicalInfo(mappedData || defaultMedicalInfo);
    } catch (err) {
      setError(getErrorMessage(err));
      setMedicalInfo(defaultMedicalInfo);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchMedicalInfo();
  }, [fetchMedicalInfo]);

  // Update medical info
  const updateMedicalInfo = async (data: Partial<MedicalInfo>) => {
    try {
      setError(null);
      
      // Map frontend data (camelCase) to backend format (snake_case)
      const backendPayload: any = {};
      if (data.bloodType !== undefined) backendPayload.blood_type = data.bloodType;
      if (data.height !== undefined) backendPayload.height = data.height;
      if (data.weight !== undefined) backendPayload.weight = data.weight;
      if (data.allergies !== undefined) backendPayload.allergies = data.allergies;
      if (data.conditions !== undefined) backendPayload.conditions = data.conditions;
      if (data.medications !== undefined) backendPayload.medications = data.medications;
      
      const updatedData = await apiService.updateMedicalInfo(backendPayload);
      
      // Map response back to frontend format
      const mappedData: MedicalInfo = {
        bloodType: updatedData.blood_type || '',
        height: updatedData.height || '',
        weight: updatedData.weight || '',
        allergies: updatedData.allergies || [],
        conditions: updatedData.conditions || [],
        medications: updatedData.medications || [],
      };
      
      setMedicalInfo(mappedData);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Add item to medical arrays
  const addItem = async (type: 'allergy' | 'condition' | 'medication', value: string) => {
    try {
      setError(null);
      const updatedData = await apiService.addMedicalItem(type, value);
      
      // Map response back to frontend format
      const mappedData: MedicalInfo = {
        bloodType: updatedData.blood_type || '',
        height: updatedData.height || '',
        weight: updatedData.weight || '',
        allergies: updatedData.allergies || [],
        conditions: updatedData.conditions || [],
        medications: updatedData.medications || [],
      };
      
      setMedicalInfo(mappedData);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Remove item from medical arrays
  const removeItem = async (type: 'allergy' | 'condition' | 'medication', index: number) => {
    try {
      setError(null);
      const updatedData = await apiService.removeMedicalItem(type, index);
      
      // Map response back to frontend format
      const mappedData: MedicalInfo = {
        bloodType: updatedData.blood_type || '',
        height: updatedData.height || '',
        weight: updatedData.weight || '',
        allergies: updatedData.allergies || [],
        conditions: updatedData.conditions || [],
        medications: updatedData.medications || [],
      };
      
      setMedicalInfo(mappedData);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh medical info
  const refreshMedicalInfo = async () => {
    await fetchMedicalInfo();
  };

  return {
    medicalInfo,
    loading,
    error,
    updateMedicalInfo,
    addItem,
    removeItem,
    refreshMedicalInfo,
  };
};

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
