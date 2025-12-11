// services/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface JwtPayload {
  sub: string;           // full_name in your backend
  id: number;           // user id
  role: string;         // role value
  exp: number;          // expiration
  email?: string;       // optional email
}

interface User {
  id: number;
  full_name: string;    // Match backend field name
  email?: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = () => localStorage.getItem('token') || localStorage.getItem('authToken');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext - Initializing...');
      const storedToken = getStoredToken();
      
      if (storedToken) {
        try {
          // Decode without external library - use built-in atob for basic JWT parsing
          const payload = parseJwt(storedToken);
          
          if (!payload) {
            throw new Error('Invalid token format');
          }

          const currentTime = Date.now() / 1000;

          // Check if token is expired
          if (payload.exp && payload.exp < currentTime) {
            console.warn('AuthContext - Token expired');
            clearAuthStorage();
            setIsLoading(false);
            return;
          }

          // Validate required fields
          if (!payload.id || !payload.sub || !payload.role) {
            throw new Error('Invalid token payload: missing required fields');
          }

          console.log('AuthContext - Valid token found, role:', payload.role);
          
          setToken(storedToken);
          setRole(payload.role);
          setUser({
            id: payload.id,
            full_name: payload.sub,  // This is full_name from backend
            email: payload.email,
            role: payload.role,
          });
          setIsAuthenticated(true);
        } catch (err) {
          console.error('AuthContext - Invalid token:', err);
          clearAuthStorage();
        }
      } else {
        console.log('AuthContext - No token found');
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Helper function to parse JWT without external library
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return null;
    }
  };

  // Clear authentication storage
  const clearAuthStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    setToken(null);
    setRole(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Sync with localStorage changes (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'authToken') {
        const newToken = e.newValue;
        if (newToken) {
          try {
            const payload = parseJwt(newToken);
            
            if (!payload || !payload.id || !payload.sub || !payload.role) {
              throw new Error('Invalid token payload');
            }

            setToken(newToken);
            setRole(payload.role);
            setUser({
              id: payload.id,
              full_name: payload.sub,
              email: payload.email,
              role: payload.role,
            });
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Invalid token from storage event:', err);
            clearAuthStorage();
          }
        } else {
          // Token removed in another tab
          clearAuthStorage();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (newToken: string) => {
    console.log('AuthContext - Login called');
    try {
      const payload = parseJwt(newToken);
      
      if (!payload || !payload.id || !payload.sub || !payload.role) {
        throw new Error('Invalid token payload');
      }

      console.log('AuthContext - Login successful, role:', payload.role);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('isLoggedIn', 'true');
      
      setToken(newToken);
      setRole(payload.role);
      setUser({
        id: payload.id,
        full_name: payload.sub,
        email: payload.email,
        role: payload.role,
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.error('AuthContext - Login failed, invalid token:', err);
      throw new Error('Invalid authentication token');
    }
  };

  const logout = () => {
    console.log('AuthContext - Logout called');
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        token, 
        role, 
        user, 
        isLoading, 
        login, 
        logout 
      }}
    >
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