import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Doctor {
  id: number;
  user_id: number;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  isAvailable: boolean;
  rating: number;
  consultationFee: number;
  video_consultation_fee?: number;
  phone_consultation_fee?: number;
  chat_consultation_fee?: number;
  avatar?: string;  // Changed from profile_picture to match API response
  languages?: string[];  // Languages from doctor_contact_info
  created_at: string;
  updated_at: string;
}

export interface DoctorsResponse {
  success: boolean;
  data: Doctor[];
  message?: string;
}

export const useDoctors = (specialization?: string, isAvailable?: boolean) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (specialization) params.append('specialization', specialization);
      if (isAvailable !== undefined) params.append('is_available', isAvailable.toString());
      
      const url = `${API_BASE_URL}/doctors${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view doctors.');
        }
        throw new Error(`Failed to fetch doctors: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Doctors data received:', data);
      setDoctors(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorById = async (doctorId: number): Promise<Doctor | null> => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this doctor.');
        }
        throw new Error(`Failed to fetch doctor: ${response.statusText}`);
      }

      const doctor = await response.json();
      return doctor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error fetching doctor by ID:', err);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []); // Remove dependencies to ensure consistent hook calls

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors,
    getDoctorById,
  };
};
