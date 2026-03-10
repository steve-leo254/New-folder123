import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useRealtimeAppointments = (userId: string | number) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await apiService.getAppointments();
      const normalized = Array.isArray(data) ? data : [data];
      setAppointments(normalized);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchAppointments();

    // Set up polling
    const interval = setInterval(fetchAppointments, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId, fetchAppointments]);

  // Manual refresh function
  const refreshAppointments = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    lastUpdate,
    refreshAppointments,
    fetchAppointments
  };
};
