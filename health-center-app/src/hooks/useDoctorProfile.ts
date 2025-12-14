/**
 * Doctor Profile Hook
 * Manages state and API calls for doctor profile functionality with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  doctorProfileService, 
  DoctorProfile, 
  DoctorEducation, 
  DoctorContactInfo, 
  DoctorAvailability, 
  DoctorSettings,
  handleProfileError,
  validateEducation,
  validateContactInfo,
  validateAvailability
} from '../services/doctorProfileService';
import { profileWebSocket } from '../services/profileWebSocket';

export const useDoctorProfile = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [education, setEducation] = useState<DoctorEducation[]>([]);
  const [contactInfo, setContactInfo] = useState<DoctorContactInfo | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [settings, setSettings] = useState<DoctorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load complete profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await doctorProfileService.getCompleteProfile();
      setProfile(profileData);
      setEducation(profileData.education);
      setContactInfo(profileData.contact_info);
      setAvailability(profileData.availability);
      setSettings(profileData.settings);
    } catch (err: any) {
      setError(handleProfileError(err, 'Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load individual sections
  const loadEducation = useCallback(async () => {
    try {
      const data = await doctorProfileService.getEducation();
      setEducation(data);
    } catch (err: any) {
      setError(handleProfileError(err, 'Failed to load education'));
    }
  }, []);

  const loadContactInfo = useCallback(async () => {
    try {
      const data = await doctorProfileService.getContactInfo();
      setContactInfo(data);
    } catch (err: any) {
      setError(handleProfileError(err, 'Failed to load contact info'));
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    try {
      const data = await doctorProfileService.getAvailability();
      setAvailability(data);
    } catch (err: any) {
      setError(handleProfileError(err, 'Failed to load availability'));
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await doctorProfileService.getSettings();
      setSettings(data);
    } catch (err: any) {
      setError(handleProfileError(err, 'Failed to load settings'));
    }
  }, []);

  // Education CRUD operations
  const addEducation = useCallback(async (educationData: Omit<DoctorEducation, 'id' | 'doctor_id' | 'created_at'>) => {
    try {
      setSaving(true);
      const validationErrors = validateEducation(educationData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const newEducation = await doctorProfileService.addEducation(educationData);
      setEducation(prev => [newEducation, ...prev]);
      
      // Emit WebSocket event for real-time updates
      profileWebSocket.emitEducationUpdate(newEducation);
      
      return newEducation;
    } catch (err: any) {
      const errorMessage = handleProfileError(err, 'Failed to add education');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateEducation = useCallback(async (id: number, educationData: Omit<DoctorEducation, 'id' | 'doctor_id' | 'created_at'>) => {
    try {
      setSaving(true);
      const validationErrors = validateEducation(educationData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const updatedEducation = await doctorProfileService.updateEducation(id, educationData);
      setEducation(prev => prev.map(edu => edu.id === id ? updatedEducation : edu));
      
      // Emit WebSocket event for real-time updates
      profileWebSocket.emitEducationUpdate(updatedEducation);
      
      return updatedEducation;
    } catch (err: any) {
      const errorMessage = handleProfileError(err, 'Failed to update education');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setSaving(false);
    }
  }, []);
    
  const deleteEducation = useCallback(async (id: number) => {
    try {
      setSaving(true);
      await doctorProfileService.deleteEducation(id);
      setEducation(prev => prev.filter(edu => edu.id !== id));
      
      // Emit WebSocket event for real-time updates
      profileWebSocket.emitEducationUpdate({ id, action: 'delete' });
    } catch (err: any) {
      const errorMessage = handleProfileError(err, 'Failed to delete education');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setSaving(false);
    }
  }, []);

  // Contact Info operations
  const updateContactInfo = useCallback(async (contactData: Partial<DoctorContactInfo>) => {
    try {
      setSaving(true);
      const validationErrors = validateContactInfo(contactData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const updatedContactInfo = await doctorProfileService.updateContactInfo(contactData);
      setContactInfo(updatedContactInfo);
      
      // Emit WebSocket event for real-time updates
      profileWebSocket.emitContactUpdate(updatedContactInfo);
      
      return updatedContactInfo;
    } catch (err: any) {
      const errorMessage = handleProfileError(err, 'Failed to update contact info');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setSaving(false);
    }
  }, []);

  // Availability operations
  const updateAvailability = useCallback(async (id: number, availabilityData: Partial<DoctorAvailability>) => {
    try {
      setSaving(true);
      const validationErrors = validateAvailability(availabilityData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const updatedAvailability = await doctorProfileService.updateAvailability(id, availabilityData);
      setAvailability(prev => prev.map(avail => avail.id === id ? updatedAvailability : avail));
      
      // Emit WebSocket event for real-time updates
      profileWebSocket.emitAvailabilityUpdate(availability);
      
      return updatedAvailability;
    } catch (err: any) {
      const errorMessage = handleProfileError(err, 'Failed to update availability');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateBulkAvailability = useCallback(async (availabilityData: Partial<DoctorAvailability>[]) => {
    try {
      setSaving(true);
      
      // Validate all availability entries
      for (const avail of availabilityData) {
        const validationErrors = validateAvailability(avail);
        if (validationErrors.length > 0) {
          throw new Error(`${avail.day}: ${validationErrors.join(', ')}`);
        }
      }

      const updatedAvailability = await doctorProfileService.updateBulkAvailability(availabilityData);
      setAvailability(updatedAvailability);
      
      // Emit WebSocket event for real-time updates
      profileWebSocket.emitAvailabilityUpdate(updatedAvailability);
      
      return updatedAvailability;
    } catch (err: any) {
      const errorMessage = handleProfileError(err, 'Failed to update availability');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setSaving(false);
    }
  }, []);

  // Settings operations
  const updateSettings = useCallback(async (settingsData: Partial<DoctorSettings>) => {
    try {
      setSaving(true);
      const updatedSettings = await doctorProfileService.updateSettings(settingsData);
      setSettings(updatedSettings);
      
      // Emit WebSocket event for real-time updates
      profileWebSocket.emitSettingsUpdate(updatedSettings);
      
      return updatedSettings;
    } catch (err: any) {
      const errorMessage = handleProfileError(err, 'Failed to update settings');
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setSaving(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // WebSocket real-time updates
  useEffect(() => {
    // Set up WebSocket listeners for real-time updates
    const unsubscribeEducation = profileWebSocket.onUpdate('education', (event) => {
      if (event.action === 'create' || event.action === 'update') {
        setEducation(prev => {
          const existing = prev.find(edu => edu.id === event.data.id);
          if (existing) {
            return prev.map(edu => edu.id === event.data.id ? event.data : edu);
          } else {
            return [event.data, ...prev];
          }
        });
      } else if (event.action === 'delete') {
        setEducation(prev => prev.filter(edu => edu.id !== event.data.id));
      }
    });

    const unsubscribeContact = profileWebSocket.onUpdate('contact', (event) => {
      setContactInfo(event.data);
    });

    const unsubscribeAvailability = profileWebSocket.onUpdate('availability', (event) => {
      setAvailability(event.data);
    });

    const unsubscribeSettings = profileWebSocket.onUpdate('settings', (event) => {
      setSettings(event.data);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeEducation();
      unsubscribeContact();
      unsubscribeAvailability();
      unsubscribeSettings();
    };
  }, []);

  // Fallback polling for when WebSocket is not available
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !saving && !profileWebSocket.isConnected()) {
        loadProfile();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadProfile, loading, saving]);

  return {
    // State
    profile,
    education,
    contactInfo,
    availability,
    settings,
    loading,
    saving,
    error,

    // Actions
    loadProfile,
    loadEducation,
    loadContactInfo,
    loadAvailability,
    loadSettings,
    
    // Education
    addEducation,
    updateEducation,
    deleteEducation,
    
    // Contact Info
    updateContactInfo,
    
    // Availability
    updateAvailability,
    updateBulkAvailability,
    
    // Settings
    updateSettings,
    
    // Utilities
    clearError
  };
};
