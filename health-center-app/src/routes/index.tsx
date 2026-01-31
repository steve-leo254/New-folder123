import React from 'react';
import { Navigate } from 'react-router-dom';
import DoctorProfilePage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
// Page Imports
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import WishlistPage from '../pages/WishlistPage';
import MedicationDetailPage from '../pages/MedicationDetailPage';
import PatientProfile from '../pages/PatientProfile';
import AppointmentsPage from '../pages/AppointmentsPage';
import PrescriptionPage from '../pages/PrescriptionPage'; // Using test component temporarily
import DoctorsPage from '../pages/DoctorsPage';
import VideoChatPage from '../pages/VideoChatPage';
import CheckoutPage from '../pages/CheckoutPage';
import CartPage from '../pages/CartPage';
import PharmacyPage from '../pages/PharmacyPage';
import DoctorPrescriptionPage from '../pages/DoctorPrescriptionPage';
import LabTestPage from '../pages/LabTestPage';
import MentalHealthPage from '@/pages/MentalHealthPage';
import HealthCheckupsPage from '@/pages/HealthCheckupsPage';

import SettingsPage from '../pages/SettingsPage';
// import LabResultsPage from '../pages/LabResultsPage';

// Wrapper Components
import { DoctorsProfilePageWrapper } from '../components/wrappers/DoctorsProfilePageWrapper';

// Types
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  allowedRoles?: string[];
}

// Role Constants - Import from centralized constants
import { ROLE_TYPES } from '../utils/constants';
import GeneralPracticePage from '@/pages/GeneralPracticePage';
import ForgotPasswordPage from '@/pages/ForgetPasswordPage';
import EmailVerificationPage from '@/pages/EmailVerificationPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsAndConditionsPage from '@/pages/TermsAndConditionsPage';
import ChatPage from '@/pages/ChatPage';
import MedicalHistoryPage from '@/pages/MedicalHistoryPage';


export const ROLES = ROLE_TYPES;

// Role Groups
export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.CLINICIAN_ADMIN];

export const STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.CLINICIAN_ADMIN,
  ROLES.DOCTOR,
  ROLES.NURSE,
  ROLES.RECEPTIONIST,
  ROLES.LAB_TECHNICIAN,
  ROLES.PHARMACIST,
];

export const PATIENT_ROLES = [ROLES.PATIENT];

export const ALL_AUTHENTICATED_ROLES = [...STAFF_ROLES, ...PATIENT_ROLES];

// Public Routes (No authentication required)
export const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/terms-and-conditions',
    element: <TermsAndConditionsPage />,
  },

   {
    path: '/forget-password',
    element: <ForgotPasswordPage />,
  },
   {
    path: '/email-verification',
    element: <EmailVerificationPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  }
];

// Admin-only Routes
export const adminRoutes: RouteConfig[] = [
  {
    path: '/superadmindashboard',
    element: <SuperAdminDashboard />,
    allowedRoles: ADMIN_ROLES,
  },
  {
    path: '/admin/settings',
    element: <SettingsPage />,
    allowedRoles: ADMIN_ROLES,
  },
];

// Staff Routes
export const staffRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <DoctorProfilePage />,
    allowedRoles: STAFF_ROLES,
  },
  {
    path: '/doctor-prescriptions',
    element: <DoctorPrescriptionPage />,
    allowedRoles: [ROLES.DOCTOR, ROLES.NURSE, ...ADMIN_ROLES],
  },
];

// Protected Routes (Any authenticated user)
export const protectedRoutes: RouteConfig[] = [
  // Patient Portal - Consolidated routes
  {
    path: '/patient',
    element: <PatientProfile />,
    allowedRoles: PATIENT_ROLES,
  },
  {
    path: '/patient-portal',
    element: <Navigate to="/patient" replace />,
  },
  {
    path: '/patient-profile',
    element: <Navigate to="/patient" replace />,
  },
  {
    path: '/wishlist',
    element: <WishlistPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },
  {
    path: '/medication/:id',
    element: <MedicationDetailPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },
  {
     path: '/general-practice',
     element: <GeneralPracticePage />,
  },
  
   {
    path: '/mental-health',
    element: <MentalHealthPage />,
  }, {
    path: '/health-checkup',
    element: <HealthCheckupsPage />,
  },

  // Appointments
  {
    path: '/appointments',
    element: <AppointmentsPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },

  // Prescriptions
  {
    path: '/prescriptions',
    element: <PrescriptionPage />,
    allowedRoles: [ROLES.PATIENT, ROLES.DOCTOR, ROLES.NURSE, ...ADMIN_ROLES],
  },

  // Profile
  {
    path: '/profile',
    element: <ProfilePage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },

  // Settings
  {
    path: '/settings',
    element: <SettingsPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },

  // Doctors - Consolidated routes
  {
    path: '/doctors',
    element: <DoctorsPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },
  {
    path: '/doctor/:id',
    element: <DoctorsProfilePageWrapper />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },
  {
    path: '/doctor-profile/:doctorId',
    element: <Navigate to="/doctor/:doctorId" replace />,
  },
  {
    path: '/doctors-profile',
    element: <Navigate to="/doctors" replace />,
  },

  // Video Chat - Restricted to medical staff
  {
    path: '/video-chat/:id',
    element: <VideoChatPage />,
    allowedRoles: [ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT, ...ADMIN_ROLES],
  },

  // Shopping
  {
    path: '/cart',
    element: <CartPage />,
    allowedRoles: [ROLES.PATIENT, ...ADMIN_ROLES],
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
    allowedRoles: [ROLES.PATIENT, ...ADMIN_ROLES],
  },

  // Pharmacy & Medications
  {
    path: '/medications',
    element: <PharmacyPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },

  // Lab Tests & Results
  {
    path: '/lab-tests',
    element: <LabTestPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },

  // Chat (Coming Soon)
  {
    path: '/chat',
    element: <ChatPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },

  // Medical History
  {
    path: '/medical-history',
    element: <MedicalHistoryPage />,
    allowedRoles: ALL_AUTHENTICATED_ROLES,
  },
 
];

// Export all routes combined
export const allRoutes = [
  ...publicRoutes,
  ...adminRoutes,
  ...staffRoutes,
  ...protectedRoutes,
];
