import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import Card from '../../ui/Card';
import { useEmergencyContact, EmergencyContact } from '../../../services/useEmergencyContact';

interface EmergencyContactSectionProps {
  isEditing: boolean;
}

export const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({ isEditing }) => {
  const { emergencyContact, loading, error, updateEmergencyContact } = useEmergencyContact();
  const [formData, setFormData] = useState<EmergencyContact>({
    name: '',
    phone: '',
    relation: '',
  });

  // Update local form data when emergency contact changes
  useEffect(() => {
    if (emergencyContact) {
      setFormData(emergencyContact);
    }
  }, [emergencyContact]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save emergency contact
  const handleSave = async () => {
    const result = await updateEmergencyContact(formData);
    if (!result.success) {
      console.error('Failed to update emergency contact:', result.error);
    }
  };

  // Auto-save when editing stops
  useEffect(() => {
    if (!isEditing && emergencyContact && JSON.stringify(formData) !== JSON.stringify(emergencyContact)) {
      handleSave();
    }
  }, [isEditing, emergencyContact]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Emergency Contact</h3>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }
  return (
    <motion.div
      key="emergency"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-red-100 rounded-xl mr-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
            <p className="text-sm text-gray-500">
              This person will be contacted in case of emergency
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter emergency contact name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship
            </label>
            <select
              name="relation"
              value={formData.relation}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select Relationship</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Important</p>
              <p className="text-sm text-amber-700 mt-1">
                Make sure your emergency contact information is up to date. This person
                will be notified in case of a medical emergency.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
