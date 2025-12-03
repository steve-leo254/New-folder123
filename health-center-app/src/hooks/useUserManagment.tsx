import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User } from '../types/user';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 50,
    total: 0
  });

  const fetchUsers = async (params?: { role?: string; skip?: number; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers(params);
      setUsers(response.users);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<User>) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [newUser as User, ...prev]);
      return newUser;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateUser(userId, userData);
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser as User : user
      ));
      return updatedUser;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};