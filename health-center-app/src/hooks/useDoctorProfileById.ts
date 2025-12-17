/**
 * Doctor Profile by ID Hook
 * Manages state and API calls for fetching a specific doctor's complete profile
 */

import { useState, useEffect, useCallback } from 'react';
import { doctorProfileService, DoctorProfile, DoctorEducation, DoctorContactInfo, DoctorAvailability } from '../services/doctorProfileService';

export const useDoctorProfileById = (doctorId: string | number) => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [education, setEducation] = useState<DoctorEducation[]>([]);
  const [contactInfo, setContactInfo] = useState<DoctorContactInfo | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoctorProfile = useCallback(async () => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch complete profile
      const profileData = await doctorProfileService.getCompleteProfile();
      setProfile(profileData);
      setEducation(profileData.education || []);
      setContactInfo(profileData.contact_info || null);
      setAvailability(profileData.availability || []);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor profile');
      console.error('Error loading doctor profile:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadDoctorProfile();
  }, [loadDoctorProfile]);

  return {
    profile,
    education,
    contactInfo,
    availability,
    loading,
    error,
    refetch: loadDoctorProfile
  };
};
