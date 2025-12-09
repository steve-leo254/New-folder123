import { useState, useCallback, useEffect } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';
import { useAuth } from './AuthContext';

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
  clinician_id: string | number;
  visit_type: string;
  scheduled_at: string; // ISO datetime string
  triage_notes?: string;
  specialization?: string;
  cost?: number;
}

export interface AppointmentUpdateRequest extends Partial<AppointmentCreateRequest> {
  status?: 'scheduled' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'refunded';
}

const normalizeAppointment = (appointment: any): AppointmentRecord => {
  // Handle backend data structure
  const scheduledAt = appointment.scheduled_at || new Date();
  const date = scheduledAt instanceof Date ? scheduledAt.toISOString().split('T')[0] : new Date(scheduledAt).toISOString().split('T')[0];
  const time = scheduledAt instanceof Date ? scheduledAt.toTimeString().slice(0, 5) : new Date(scheduledAt).toTimeString().slice(0, 5);
  
  return {
    id: appointment.id,
    patientId: appointment.patient_id || appointment.patientId,
    doctorId: appointment.clinician_id || appointment.doctor_id || appointment.doctorId,
    doctorName: appointment.doctor_name || appointment.doctorName || appointment.clinician_name || '',
    patientName: appointment.patient_name || appointment.patientName || '',
    date: date,
    time: time,
    status: appointment.status || 'scheduled',
    type: appointment.visit_type || appointment.type || 'in-person',
    notes: appointment.triage_notes || appointment.notes,
    paymentStatus: appointment.payment_status || appointment.paymentStatus || 'pending',
    createdAt: appointment.created_at || appointment.createdAt,
    updatedAt: appointment.updated_at || appointment.updatedAt,
  };
};

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
  const { token } = useAuth();

  // Debug: Check if token exists
  console.log('useAppointments hook initialized, token:', !!token);

  const fetchAppointments = useCallback(
    async (params?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching appointments from API...');
        const response = await apiService.getAppointments(params);
        console.log('API response:', response);
        const normalized = toArrayResponse(response);
        console.log('Normalized appointments:', normalized);
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

  // Auto-fetch appointments when user is authenticated
  useEffect(() => {
    console.log('useAppointments useEffect triggered, token:', !!token);
    if (token) {
      fetchAppointments();
    }
  }, [token]); // Only depend on token

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
