import { ReactNode } from 'react';

export interface RouteConfig {
  path: string;
  element: ReactNode;
  allowedRoles?: string[];
  title?: string;
  icon?: ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export type UserRole =
  | 'super_admin'
  | 'clinical_admin'
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'lab_technician'
  | 'pharmacist'
  | 'patient';
