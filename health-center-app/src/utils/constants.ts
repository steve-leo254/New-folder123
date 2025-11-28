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
};

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

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
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