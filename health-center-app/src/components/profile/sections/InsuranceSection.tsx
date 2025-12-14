import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, AlertCircle } from 'lucide-react';
import Card from '../../ui/Card';
import { useInsurance, Insurance } from '../../../services/useInsurance';

interface InsuranceSectionProps {
  isEditing: boolean;
}

export const InsuranceSection: React.FC<InsuranceSectionProps> = ({ isEditing }) => {
  const { insurance, loading, error, updateInsurance } = useInsurance();
  const [formData, setFormData] = useState<Insurance>({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    holderName: '',
  });

  // Update local form data when insurance changes
  useEffect(() => {
    if (insurance) {
      setFormData(insurance);
    }
  }, [insurance]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save insurance info
  const handleSave = async () => {
    const result = await updateInsurance(formData);
    if (!result.success) {
      console.error('Failed to update insurance:', result.error);
    }
  };

  // Auto-save when editing stops
  useEffect(() => {
    if (!isEditing && insurance && JSON.stringify(formData) !== JSON.stringify(insurance)) {
      handleSave();
    }
  }, [isEditing, insurance]);

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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Insurance Information</h3>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }
  return (
    <motion.div
      key="insurance"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-100 rounded-xl mr-4">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
            <p className="text-sm text-gray-500">
              Your health insurance details
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Provider
            </label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., Blue Cross Blue Shield"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Number
            </label>
            <input
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter policy number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Number
            </label>
            <input
              type="text"
              name="groupNumber"
              value={formData.groupNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter group number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Holder Name
            </label>
            <input
              type="text"
              name="holderName"
              value={formData.holderName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter policy holder's name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Insurance Coverage</p>
              <p className="text-sm text-blue-700 mt-1">
                Your insurance information is encrypted and securely stored. This
                information is used for billing and verification purposes only.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
