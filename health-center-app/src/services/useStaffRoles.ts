import { useState, useEffect } from 'react';
import { StaffRole } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
        permissions: role.permissions,
        isActive: role.is_active,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
        requiresSpecialization: role.requires_specialization,
        requiresLicense: role.requires_license,
        defaultConsultationFee: role.default_consultation_fee,
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
      
      // Transform field names to match backend expectations
      const backendData = {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        is_active: roleData.isActive,
        requires_specialization: roleData.requiresSpecialization,
        requires_license: roleData.requiresLicense,
        default_consultation_fee: roleData.defaultConsultationFee,
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

      const newRole = await response.json();
      
      // Transform backend response to frontend format
      const transformedRole = {
        id: newRole.id,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        isActive: newRole.is_active,
        createdAt: newRole.created_at,
        updatedAt: newRole.updated_at,
        requiresSpecialization: newRole.requires_specialization,
        requiresLicense: newRole.requires_license,
        defaultConsultationFee: newRole.default_consultation_fee,
      };
      
      setRoles(prev => [...prev, transformedRole]);
      return transformedRole;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
      throw err;
    }
  };

  const updateRole = async (id: string, roleData: Omit<StaffRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      
      // Transform field names to match backend expectations
      const backendData = {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        is_active: roleData.isActive,
        requires_specialization: roleData.requiresSpecialization,
        requires_license: roleData.requiresLicense,
        default_consultation_fee: roleData.defaultConsultationFee,
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

      const updatedRole = await response.json();
      
      // Transform backend response to frontend format
      const transformedRole = {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: updatedRole.permissions,
        isActive: updatedRole.is_active,
        createdAt: updatedRole.created_at,
        updatedAt: updatedRole.updated_at,
        requiresSpecialization: updatedRole.requires_specialization,
        requiresLicense: updatedRole.requires_license,
        defaultConsultationFee: updatedRole.default_consultation_fee,
      };
      
      setRoles(prev => prev.map(role => role.id === id ? transformedRole : role));
      return transformedRole;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      throw err;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/staff-roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete role');
      }

      setRoles(prev => prev.filter(role => role.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role');
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
