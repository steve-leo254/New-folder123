import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { AxiosError } from 'axios';

export const useAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getAdminDashboard();
      setData(response);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch admin dashboard';
      setError(errorMessage);
      console.error('Error fetching admin dashboard:', axiosError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, data, error, fetchAdminDashboard };
};

export const useDashboardSummary = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getDashboardSummary();
      setData(response);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch dashboard summary';
      setError(errorMessage);
      console.error('Error fetching dashboard summary:', axiosError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, data, error, fetchDashboardSummary };
};