import { useState, useEffect, useCallback } from 'react';
import { apiService } from './api';
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios';

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  labResultsNotifications: boolean;
}

interface UseNotificationsReturn {
  notifications: NotificationSettings | null;
  loading: boolean;
  error: string | null;
  updateNotifications: (data: Partial<NotificationSettings>) => Promise<{
    success: boolean;
    error?: string;
  }>;
  refreshNotifications: () => Promise<void>;
}

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: true,
  appointmentReminders: true,
  labResultsNotifications: true,
};

export const useNotifications = (): UseNotificationsReturn => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notification settings
  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getNotifications();
      setNotifications(data || defaultNotifications);
    } catch (err) {
      setError(getErrorMessage(err));
      setNotifications(defaultNotifications);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Update notification settings
  const updateNotifications = async (data: Partial<NotificationSettings>) => {
    try {
      setError(null);
      const payload = {
        email_notifications: data.emailNotifications,
        sms_notifications: data.smsNotifications,
        appointment_reminders: data.appointmentReminders,
        lab_results_notifications: data.labResultsNotifications,
      };
      const updatedData = await apiService.updateNotifications(payload);
      setNotifications({
        emailNotifications: updatedData.email_notifications ?? true,
        smsNotifications: updatedData.sms_notifications ?? true,
        appointmentReminders: updatedData.appointment_reminders ?? true,
        labResultsNotifications: updatedData.lab_results_notifications ?? true,
      });
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Refresh notification settings
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return {
    notifications,
    loading,
    error,
    updateNotifications,
    refreshNotifications,
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
