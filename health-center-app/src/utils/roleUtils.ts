// utils/roleUtils.ts
/**
 * Enhanced role utility functions for consistent role checking across the application
 */

import { 
  ROLE_TYPES, 
  ROLE_HIERARCHY, 
  ROLE_PERMISSIONS, 
  ROLE_ALIASES,
  getRoleLevel, 
  hasPermission, 
  canAccessRole,
  normalizeRoleForHierarchy
} from './constants';

/**
 * Normalize role string with alias support - updated for backend compatibility
 */
export const normalizeRole = (role?: string | null): string => {
  if (!role) return '';
  
  // Convert to lowercase, trim, replace spaces and hyphens with underscores
  const cleaned = role.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_');
  
  // Check if there's an alias for this role
  return ROLE_ALIASES[cleaned] || cleaned;
};

/**
 * Check if user role matches any of the allowed roles
 */
export const hasRole = (userRole: string | null | undefined, allowedRoles: string[]): boolean => {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) {
    return false;
  }

  const normalizedUserRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map(role => normalizeRole(role));

  console.log('hasRole check:', {
    userRole,
    normalizedUserRole,
    allowedRoles,
    normalizedAllowedRoles,
    hasAccess: normalizedAllowedRoles.includes(normalizedUserRole)
  });

  return normalizedAllowedRoles.includes(normalizedUserRole);
};

// Update other role checking functions as needed...

// Re-export constants for convenience
export { ROLE_TYPES, ROLE_HIERARCHY, ROLE_PERMISSIONS, ROLE_ALIASES };