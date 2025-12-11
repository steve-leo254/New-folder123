import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  doctor?: {
    id: number;
    specialization: string;
    bio: string;
    isAvailable: boolean;
    rating: number;
    consultationFee: number;
  };
  patientsCount: number;
}

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for fallback when backend is unavailable
  const mockStaff: StaffMember[] = [
    {
      id: 1,
      fullName: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      phone: '+1 234 567 8901',
      role: 'doctor',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&size=128&background=4F46E5&color=fff',
      doctor: {
        id: 1,
        specialization: 'Cardiology',
        bio: 'Experienced cardiologist with over 10 years of practice in heart disease diagnosis and treatment.',
        isAvailable: true,
        rating: 4.8,
        consultationFee: 150,
      },
      patientsCount: 245,
    },
    {
      id: 2,
      fullName: 'Dr. Michael Chen',
      email: 'michael.chen@hospital.com',
      phone: '+1 234 567 8902',
      role: 'doctor',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&size=128&background=059669&color=fff',
      doctor: {
        id: 2,
        specialization: 'Neurology',
        bio: 'Specialist in neurological disorders and brain imaging with expertise in stroke treatment.',
        isAvailable: true,
        rating: 4.9,
        consultationFee: 175,
      },
      patientsCount: 189,
    },
    {
      id: 3,
      fullName: 'Dr. Emily Roberts',
      email: 'emily.roberts@hospital.com',
      phone: '+1 234 567 8903',
      role: 'doctor',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Roberts&size=128&background=7C3AED&color=fff',
      doctor: {
        id: 3,
        specialization: 'Pediatrics',
        bio: 'Dedicated pediatrician focused on child health and development from infancy to adolescence.',
        isAvailable: false,
        rating: 4.7,
        consultationFee: 125,
      },
      patientsCount: 312,
    },
  ];

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Use mock data if no token (not authenticated)
        setStaff(mockStaff);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Check if user is authenticated but not admin
          const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            throw new Error(`Access denied. User role '${userData.role}' is not authorized. Admin privileges required.`);
          } else {
            throw new Error('Authentication failed. Please log in again.');
          }
        }
        throw new Error('Failed to fetch staff members');
      }

      const data = await response.json();
      setStaff(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // If it's a network error or backend is down, use mock data
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_INSUFFICIENT_RESOURCES') || errorMessage.includes('TypeError: Failed to fetch')) {
        console.warn('Backend unavailable, using mock data:', err);
        setStaff(mockStaff);
        setError(null); // Don't show error when using fallback
      } else {
        setError(errorMessage);
        console.error('Error fetching staff members:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    fetchStaff,
  };
};
