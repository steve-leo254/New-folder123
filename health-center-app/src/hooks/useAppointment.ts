import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { AxiosError } from 'axios';
import { Appointment, AppointmentCreateRequest, AppointmentUpdateRequest, AppointmentCancelRequest, AppointmentStatus } from '../types/appointment';

// Define PaginatedAppointmentResponse type
type PaginatedAppointmentResponse = {
  items: Appointment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export const useAppointments = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (
      page: number = 1, 
      limit: number = 10, 
      status_filter?: string,
      from_date?: string,
      to_date?: string
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = { page, limit };
        if (status_filter) params.status_filter = status_filter;
        if (from_date) params.from_date = from_date;
        if (to_date) params.to_date = to_date;
        
        const response = await apiService.getAppointments(params);
        
        setAppointments(response.items);
        setTotalPages(response.pages);
        setTotalItems(response.total);
      } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch appointments';
        setError(errorMessage);
        console.error('Error fetching appointments:', axiosError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getAppointment = useCallback(async (appointmentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getAppointment(appointmentId);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch appointment';
      setError(errorMessage);
      console.error('Error fetching appointment:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData: AppointmentCreateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.createAppointment(appointmentData);
      setAppointments(prev => [response, ...prev]);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to create appointment';
      setError(errorMessage);
      console.error('Error creating appointment:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAppointment = useCallback(async (appointmentId: string, appointmentData: AppointmentUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.updateAppointment(appointmentId, appointmentData);
      setAppointments(prev => prev.map(appointment => 
        appointment.id === Number(appointmentId) ? response : appointment
      ));
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to update appointment';
      setError(errorMessage);
      console.error('Error updating appointment:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentId: string, cancelData: AppointmentCancelRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.cancelAppointment(appointmentId, cancelData);
      setAppointments(prev => prev.map(appointment => 
        appointment.id === Number(appointmentId) ? response : appointment
      ));
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to cancel appointment';
      setError(errorMessage);
      console.error('Error cancelling appointment:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    isLoading, 
    appointments, 
    totalPages, 
    totalItems, 
    error, 
    fetchAppointments, 
    getAppointment, 
    createAppointment, 
    updateAppointment, 
    cancelAppointment 
  };
};