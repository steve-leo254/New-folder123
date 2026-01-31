import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, // ✅ Changed from User
  Lock,
  Heart,
  AlertTriangle,
  Shield,
  Bell,
  Save,
  X,
  Edit3,
} from 'lucide-react';

import { usePatient } from '../services/usePatient';
import { useAuth } from '../services/AuthContext';
import { PatientProfile as PatientProfileType } from '../services/api/patientApi';

import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

import {
  ProfileCard,
  HealthSummaryCard,
  NavigationCard,
  QuickActionsCard,
  PasswordChangeModal,
  AppointmentsSection, // ✅ Changed from PersonalInfoSection
  MedicalInfoSection,
  EmergencyContactSection,
  InsuranceSection,
  NotificationsSection,
  SecuritySection,
} from '../components/profile';

interface SectionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SectionConfig[] = [
  { id: 'appointments', label: 'My Appointments', icon: Calendar }, // ✅ Changed
  { id: 'medical', label: 'Medical Info', icon: Heart },
  { id: 'emergency', label: 'Emergency Contact', icon: AlertTriangle },
  { id: 'insurance', label: 'Insurance', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

const PatientProfile: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    patient,
    loading,
    error,
    updatePatient,
    uploadAvatar,
    changePassword,
    downloadRecords,
    exportData,
  } = usePatient();

  const [activeSection, setActiveSection] = useState<string>('appointments'); // ✅ Changed default
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<PatientProfileType | null>(null);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Check authentication
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Initialize form data when patient data loads
  useEffect(() => {
    if (patient) {
      setFormData({ ...patient });
    }
  }, [patient]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!formData) return;

    try {
      const payload = {
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        blood_type: formData.bloodType,
        height: formData.height,
        weight: formData.weight,
        allergies: formData.allergies,
        conditions: formData.conditions,
        medications: formData.medications,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_relation: formData.emergencyContactRelation,
        insurance_provider: formData.insuranceProvider,
        insurance_policy_number: formData.insurancePolicyNumber,
        insurance_group_number: formData.insuranceGroupNumber,
        insurance_holder_name: formData.insuranceHolderName,
        insurance_type: formData.insuranceType,
        quarterly_limit: formData.insuranceQuarterlyLimit,
        quarterly_used: formData.insuranceQuarterlyUsed,
        coverage_start_date: formData.insuranceCoverageStartDate,
        coverage_end_date: formData.insuranceCoverageEndDate,
        email_notifications: formData.emailNotifications,
        sms_notifications: formData.smsNotifications,
        appointment_reminders: formData.appointmentReminders,
        lab_results_notifications: formData.labResultsNotifications,
      };

      const result = await updatePatient(payload);
      if (result.success) {
        setIsEditing(false);
        // Show success message
        setSaveMessage({ type: 'success', message: 'Profile updated successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', message: result.error || 'Failed to update profile' });
        setTimeout(() => setSaveMessage(null), 5000);
      }
    } catch (err) {
      setSaveMessage({ type: 'error', message: 'An error occurred while updating profile' });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (patient) {
      setFormData({ ...patient });
    }
    setIsEditing(false);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveMessage({ type: 'error', message: 'Please select an image file.' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage({ type: 'error', message: 'Image size must be less than 5MB.' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAvatar(file);
      setSaveMessage({ type: 'success', message: 'Profile picture updated!' });
      
      // The uploadAvatar function already updates the local patient state
      // No need to call refreshProfile() as it might fetch stale data
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setSaveMessage({ type: 'error', message: 'Failed to upload avatar' });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveMessage({ type: 'error', message: 'Passwords do not match.' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setSaveMessage({ type: 'error', message: 'Password must be at least 8 characters.' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);

    if (result.success) {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaveMessage({ type: 'success', message: 'Password changed successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage({ type: 'error', message: result.error || 'Failed to change password' });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Download records handler
  const handleDownloadRecords = async () => {
    try {
      const blob = await downloadRecords();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `medical_records_${currentDate}.pdf`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSaveMessage({ type: 'success', message: 'Medical records downloaded successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', message: 'Failed to download records' });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Export data handler
  const handleExportData = async () => {
    try {
      await exportData();
      setSaveMessage({ type: 'success', message: 'Patient data exported successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', message: 'Failed to export data' });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Calculate age
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Loading state
  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading patient profile..." />
      </div>
    );
  }

  // Error state
  if (error && !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert type="error" message={error} onClose={() => navigate('/patient')} />
      </div>
    );
  }

  // No data state
  if (!formData) {
    return null;
  }

  // ✅ Hide edit controls for appointments section
  const showEditControls = activeSection !== 'appointments';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert
                type={saveMessage.type}
                message={saveMessage.message}
                onClose={() => setSaveMessage(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ProfileCard
              formData={formData}
              isUploading={isUploading}
              fileInputRef={fileInputRef}
              onImageUpload={handleImageUpload}
              calculateAge={calculateAge}
            />

            {/* Health Summary Card */}
            <HealthSummaryCard />

            {/* Navigation Card */}
            <NavigationCard
              sections={sections}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Quick Actions Card */}
            <QuickActionsCard
              onChangePassword={() => setShowPasswordModal(true)}
              onDownloadRecords={handleDownloadRecords}
              onExportData={handleExportData}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Edit Controls - Only show for editable sections */}
            {showEditControls && (
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {sections.find((s) => s.id === activeSection)?.label}
                </h2>

                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Section Content */}
            <AnimatePresence mode="wait">
              {activeSection === 'appointments' && (
                <AppointmentsSection patientId={formData.id} />
              )}

              {activeSection === 'medical' && (
                <MedicalInfoSection isEditing={isEditing} />
              )}

              {activeSection === 'emergency' && (
                <EmergencyContactSection 
                  isEditing={isEditing} 
                  formData={formData}
                  onFormDataChange={setFormData}
                />
              )}

              {activeSection === 'insurance' && (
                <InsuranceSection 
                  isEditing={isEditing} 
                  formData={formData}
                  onFormDataChange={setFormData}
                />
              )}

              {activeSection === 'notifications' && (
                <NotificationsSection isEditing={isEditing} />
              )}

              {activeSection === 'security' && (
                <SecuritySection onChangePassword={() => setShowPasswordModal(true)} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Password Change Modal */}
        <PasswordChangeModal
          show={showPasswordModal}
          passwordForm={passwordForm}
          showPasswords={showPasswords}
          onClose={() => setShowPasswordModal(false)}
          onPasswordFormChange={setPasswordForm}
          onShowPasswordsChange={setShowPasswords}
          onSubmit={handlePasswordChange}
        />
      </div>
    </div>
  );
};

export default PatientProfile;
