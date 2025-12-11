import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Heart, AlertTriangle,
  Shield, Bell, Save, X,
  Edit3
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
  PersonalInfoSection,
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
  { id: 'personal', label: 'Personal Info', icon: User },
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

  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<PatientProfileType | null>(null);
  const [newItems, setNewItems] = useState({
    allergy: '',
    condition: '',
    medication: '',
  });

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

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  // Handle toggle changes for notifications
  const handleToggleChange = (field: keyof PatientProfileType) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [field]: !formData[field],
    });
  };

  // Save profile changes
  const handleSave = async () => {
    if (!formData) return;

    const updateData = {
      full_name: `${formData.firstName} ${formData.lastName}`,
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
      email_notifications: formData.emailNotifications,
      sms_notifications: formData.smsNotifications,
      appointment_reminders: formData.appointmentReminders,
      lab_results_notifications: formData.labResultsNotifications,
    };

    const result = await updatePatient(updateData);

    if (result.success) {
      setIsEditing(false);
      showSuccessMessage('Profile updated successfully!');
    } else {
      showErrorMessage(result.error || 'Failed to update profile');
    }
  };

  // Cancel editing
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
      showErrorMessage('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage('Image size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    const result = await uploadAvatar(file);
    setIsUploading(false);

    if (result.success) {
      showSuccessMessage('Profile picture updated!');
    } else {
      showErrorMessage(result.error || 'Failed to upload avatar');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showErrorMessage('Passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showErrorMessage('Password must be at least 8 characters.');
      return;
    }

    const result = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (result.success) {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccessMessage('Password changed successfully!');
    } else {
      showErrorMessage(result.error || 'Failed to change password');
    }
  };

  // Add item to array fields
  const addItem = (type: 'allergies' | 'conditions' | 'medications', value: string) => {
    if (!formData || !value.trim()) return;

    setFormData({
      ...formData,
      [type]: [...formData[type], value.trim()],
    });

    setNewItems((prev) => ({
      ...prev,
      [type === 'allergies' ? 'allergy' : type === 'conditions' ? 'condition' : 'medication']: '',
    }));
  };

  // Remove item from array fields
  const removeItem = (type: 'allergies' | 'conditions' | 'medications', index: number) => {
    if (!formData) return;

    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    });
  };

  // Download records handler
  const handleDownloadRecords = async () => {
    try {
      await downloadRecords();
      showSuccessMessage('Medical records downloaded successfully!');
    } catch (err) {
      showErrorMessage('Failed to download records');
    }
  };

  // Export data handler
  const handleExportData = async () => {
    try {
      await exportData();
      showSuccessMessage('Patient data exported successfully!');
    } catch (err) {
      showErrorMessage('Failed to export data');
    }
  };

  // Helper functions for messages
  const showSuccessMessage = (message: string) => {
    setSaveMessage({ type: 'success', message });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const showErrorMessage = (message: string) => {
    setSaveMessage({ type: 'error', message });
    setTimeout(() => setSaveMessage(null), 5000);
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
        <Alert
          type="error"
          message={error}
          onClose={() => navigate('/dashboard')}
        />
      </div>
    );
  }

  // No data state
  if (!formData) {
    return null;
  }

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
            <HealthSummaryCard formData={formData} />

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
            {/* Edit Controls */}
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

            {/* Section Content */}
            <AnimatePresence mode="wait">
              {activeSection === 'personal' && (
                <PersonalInfoSection
                  formData={formData}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                />
              )}

              {activeSection === 'medical' && (
                <MedicalInfoSection
                  formData={formData}
                  isEditing={isEditing}
                  newItems={newItems}
                  onChange={handleInputChange}
                  onNewItemChange={(field, value) =>
                    setNewItems((prev) => ({ ...prev, [field]: value }))
                  }
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                />
              )}

              {activeSection === 'emergency' && (
                <EmergencyContactSection
                  formData={formData}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                />
              )}

              {activeSection === 'insurance' && (
                <InsuranceSection
                  formData={formData}
                  isEditing={isEditing}
                  onChange={handleInputChange}
                />
              )}

              {activeSection === 'notifications' && (
                <NotificationsSection
                  formData={formData}
                  isEditing={isEditing}
                  onToggle={handleToggleChange}
                />
              )}

              {activeSection === 'security' && (
                <SecuritySection
                  formData={formData}
                  onChangePassword={() => setShowPasswordModal(true)}
                />
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
