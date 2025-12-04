// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  id: number;
  role: string;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredToken());
  const [role, setRole] = useState<string | null>(null);

  // Decode token to get role
  useEffect(() => {
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        setRole(decoded.role);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Invalid token:', err);
        setToken(null);
        setRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
      }
    } else {
      setRole(null);
      setIsAuthenticated(false);
    }
  }, [token]);

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = getStoredToken();
      setToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('isLoggedIn', 'true');
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};