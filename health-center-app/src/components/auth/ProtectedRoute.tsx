import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import { jwtDecode } from 'jwt-decode';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}) => {
  const { token } = useAuth();

  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If no specific roles required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  try {
    const decoded: any = jwtDecode(token);
    const userRole = decoded.role;

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(userRole)) {
      return <>{children}</>;
    }

    // User doesn't have required role, redirect to fallback
    return <Navigate to={fallbackPath} replace />;
  } catch (err) {
    console.error('Failed to decode token:', err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
