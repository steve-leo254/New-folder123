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

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
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
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching staff members:', err);
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
