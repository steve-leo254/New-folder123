import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';

export interface DoctorRecord {
  id: number;
  userId?: number;
  fullName: string;
  email?: string;
  specialization?: string;
  isAvailable: boolean;
  rating?: number;
  patientsCount?: number;
  avatar?: string;
  bio?: string;
  consultationFee?: number;
}

export interface DoctorCreateRequest {
  user_id: number;
  specialization: string;
  bio?: string;
  is_available?: boolean;
  consultation_fee?: number;
  license_number?: string;
}

export interface DoctorUpdateRequest extends Partial<DoctorCreateRequest> {}

type PaginatedDoctorResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

const normalizeDoctor = (doctor: any): DoctorRecord => ({
  id: doctor.id ?? doctor.user_id ?? Math.random(),
  userId: doctor.user_id,
  fullName:
    doctor.full_name ||
    doctor.fullName ||
    doctor.user?.full_name ||
    doctor.user?.fullName ||
    'Staff Member',
  email: doctor.email || doctor.user?.email,
  specialization: doctor.specialization,
  isAvailable:
    doctor.is_available !== undefined ? Boolean(doctor.is_available) : true,
  rating: doctor.rating ? Number(doctor.rating) : undefined,
  patientsCount: doctor.patients ?? doctor.patientsCount ?? undefined,
  avatar: doctor.avatar || doctor.user?.avatar,
  bio: doctor.bio,
  consultationFee: doctor.consultation_fee ?? doctor.consultationFee,
});

const toArrayResponse = (response: any): DoctorRecord[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response.map(normalizeDoctor);
  }

  if (response.items && Array.isArray(response.items)) {
    return response.items.map(normalizeDoctor);
  }

  return [normalizeDoctor(response)];
};

export const useDoctors = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      specialization?: string;
      is_available?: boolean;
      search?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getDoctors(params);
        const normalized = toArrayResponse(response);

        setDoctors(normalized);

        if (response && (response as PaginatedDoctorResponse<any>).total !== undefined) {
          const paginated = response as PaginatedDoctorResponse<any>;
          setTotalPages(paginated.pages);
          setTotalItems(paginated.total);
        } else {
          setTotalPages(1);
          setTotalItems(normalized.length);
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch doctors';
        setError(errorMessage);
        console.error('Error fetching doctors:', axiosError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getDoctor = useCallback(async (doctorId: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getDoctor(doctorId);
      return normalizeDoctor(response);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch doctor';
      setError(errorMessage);
      console.error('Error fetching doctor:', axiosError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDoctor = useCallback(async (doctorData: DoctorCreateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.createDoctor(doctorData);
      const normalized = normalizeDoctor(response);
      setDoctors((prev) => [normalized, ...prev]);
      setTotalItems((prev) => prev + 1);
      return normalized;
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to create doctor';
      setError(errorMessage);
      console.error('Error creating doctor:', axiosError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDoctor = useCallback(
    async (doctorId: string | number, doctorData: DoctorUpdateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.updateDoctor(doctorId, doctorData);
        const normalized = normalizeDoctor(response);
        setDoctors((prev) =>
          prev.map((doctor) => (doctor.id === Number(doctorId) ? normalized : doctor))
        );
        return normalized;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to update doctor';
        setError(errorMessage);
        console.error('Error updating doctor:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteDoctor = useCallback(async (doctorId: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.deleteDoctor(doctorId);
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== Number(doctorId)));
      setTotalItems((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || 'Failed to delete doctor';
      setError(errorMessage);
      console.error('Error deleting doctor:', axiosError);
      throw err;
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
    deleteDoctor,
  };
};