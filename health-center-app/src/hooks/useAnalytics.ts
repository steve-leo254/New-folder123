import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { AxiosError } from 'axios';

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueByMonth = useCallback(async (months: number = 6) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getRevenueByMonth(months);
      setRevenueData(response);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch revenue data';
      setError(errorMessage);
      console.error('Error fetching revenue data:', axiosError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserActivity = useCallback(async (hours: number = 24) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getUserActivity(hours);
      setUserActivityData(response);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch user activity';
      setError(errorMessage);
      console.error('Error fetching user activity:', axiosError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDepartmentStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getDepartmentStats();
      setDepartmentData(response);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch department stats';
      setError(errorMessage);
      console.error('Error fetching department stats:', axiosError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    revenueData,
    userActivityData,
    departmentData,
    error,
    fetchRevenueByMonth,
    fetchUserActivity,
    fetchDepartmentStats
  };
};