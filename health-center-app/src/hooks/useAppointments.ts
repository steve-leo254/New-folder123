import { useState, useEffect } from 'react';
import { Appointment } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Simulate API call
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          date: '2024-01-15',
          time: '10:00 AM',
          status: 'scheduled',
          type: 'video',
          paymentStatus: 'paid'
        }
      ];
      setAppointments(mockAppointments);
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      // Simulate API call
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: '1',
        doctorId: appointmentData.doctorId || '',
        date: appointmentData.date || '',
        time: appointmentData.time || '',
        status: 'scheduled',
        type: appointmentData.type || 'in-person',
        paymentStatus: 'pending'
      };
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError('Failed to book appointment');
      throw err;
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
        )
      );
    } catch (err) {
      setError('Failed to cancel appointment');
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    bookAppointment,
    cancelAppointment,
    refetch: fetchAppointments
  };
};