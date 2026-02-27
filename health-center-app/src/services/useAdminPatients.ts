import { useState, useEffect } from 'react';
import apiClient from './api';

export interface PatientRecord {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  blood_type: string;
  height: string;
  weight: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_group_number: string;
  insurance_holder_name: string;
  insurance_type: string;
  quarterly_limit: number;
  quarterly_used: number;
  coverage_start_date: string;
  coverage_end_date: string;
  profile_picture: string;
  member_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
  email_notifications: boolean;
  sms_notifications: boolean;
  appointment_reminders: boolean;
  lab_results_notifications: boolean;
  // Additional fields for admin view
  appointments_count?: number;
  last_visit?: string;
  total_billed?: number;
  insurance_status?: string;
}

export interface AdminPatientsResponse {
  patients: PatientRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAdminPatients = () => {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchPatients = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    filters?: {
      status?: string;
      gender?: string;
      blood_type?: string;
      city?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<PatientRecord[]>(
        `/patients`
      );

      // Transform the response to match expected format
      const allPatients = response.data.map((patient: any) => {
        // Extract medical info if available
        const medicalInfo = patient.medical_info || {};
        
        return {
          ...patient,
          user_id: patient.id, // Map id to user_id for frontend compatibility
          conditions: medicalInfo.conditions || [],
          medications: medicalInfo.medications || [],
          allergies: medicalInfo.allergies || [],
          blood_type: medicalInfo.blood_type || patient.bloodType || patient.blood_type || 'N/A',
          height: medicalInfo.height || patient.height || 'N/A',
          weight: medicalInfo.weight || patient.weight || 'N/A',
          status: patient.status || 'active',
          date_of_birth: patient.date_of_birth_formatted || patient.date_of_birth,
          zip_code: patient.zip_code || '',
          country: patient.country || '',
          member_id: patient.member_id || '',
          appointments_count: patient.appointments_count || 0,
          last_visit: patient.last_visit || null,
          total_billed: patient.total_billed || 0,
          insurance_status: patient.insurance_status || 'Unknown',
          // Add missing fields that frontend expects
          emergency_contact_name: '',
          emergency_contact_phone: '',
          emergency_contact_relation: '',
          insurance_provider: '',
          insurance_policy_number: '',
          insurance_group_number: '',
          insurance_holder_name: '',
          insurance_type: '',
          quarterly_limit: 0,
          quarterly_used: 0,
          coverage_start_date: '',
          coverage_end_date: '',
          email_notifications: false,
          sms_notifications: false,
          appointment_reminders: false,
          lab_results_notifications: false,
        };
      });
      let filteredPatients = allPatients;

      // Apply client-side filtering since backend doesn't support these parameters
      if (search) {
        filteredPatients = filteredPatients.filter(patient => 
          patient.full_name.toLowerCase().includes(search.toLowerCase()) ||
          patient.email.toLowerCase().includes(search.toLowerCase()) ||
          patient.phone?.includes(search)
        );
      }

      if (filters?.gender) {
        filteredPatients = filteredPatients.filter(patient => patient.gender === filters.gender);
      }

      if (filters?.status) {
        filteredPatients = filteredPatients.filter(patient => patient.status === filters.status);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

      setPatients(paginatedPatients);
      setPagination({
        page,
        limit,
        total: filteredPatients.length,
        totalPages: Math.ceil(filteredPatients.length / limit),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPatientById = async (patientId: string): Promise<PatientRecord | null> => {
    try {
      // Get all patients and find the one by ID since backend doesn't have individual endpoint
      const response = await apiClient.get<PatientRecord[]>(`/patients`);
      const patient = response.data.find(p => p.id === patientId);
      return patient || null;
    } catch (err: any) {
      console.error('Error fetching patient:', err);
      return null;
    }
  };

  const updatePatientStatus = async (
    patientId: string,
    status: 'active' | 'inactive'
  ): Promise<boolean> => {
    // This endpoint doesn't exist in backend yet - return mock success
    console.log(`Updating patient ${patientId} status to ${status} (not implemented in backend)`);
    
    // Update local state optimistically
    setPatients(prev =>
      prev.map(patient =>
        patient.id === patientId ? { ...patient, status } : patient
      )
    );
    
    return true;
  };

  const exportPatientsData = async (
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<Blob> => {
    // This endpoint doesn't exist in backend yet - create mock export
    console.log(`Exporting patients in ${format} format (not implemented in backend)`);
    
    if (format === 'csv') {
      // Create a proper CSV with headers
      const headers = [
        'ID', 'Full Name', 'Email', 'Phone', 'Gender', 'Blood Type', 
        'Height', 'Weight', 'Status', 'Created At'
      ];
      
      const csvContent = [
        headers.join(','),
        ...patients.map(patient => [
          patient.id,
          `"${patient.full_name}"`,
          `"${patient.email}"`,
          `"${patient.phone || ''}"`,
          `"${patient.gender || ''}"`,
          `"${patient.blood_type || ''}"`,
          `"${patient.height || ''}"`,
          `"${patient.weight || ''}"`,
          `"${patient.status || ''}"`,
          `"${patient.created_at || ''}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return blob;
    } else if (format === 'excel') {
      // For now, return CSV format for excel as well
      return exportPatientsData('csv');
    } else if (format === 'pdf') {
      // Create a simple text-based PDF content
      const pdfContent = patients.map(patient => 
        `Patient: ${patient.full_name}\n` +
        `Email: ${patient.email}\n` +
        `Phone: ${patient.phone || 'N/A'}\n` +
        `Blood Type: ${patient.blood_type || 'N/A'}\n` +
        `Height: ${patient.height || 'N/A'}\n` +
        `Weight: ${patient.weight || 'N/A'}\n` +
        `Status: ${patient.status || 'active'}\n` +
        `----------------------------------------\n`
      ).join('\n');
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      return blob;
    }
    
    return new Blob([], { type: 'application/octet-stream' });
  };

  const getPatientsStats = async () => {
    // This endpoint doesn't exist in backend yet - return mock stats
    console.log('Fetching patient stats (not implemented in backend)');
    
    return {
      total_patients: patients.length,
      active_patients: patients.filter(p => p.status === 'active').length,
      inactive_patients: patients.filter(p => p.status === 'inactive').length,
      new_patients_this_month: 0, // Would need date filtering
    };
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    pagination,
    fetchPatients,
    getPatientById,
    updatePatientStatus,
    exportPatientsData,
    getPatientsStats,
    refreshPatients: () => fetchPatients(pagination.page, pagination.limit),
  };
};
