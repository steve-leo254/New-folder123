import { useState, useCallback, useEffect } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';
import { useAuth } from './AuthContext';

export interface UserProfile {
  id: string | number;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  role: string;
  profile_picture?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string;
}

export const useUser = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchCurrentUser = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getCurrentUser();
      setUser(response);
      console.log('Current user fetched:', response);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch user profile';
      setError(errorMessage);
      console.error('Error fetching user:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateUser = useCallback(async (userData: Partial<UserProfile>) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.updateCurrentUser(userData);
      setUser(response);
      console.log('User updated successfully:', response);
      return response;
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to update user profile';
      setError(errorMessage);
      console.error('Error updating user:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Auto-fetch user when token changes
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token, fetchCurrentUser]);

  return {
    user,
    isLoading,
    error,
    fetchCurrentUser,
    updateUser,
  };
};
