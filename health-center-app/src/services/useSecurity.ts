import { useState, useEffect, useCallback } from 'react';
import { apiService } from './api';
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios';

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  location: string;
}

interface UseSecurityReturn {
  securitySettings: SecuritySettings | null;
  activityLogs: ActivityLog[];
  loading: boolean;
  error: string | null;
  updateSecuritySettings: (data: Partial<SecuritySettings>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  refreshSecuritySettings: () => Promise<void>;
  refreshActivityLogs: () => Promise<void>;
}

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  loginAlerts: true,
  sessionTimeout: 30,
};

export const useSecurity = (): UseSecurityReturn => {
  const { token } = useAuth();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch security settings
  const fetchSecuritySettings = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSecuritySettings();
      setSecuritySettings(data || defaultSecuritySettings);
    } catch (err) {
      setError(getErrorMessage(err));
      setSecuritySettings(defaultSecuritySettings);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const data = await apiService.getActivityLogs();
      setActivityLogs(data || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setActivityLogs([]);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchSecuritySettings();
    fetchActivityLogs();
  }, [fetchSecuritySettings, fetchActivityLogs]);

  // Update security settings
  const updateSecuritySettings = async (data: Partial<SecuritySettings>) => {
    try {
      setError(null);
      const payload = {
        two_factor_enabled: data.twoFactorEnabled,
        login_alerts: data.loginAlerts,
        session_timeout: data.sessionTimeout,
      };
      const updatedData = await apiService.updateSecuritySettings(payload);
      setSecuritySettings({
        twoFactorEnabled: updatedData.two_factor_enabled ?? false,
        loginAlerts: updatedData.login_alerts ?? true,
        sessionTimeout: updatedData.session_timeout ?? 30,
      });
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh security settings
  const refreshSecuritySettings = async () => {
    await fetchSecuritySettings();
  };

  // Refresh activity logs
  const refreshActivityLogs = async () => {
    await fetchActivityLogs();
  };

  return {
    securitySettings,
    activityLogs,
    loading,
    error,
    updateSecuritySettings,
    refreshSecuritySettings,
    refreshActivityLogs,
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
