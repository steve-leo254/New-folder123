import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';

export interface DashboardSummary {
  users: number;
  appointments: number;
  prescriptions: number;
  upcoming: number;
}

export const useDashboardSummary = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const message = axiosError.response?.data?.detail || 'Failed to load dashboard summary';
      setError(message);
      console.error('Error fetching dashboard summary:', axiosError);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summary,
    loading,
    error,
    refreshSummary,
  };
};

