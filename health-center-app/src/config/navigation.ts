import {
  Home,
  Calendar,
  Users,
  FileText,
  Pill,
  TestTube,
  Settings,
  User,
  ShoppingCart,
  Video,
  Activity,
  Shield,
} from 'lucide-react';
import { ROLES, ADMIN_ROLES, STAFF_ROLES, PATIENT_ROLES } from '../routes';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  allowedRoles?: string[];
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: Home,
  },
  {
    label: 'Doctors',
    path: '/doctors',
    icon: Users,
  },
  {
    label: 'Appointments',
    path: '/appointments',
    icon: Calendar,
  },
  {
    label: 'Pharmacy',
    path: '/pharmacy',
    icon: Pill,
  },
  {
    label: 'Lab Tests',
    path: '/lab-tests',
    icon: TestTube,
  },
];

export const patientNavigation: NavItem[] = [
  {
    label: 'My Portal',
    path: '/patient',
    icon: Activity,
    allowedRoles: PATIENT_ROLES,
  },
  
  {
    label: 'My Appointments',
    path: '/appointments',
    icon: Calendar,
    allowedRoles: PATIENT_ROLES,
  },
  
  {
    label: 'Prescriptions',
    path: '/prescriptions',
    icon: FileText,
    allowedRoles: PATIENT_ROLES,
  },
  {
    label: 'Lab Results',
    path: '/lab-results',
    icon: TestTube,
    allowedRoles: PATIENT_ROLES,
  },
  {
    label: 'My Cart',
    path: '/cart',
    icon: ShoppingCart,
    allowedRoles: PATIENT_ROLES,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
    allowedRoles: PATIENT_ROLES,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    allowedRoles: PATIENT_ROLES,
  },
];

export const staffNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Activity,
    allowedRoles: STAFF_ROLES,
  },
  {
    label: 'Patients',
    path: '/patients',
    icon: Users,
    allowedRoles: STAFF_ROLES,
  },
  {
    label: 'Appointments',
    path: '/appointments',
    icon: Calendar,
    allowedRoles: STAFF_ROLES,
  },
  {
    label: 'Prescriptions',
    path: '/doctor-prescriptions',
    icon: FileText,
    allowedRoles: [ROLES.DOCTOR, ROLES.NURSE],
  },
  {
    label: 'Video Consultations',
    path: '/consultations',
    icon: Video,
    allowedRoles: [ROLES.DOCTOR],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    allowedRoles: STAFF_ROLES,
  },
];

export const adminNavigation: NavItem[] = [
  {
    label: 'Admin Dashboard',
    path: '/superadmindashboard',
    icon: Shield,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    allowedRoles: ADMIN_ROLES,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
    allowedRoles: ADMIN_ROLES,
  },
];

// Helper function to filter navigation by role
export const getNavigationByRole = (role?: string): NavItem[] => {
  if (!role) return mainNavigation;

  const roleLower = role.toLowerCase();

  if (ADMIN_ROLES.map((r) => r.toLowerCase()).includes(roleLower)) {
    return [...mainNavigation, ...adminNavigation, ...staffNavigation];
  }

  if (STAFF_ROLES.map((r) => r.toLowerCase()).includes(roleLower)) {
    return [...mainNavigation, ...staffNavigation];
  }

  if (PATIENT_ROLES.map((r) => r.toLowerCase()).includes(roleLower)) {
    return [...mainNavigation, ...patientNavigation];
  }

  return mainNavigation;
};
