import { useState, useCallback } from 'react';
import api from './api';

export interface VideoConsultationSession {
  id: number;
  appointmentId: number;
  roomId: string;
  doctorId: number;
  patientId: number;
  status: 'waiting' | 'active' | 'ended';
  startTime?: string;
  endTime?: string;
  recordingUrl?: string;
  notes?: string;
}

export interface VideoToken {
  token: string;
  uid: number;
  appId: string;
  channelName: string;
}

export const useVideoConsultation = () => {
  const [session, setSession] = useState<VideoConsultationSession | null>(null);
  const [token, setToken] = useState<VideoToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize video consultation session
  const initializeSession = useCallback(async (appointmentId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/video-consultations', {
        appointmentId,
      });
      setSession(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize video session';
      setError(errorMessage);
      console.error('Error initializing video session:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get video token for Agora
  const getVideoToken = useCallback(async (sessionId: number, uid: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/video-consultations/${sessionId}/token`, {
        params: { uid },
      });
      setToken(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get video token';
      setError(errorMessage);
      console.error('Error getting video token:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update session status
  const updateSessionStatus = useCallback(async (sessionId: number, status: 'active' | 'ended') => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.patch(`/video-consultations/${sessionId}`, {
        status,
      });
      setSession(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session status';
      setError(errorMessage);
      console.error('Error updating session status:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add consultation notes
  const addConsultationNotes = useCallback(async (sessionId: number, notes: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.patch(`/video-consultations/${sessionId}`, {
        notes,
      });
      setSession(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add consultation notes';
      setError(errorMessage);
      console.error('Error adding consultation notes:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get session details
  const getSessionDetails = useCallback(async (sessionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/video-consultations/${sessionId}`);
      setSession(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session details';
      setError(errorMessage);
      console.error('Error fetching session details:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    session,
    token,
    isLoading,
    error,
    initializeSession,
    getVideoToken,
    updateSessionStatus,
    addConsultationNotes,
    getSessionDetails,
  };
};
