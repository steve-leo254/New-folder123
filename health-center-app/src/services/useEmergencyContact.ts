import { useState, useEffect, useCallback } from 'react';
import { apiService } from './api';
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

interface UseEmergencyContactReturn {
  emergencyContact: EmergencyContact | null;
  loading: boolean;
  error: string | null;
  updateEmergencyContact: (data: Partial<EmergencyContact>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  refreshEmergencyContact: () => Promise<void>;
}

const defaultEmergencyContact: EmergencyContact = {
  name: '',
  phone: '',
  relation: '',
};

export const useEmergencyContact = (): UseEmergencyContactReturn => {
  const { token } = useAuth();
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch emergency contact
  const fetchEmergencyContact = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getEmergencyContact();
      setEmergencyContact(data || defaultEmergencyContact);
    } catch (err) {
      setError(getErrorMessage(err));
      setEmergencyContact(defaultEmergencyContact);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchEmergencyContact();
  }, [fetchEmergencyContact]);

  // Update emergency contact
  const updateEmergencyContact = async (data: Partial<EmergencyContact>) => {
    try {
      setError(null);
      const payload = {
        emergency_contact_name: data.name,
        emergency_contact_phone: data.phone,
        emergency_contact_relation: data.relation,
      };
      const updatedData = await apiService.updateEmergencyContact(payload);
      setEmergencyContact({
        name: updatedData.emergency_contact_name || '',
        phone: updatedData.emergency_contact_phone || '',
        relation: updatedData.emergency_contact_relation || '',
      });
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh emergency contact
  const refreshEmergencyContact = async () => {
    await fetchEmergencyContact();
  };

  return {
    emergencyContact,
    loading,
    error,
    updateEmergencyContact,
    refreshEmergencyContact,
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
