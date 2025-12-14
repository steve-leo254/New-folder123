import { useState, useEffect, useCallback } from 'react';
import { apiService } from './api';
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios';

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  holderName: string;
}

interface UseInsuranceReturn {
  insurance: Insurance | null;
  loading: boolean;
  error: string | null;
  updateInsurance: (data: Partial<Insurance>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  refreshInsurance: () => Promise<void>;
}

const defaultInsurance: Insurance = {
  provider: '',
  policyNumber: '',
  groupNumber: '',
  holderName: '',
};

export const useInsurance = (): UseInsuranceReturn => {
  const { token } = useAuth();
  const [insurance, setInsurance] = useState<Insurance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch insurance info
  const fetchInsurance = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInsurance();
      setInsurance(data || defaultInsurance);
    } catch (err) {
      setError(getErrorMessage(err));
      setInsurance(defaultInsurance);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchInsurance();
  }, [fetchInsurance]);

  // Update insurance info
  const updateInsurance = async (data: Partial<Insurance>) => {
    try {
      setError(null);
      const payload = {
        insurance_provider: data.provider,
        insurance_policy_number: data.policyNumber,
        insurance_group_number: data.groupNumber,
        insurance_holder_name: data.holderName,
      };
      const updatedData = await apiService.updateInsurance(payload);
      setInsurance({
        provider: updatedData.insurance_provider || '',
        policyNumber: updatedData.insurance_policy_number || '',
        groupNumber: updatedData.insurance_group_number || '',
        holderName: updatedData.insurance_holder_name || '',
      });
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh insurance info
  const refreshInsurance = async () => {
    await fetchInsurance();
  };

  return {
    insurance,
    loading,
    error,
    updateInsurance,
    refreshInsurance,
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
