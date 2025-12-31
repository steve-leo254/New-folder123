import { useState, useEffect, useCallback } from 'react';
import { apiService } from './api';
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios';

export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  holderName: string;
  type?: 'standard' | 'sha';
  quarterlyLimit?: number;
  quarterlyUsed?: number;
  coverageStartDate?: string;
  coverageEndDate?: string;
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
  getQuarterlyUsage: () => {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  isSHA: () => boolean;
  checkCoverage: (amount: number) => boolean;
}

const defaultInsurance: Insurance = {
  provider: '',
  policyNumber: '',
  groupNumber: '',
  holderName: '',
  type: 'standard',
  quarterlyLimit: 0,
  quarterlyUsed: 0,
  coverageStartDate: '',
  coverageEndDate: '',
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
      
      // Handle both old and new API responses
      const insuranceData = {
        provider: data.insurance_provider || '',
        policyNumber: data.insurance_policy_number || '',
        groupNumber: data.insurance_group_number || '',
        holderName: data.insurance_holder_name || '',
        type: data.insurance_type || 'standard',
        quarterlyLimit: data.quarterly_limit || 0,
        quarterlyUsed: data.quarterly_used || 0,
        coverageStartDate: data.coverage_start_date || '',
        coverageEndDate: data.coverage_end_date || '',
      };
      
      setInsurance(insuranceData);
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
        insurance_type: data.type,
        quarterly_limit: data.quarterlyLimit,
        quarterly_used: data.quarterlyUsed,
        coverage_start_date: data.coverageStartDate,
        coverage_end_date: data.coverageEndDate,
      };
      
      let updatedData;
      try {
        // Try with all fields (including SHA fields)
        updatedData = await apiService.updateInsurance(payload);
      } catch (err: any) {
        // If we get a 422 error, it might be because the backend doesn't support SHA fields yet
        if (err.response?.status === 422) {
          // Retry with only the basic fields
          const basicPayload = {
            insurance_provider: data.provider,
            insurance_policy_number: data.policyNumber,
            insurance_group_number: data.groupNumber,
            insurance_holder_name: data.holderName,
          };
          updatedData = await apiService.updateInsurance(basicPayload);
        } else {
          throw err; // Re-throw other errors
        }
      }
      
      setInsurance({
        provider: updatedData.insurance_provider || '',
        policyNumber: updatedData.insurance_policy_number || '',
        groupNumber: updatedData.insurance_group_number || '',
        holderName: updatedData.insurance_holder_name || '',
        type: updatedData.insurance_type || data.type || 'standard',
        quarterlyLimit: updatedData.quarterly_limit || data.quarterlyLimit || 0,
        quarterlyUsed: updatedData.quarterly_used || data.quarterlyUsed || 0,
        coverageStartDate: updatedData.coverage_start_date || data.coverageStartDate || '',
        coverageEndDate: updatedData.coverage_end_date || data.coverageEndDate || '',
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

  // Get quarterly usage information
  const getQuarterlyUsage = () => {
    if (!insurance) {
      return { used: 0, limit: 0, remaining: 0, percentage: 0 };
    }

    const used = insurance.quarterlyUsed || 0;
    const limit = insurance.quarterlyLimit || 0;
    const remaining = Math.max(0, limit - used);
    const percentage = limit > 0 ? (used / limit) * 100 : 0;

    return { used, limit, remaining, percentage };
  };

  // Check if insurance is SHA type
  const isSHA = () => {
    return insurance?.type === 'sha';
  };

  // Check if a specific amount is covered by remaining quarterly limit
  const checkCoverage = (amount: number) => {
    if (!isSHA()) return true; // Non-SHA insurance doesn't have quarterly limits
    
    const { remaining } = getQuarterlyUsage();
    return amount <= remaining;
  };

  return {
    insurance,
    loading,
    error,
    updateInsurance,
    refreshInsurance,
    getQuarterlyUsage,
    isSHA,
    checkCoverage,
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
