/**
 * Application constants - centralized configuration
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    UPDATE: '/appointments/:id',
    CANCEL: '/appointments/:id/cancel',
  },
  DOCTORS: {
    LIST: '/doctors',
    DETAIL: '/doctors/:id',
    AVAILABILITY: '/doctors/:id/availability',
  },
  PRESCRIPTIONS: {
    LIST: '/prescriptions',
    CREATE: '/prescriptions',
    DETAIL: '/prescriptions/:id',
  },
  MEDICATIONS: {
    LIST: '/medications',
    SEARCH: '/medications/search',
    ORDER: '/medications/order',
  },
  VIDEO_CALL: {
    INITIATE: '/video-call/initiate',
    JOIN: '/video-call/join',
    END: '/video-call/end',
  },
  USERS: {
    LIST: '/users',
    DETAIL: '/users/:id',
    BY_ROLE: '/users/role/:role',
  },
  STAFF_ROLES: {
    LIST: '/staff-roles',
    CREATE: '/staff-roles',
    UPDATE: '/staff-roles/:id',
    DELETE: '/staff-roles/:id',
  },
};

// Enhanced role system with unique identifiers
export const ROLE_TYPES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  SUPER_ADMIN: 'super_admin',
  CLINICAL_ADMIN: 'clinician_admin', // Normalized version
  
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
} as const;

// Role aliases for backend compatibility
export const ROLE_ALIASES: Record<string, string> = {
  'clinician_admin': 'clinician_admin',
  'clinical_admin': 'clinician_admin',
  'clinic_admin': 'clinician_admin',
  'admin': 'clinician_admin',
  'superadmin': 'super_admin',
  'super admin': 'super_admin',
  'lab technician': 'lab_technician',
  'labtechnician': 'lab_technician',
};

export const ROLE_HIERARCHY = {
  [ROLE_TYPES.SUPER_ADMIN]: 100,
  [ROLE_TYPES.CLINICAL_ADMIN]: 90,
  [ROLE_TYPES.DOCTOR]: 80,
  [ROLE_TYPES.NURSE]: 70,
  [ROLE_TYPES.PHARMACIST]: 60,
  [ROLE_TYPES.LAB_TECHNICIAN]: 50,
  [ROLE_TYPES.RECEPTIONIST]: 40,
  [ROLE_TYPES.PATIENT]: 10,
} as const;

export const ROLE_PERMISSIONS = {
  [ROLE_TYPES.SUPER_ADMIN]: [
    'manage_all_users',
    'manage_staff_roles',
    'manage_system_settings',
    'view_all_data',
    'delete_any_record',
  ],
  [ROLE_TYPES.CLINICAL_ADMIN]: [
    'manage_staff',
    'manage_appointments',
    'view_patient_data',
    'manage_billing',
    'generate_reports',
  ],
  [ROLE_TYPES.DOCTOR]: [
    'view_assigned_patients',
    'create_prescriptions',
    'manage_appointments',
    'view_medical_records',
    'update_patient_data',
  ],
  [ROLE_TYPES.NURSE]: [
    'view_patient_data',
    'update_vitals',
    'manage_appointments',
    'assist_doctor',
  ],
  [ROLE_TYPES.PHARMACIST]: [
    'manage_medications',
    'view_prescriptions',
    'dispense_medications',
  ],
  [ROLE_TYPES.LAB_TECHNICIAN]: [
    'manage_lab_tests',
    'view_test_requests',
    'update_test_results',
  ],
  [ROLE_TYPES.RECEPTIONIST]: [
    'manage_appointments',
    'patient_registration',
    'basic_billing',
  ],
  [ROLE_TYPES.PATIENT]: [
    'view_own_data',
    'book_appointments',
    'view_prescriptions',
    'update_own_profile',
  ],
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const APPOINTMENT_TYPE = {
  IN_PERSON: 'in-person',
  VIDEO: 'video',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

export const MEDICATION_CATEGORIES = [
  'Antibiotics',
  'Pain Relief',
  'Vitamins',
  'Heart Health',
  'Diabetes',
  'Allergy',
  'Cold & Flu',
  'Digestive Health',
  'Mental Health',
  'Women\'s Health',
  'Men\'s Health',
  'Children\'s Health',
];

export const SPECIALIZATIONS = [
  'Cardiologist',
  'Pediatrician',
  'Dermatologist',
  'General Practitioner',
  'Neurologist',
  'Orthopedic',
  'Gynecologist',
  'Psychiatrist',
  'Ophthalmologist',
  'ENT Specialist',
  'Urologist',
  'Endocrinologist',
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const TIME_SLOTS = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
];

// Helper functions for role management
export const getRoleLevel = (role: string): number => {
  const normalizedRole = normalizeRoleForHierarchy(role);
  return ROLE_HIERARCHY[normalizedRole as keyof typeof ROLE_HIERARCHY] || 0;
};

export const normalizeRoleForHierarchy = (role: string): string => {
  const normalized = role.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_');
  return ROLE_ALIASES[normalized] || normalized;
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  const normalizedRole = normalizeRoleForHierarchy(userRole);
  const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
  const isValidPermission = allPermissions.includes(permission as any);
  
  if (!isValidPermission) return false;
  
  const roleKey = normalizedRole as keyof typeof ROLE_PERMISSIONS;
  const permissions = ROLE_PERMISSIONS[roleKey];
  
  return permissions ? permissions.some(p => p === permission) : false;
};

export const canAccessRole = (userRole: string, targetRole: string): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(targetRole);
};