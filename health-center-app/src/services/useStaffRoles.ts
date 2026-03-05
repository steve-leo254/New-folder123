import { useState, useEffect } from 'react';
import { StaffRole } from '../types';
import { API_BASE_URL } from './config';

export const useStaffRoles = () => {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/staff-roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Check if user is authenticated but not super admin
          const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            throw new Error(`Access denied. User role '${userData.role}' is not authorized. Super admin privileges required.`);
          } else {
            throw new Error('Authentication failed. Please log in again.');
          }
        }
        throw new Error('Failed to fetch staff roles');
      }

      const data = await response.json();
      
      // Transform backend data to frontend format
      const transformedData = data.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: [], // Predefined roles don't have custom permissions
        isActive: role.isActive,
        createdAt: new Date(role.createdAt),
        updatedAt: new Date(role.updatedAt),
        requiresSpecialization: role.requiresSpecialization || false,
        requiresLicense: role.requiresLicense || false,
        defaultConsultationFee: role.defaultConsultationFee || 0,
        customizable: role.customizable || false,
      }));
      
      setRoles(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching staff roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: Omit<StaffRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Transform frontend data to backend format
      const backendData = {
        name: roleData.name,
        description: roleData.description,
        isActive: roleData.isActive,
        requiresSpecialization: roleData.requiresSpecialization,
        requiresLicense: roleData.requiresLicense,
        defaultConsultationFee: roleData.defaultConsultationFee,
      };
      
      const response = await fetch(`${API_BASE_URL}/staff-roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create role');
      }

      const data = await response.json();
      const transformedData = {
        id: data.id,
        name: data.name,
        description: data.description,
        permissions: data.permissions || [],
        isActive: data.isActive,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        requiresSpecialization: data.requiresSpecialization || false,
        requiresLicense: data.requiresLicense || false,
        defaultConsultationFee: data.defaultConsultationFee || 0,
        customizable: data.customizable || false,
      };

      setRoles(prev => [...prev, transformedData]);
      return transformedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating role:', err);
      throw err;
    }
  };

  const updateRole = async (id: string, roleData: Omit<StaffRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Transform frontend data to backend format
      const backendData = {
        name: roleData.name,
        description: roleData.description,
        isActive: roleData.isActive,
        requiresSpecialization: roleData.requiresSpecialization,
        requiresLicense: roleData.requiresLicense,
        defaultConsultationFee: roleData.defaultConsultationFee,
      };
      
      const response = await fetch(`${API_BASE_URL}/staff-roles/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update role');
      }

      const data = await response.json();
      const transformedData = {
        id: data.id,
        name: data.name,
        description: data.description,
        permissions: data.permissions || [],
        isActive: data.isActive,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        requiresSpecialization: data.requiresSpecialization || false,
        requiresLicense: data.requiresLicense || false,
        defaultConsultationFee: data.defaultConsultationFee || 0,
        customizable: data.customizable || false,
      };

      setRoles(prev => prev.map(role => role.id === id ? transformedData : role));
      return transformedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating role:', err);
      throw err;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/staff-roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete role');
      }

      setRoles(prev => prev.filter(role => role.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting role:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
};
