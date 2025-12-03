import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { AxiosError } from 'axios';
import { Doctor, DoctorCreateRequest, DoctorUpdateRequest } from '../types/doctor';

// Define PaginatedDoctorResponse type
type PaginatedDoctorResponse = {
  items: Doctor[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export const useDoctors = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(
    async (
      page: number = 1, 
      limit: number = 10, 
      specialization?: string, 
      is_available?: boolean,
      search?: string
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = { page, limit };
        if (specialization) params.specialization = specialization;
        if (is_available !== undefined) params.is_available = is_available;
        if (search) params.search = search;
        
        const response = await apiService.getDoctors(params);
        
        setDoctors(response.items);
        setTotalPages(response.pages);
        setTotalItems(response.total);
      } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch doctors';
        setError(errorMessage);
        console.error('Error fetching doctors:', axiosError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getDoctor = useCallback(async (doctorId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getDoctor(doctorId);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch doctor';
      setError(errorMessage);
      console.error('Error fetching doctor:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDoctor = useCallback(async (doctorData: DoctorCreateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.createDoctor(doctorData);
      setDoctors(prev => [response, ...prev]);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to create doctor';
      setError(errorMessage);
      console.error('Error creating doctor:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDoctor = useCallback(async (doctorId: string, doctorData: DoctorUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.updateDoctor(doctorId, doctorData);
      const updatedDoctor = response as Doctor;
      setDoctors(prev => prev.map(doctor => 
        doctor.id.toString() === doctorId ? updatedDoctor : doctor
      ));
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to update doctor';
      setError(errorMessage);
      console.error('Error updating doctor:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDoctor = useCallback(async (doctorId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.deleteDoctor(doctorId);
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to delete doctor';
      setError(errorMessage);
      console.error('Error deleting doctor:', axiosError);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    isLoading, 
    doctors, 
    totalPages, 
    totalItems, 
    error, 
    fetchDoctors, 
    getDoctor, 
    createDoctor, 
    updateDoctor, 
    deleteDoctor 
  };
};