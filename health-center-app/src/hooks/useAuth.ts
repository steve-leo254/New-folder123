import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and get user data
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      // Simulate API call
      const userData: User = {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+254 712 345 678',
        dateOfBirth: '1990-01-15',
        role: 'patient'
      };
      setUser(userData);
    } catch (err) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      const response = await new Promise(resolve => 
        setTimeout(() => resolve({ success: true, token: 'fake-token' }), 1000)
      );
      
      if (response) {
        localStorage.setItem('authToken', 'fake-token');
        await fetchUserData();
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};