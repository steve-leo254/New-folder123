import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';

export interface AppointmentRecord {
  id: string | number;
  patientId: string | number;
  doctorId: string | number;
  doctorName?: string;
  patientName?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentCreateRequest {
  patient_id: string | number;
  doctor_id: string | number;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  notes?: string;
}

export interface AppointmentUpdateRequest extends Partial<AppointmentCreateRequest> {
  status?: 'scheduled' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'refunded';
}

const normalizeAppointment = (appointment: any): AppointmentRecord => ({
  id: appointment.id,
  patientId: appointment.patient_id || appointment.patientId,
  doctorId: appointment.doctor_id || appointment.doctorId,
  doctorName: appointment.doctor_name || appointment.doctorName,
  patientName: appointment.patient_name || appointment.patientName,
  date: appointment.date,
  time: appointment.time,
  status: appointment.status || 'scheduled',
  type: appointment.type || 'in-person',
  notes: appointment.notes,
  paymentStatus: appointment.payment_status || appointment.paymentStatus || 'pending',
  createdAt: appointment.created_at || appointment.createdAt,
  updatedAt: appointment.updated_at || appointment.updatedAt,
});

const toArrayResponse = (response: any): AppointmentRecord[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response.map(normalizeAppointment);
  if (response.items && Array.isArray(response.items)) {
    return response.items.map(normalizeAppointment);
  }
  return [normalizeAppointment(response)];
};

export const useAppointments = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(
    async (params?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getAppointments(params);
        const normalized = toArrayResponse(response);
        setAppointments(normalized);
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch appointments';
        setError(errorMessage);
        console.error('Error fetching appointments:', axiosError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createAppointment = useCallback(
    async (appointmentData: AppointmentCreateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.createAppointment(appointmentData);
        const normalized = normalizeAppointment(response);
        setAppointments((prev) => [normalized, ...prev]);
        return normalized;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to create appointment';
        setError(errorMessage);
        console.error('Error creating appointment:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateAppointment = useCallback(
    async (appointmentId: string | number, appointmentData: AppointmentUpdateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.updateAppointment(appointmentId, appointmentData);
        const normalized = normalizeAppointment(response);
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === appointmentId ? normalized : apt))
        );
        return normalized;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to update appointment';
        setError(errorMessage);
        console.error('Error updating appointment:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancelAppointment = useCallback(async (appointmentId: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.cancelAppointment(appointmentId);
      const normalized = normalizeAppointment(response);
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? normalized : apt))
      );
      return normalized;
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to cancel appointment';
      setError(errorMessage);
      console.error('Error cancelling appointment:', axiosError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    appointments,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
  };
};
