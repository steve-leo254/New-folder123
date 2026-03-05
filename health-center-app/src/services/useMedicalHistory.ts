import { useState, useCallback } from 'react';
import api from './api';

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'vaccination';
  title: string;
  description: string;
  doctor: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordCreateRequest {
  patientId: string;
  type: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'vaccination';
  title: string;
  description: string;
  notes?: string;
  attachments?: string[];
}

export interface MedicalRecordUpdateRequest extends Partial<MedicalRecordCreateRequest> {
  id: string;
}

export const useMedicalHistory = (patientId?: string) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalHistory = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/patients/${patientId}/medical-history`);
      setRecords(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch medical history';
      setError(errorMessage);
      console.error('Error fetching medical history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMedicalRecord = useCallback(async (recordData: MedicalRecordCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/patients/${recordData.patientId}/medical-history`, recordData);
      const newRecord = response.data;
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to add medical record';
      setError(errorMessage);
      console.error('Error adding medical record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMedicalRecord = useCallback(async (recordData: MedicalRecordUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/patients/${recordData.patientId}/medical-history/${recordData.id}`, recordData);
      const updatedRecord = response.data;
      setRecords(prev => prev.map(record => 
        record.id === recordData.id ? updatedRecord : record
      ));
      return updatedRecord;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update medical record';
      setError(errorMessage);
      console.error('Error updating medical record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMedicalRecord = useCallback(async (patientId: string, recordId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/patients/${patientId}/medical-history/${recordId}`);
      setRecords(prev => prev.filter(record => record.id !== recordId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete medical record';
      setError(errorMessage);
      console.error('Error deleting medical record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    records,
    loading,
    error,
    fetchMedicalHistory,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
  };
};
