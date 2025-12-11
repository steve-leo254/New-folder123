// components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { normalizeRole, hasRole } from '../../utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Check:', {
    path: location.pathname,
    isLoading,
    hasToken: !!token,
    hasUser: !!user,
    userRole: user?.role,
    allowedRoles,
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Checking authentication..." fullScreen={true} />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!token || !user) {
    console.warn('ProtectedRoute - No auth, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Validate user has a role
  if (!user.role) {
    console.error('ProtectedRoute - User missing role:', user);
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location, 
          error: 'Invalid user role. Please login again.' 
        }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const hasAccess = hasRole(user.role, allowedRoles);

      if (!hasAccess) {
        console.warn(
          'ProtectedRoute - Access denied.',
          'User role:', user.role,
          'Required roles:', allowedRoles
        );
        
        // Redirect based on user role with state preservation
        const redirectPath = getRedirectPathByRole(user.role);
        
        return (
          <Navigate
            to={redirectPath}
            state={{ 
              from: location,
              error: 'You do not have permission to access this page'
            }}
            replace
          />
        );
      }

      console.log('ProtectedRoute - Access granted');
    } catch (error) {
      console.error('ProtectedRoute - Error checking role access:', error);
      return (
        <Navigate 
          to="/login" 
          state={{ 
            error: 'Authentication error. Please login again.' 
          }} 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
};

// Helper function to determine redirect path based on role
const getRedirectPathByRole = (role: string): string => {
  try {
    const normalizedRole = normalizeRole(role);

    // Updated to match backend role names
    const roleRedirects: Record<string, string> = {
      super_admin: '/superadmindashboard',
      clinician_admin: '/superadmindashboard', // Match backend exactly
      doctor: '/dashboard',
      nurse: '/dashboard',
      receptionist: '/dashboard',
      lab_technician: '/dashboard',
      pharmacist: '/dashboard',
      patient: '/patient',
    };

    const redirectPath = roleRedirects[normalizedRole];
    
    if (!redirectPath) {
      console.warn(`ProtectedRoute - No redirect path for role: ${normalizedRole}, using default`);
      return '/dashboard';
    }

    console.log(`ProtectedRoute - Redirecting ${normalizedRole} to ${redirectPath}`);
    return redirectPath;
  } catch (error) {
    console.error('ProtectedRoute - Error in getRedirectPathByRole:', error);
    return '/dashboard';
  }
};

export default ProtectedRoute;