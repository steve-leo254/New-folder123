import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield } from 'lucide-react';
import Card from '../../ui/Card';
import { PatientProfile } from '../../../services/api/patientApi';

interface InsuranceSectionProps {
  formData: PatientProfile;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InsuranceSection: React.FC<InsuranceSectionProps> = ({
  formData,
  isEditing,
  onChange,
}) => {
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
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={onChange}
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
              name="insurancePolicyNumber"
              value={formData.insurancePolicyNumber}
              onChange={onChange}
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
              name="insuranceGroupNumber"
              value={formData.insuranceGroupNumber}
              onChange={onChange}
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
              name="insuranceHolderName"
              value={formData.insuranceHolderName}
              onChange={onChange}
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
