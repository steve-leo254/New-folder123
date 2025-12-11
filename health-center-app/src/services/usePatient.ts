import { useState, useEffect, useCallback } from 'react';
import { patientApi, PatientProfile, PatientUpdateData } from './api/patientApi';
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios';

interface UsePatientReturn {
  patient: PatientProfile | null;
  loading: boolean;
  error: string | null;
  updatePatient: (data: PatientUpdateData) => Promise<{
    success: boolean;
    error?: string;
  }>;
  uploadAvatar: (file: File) => Promise<{
    success: boolean;
    error?: string;
  }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  downloadRecords: () => Promise<void>;
  exportData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const usePatient = (): UsePatientReturn => {
  const { token, logout } = useAuth();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient profile
  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await patientApi.getProfile();
      setPatient(data);
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        logout();
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update patient profile
  const updatePatient = async (data: PatientUpdateData) => {
    try {
      setError(null);
      const updatedPatient = await patientApi.updateProfile(data);
      setPatient(updatedPatient);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    try {
      setError(null);
      const result = await patientApi.uploadAvatar(file);
      
      // Update patient with new avatar URL
      if (patient) {
        setPatient({
          ...patient,
          avatar: result.img_url,
        });
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      await patientApi.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Download medical records
  const downloadRecords = async () => {
    try {
      const blob = await patientApi.downloadRecords();
      downloadFile(blob, 'medical-records.pdf');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Export patient data
  const exportData = async () => {
    try {
      const blob = await patientApi.exportData();
      downloadFile(blob, 'patient-data.json');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    await fetchProfile();
  };

  return {
    patient,
    loading,
    error,
    updatePatient,
    uploadAvatar,
    changePassword,
    downloadRecords,
    exportData,
    refreshProfile,
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

// Helper function to download file
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
