import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, AlertCircle, TrendingUp } from 'lucide-react';
import Card from '../../ui/Card';
import { PatientProfile } from '../../../services/api/patientApi';

interface InsuranceSectionProps {
  isEditing: boolean;
  formData: PatientProfile;
  onFormDataChange: (data: PatientProfile) => void;
}

export const InsuranceSection: React.FC<InsuranceSectionProps> = ({ 
  isEditing, 
  formData, 
  onFormDataChange 
}) => {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: name === 'insuranceQuarterlyLimit' || name === 'insuranceQuarterlyUsed' ? Number(value) || 0 : value,
    });
  };

  // Calculate quarterly usage
  const getQuarterlyUsage = () => {
    const limit = formData.insuranceQuarterlyLimit || 0;
    const used = formData.insuranceQuarterlyUsed || 0;
    const remaining = limit - used;
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    
    return { limit, used, remaining, percentage };
  };

  // Check if SHA insurance
  const isSHA = () => {
    return formData.insuranceType === 'sha';
  };
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
            {isEditing ? (
              <input
                type="text"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                placeholder="e.g., Blue Cross Blue Shield"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                {formData.insuranceProvider || 'No insurance provider set'}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Type
            </label>
            {isEditing ? (
              <select
                name="insuranceType"
                value={formData.insuranceType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="standard">Standard Insurance</option>
                <option value="sha">SHA Insurance</option>
              </select>
            ) : (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                {formData.insuranceType === 'sha' ? 'SHA Insurance' : 'Standard Insurance'}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={handleInputChange}
                placeholder="Enter policy number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                {formData.insurancePolicyNumber || 'No policy number set'}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="insuranceGroupNumber"
                value={formData.insuranceGroupNumber}
                onChange={handleInputChange}
                placeholder="Enter group number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                {formData.insuranceGroupNumber || 'No group number set'}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Holder Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="insuranceHolderName"
                value={formData.insuranceHolderName}
                onChange={handleInputChange}
                placeholder="Enter policy holder's name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                {formData.insuranceHolderName || 'No policy holder name set'}
              </div>
            )}
          </div>
          
          {/* SHA-specific fields */}
          {isSHA() && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quarterly Limit (KSH)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="insuranceQuarterlyLimit"
                    value={formData.insuranceQuarterlyLimit}
                    onChange={handleInputChange}
                    placeholder="Enter quarterly limit"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                    KSH {formData.insuranceQuarterlyLimit?.toLocaleString() || '0'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage Start Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="insuranceCoverageStartDate"
                    value={formData.insuranceCoverageStartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                    {formData.insuranceCoverageStartDate || 'No start date set'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage End Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="insuranceCoverageEndDate"
                    value={formData.insuranceCoverageEndDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                    {formData.insuranceCoverageEndDate || 'No end date set'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* SHA Quarterly Usage Display */}
        {isSHA() && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start mb-4">
              <TrendingUp className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">SHA Quarterly Coverage</p>
                <p className="text-sm text-amber-700 mt-1">
                  Track your quarterly insurance usage and remaining coverage.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quarterly Limit:</span>
                <span className="font-semibold text-gray-900">
                  KSH {getQuarterlyUsage().limit.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Used:</span>
                <span className="font-semibold text-gray-900">
                  KSH {getQuarterlyUsage().used.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining:</span>
                <span className={`font-semibold ${getQuarterlyUsage().remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  KSH {getQuarterlyUsage().remaining.toLocaleString()}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getQuarterlyUsage().percentage > 80 ? 'bg-red-500' : 
                      getQuarterlyUsage().percentage > 60 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, getQuarterlyUsage().percentage)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getQuarterlyUsage().percentage.toFixed(1)}% of quarterly limit used
                </p>
              </div>
              
              {getQuarterlyUsage().remaining <= 0 && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <p className="text-sm text-red-800">
                      Quarterly limit has been reached. Additional services may require out-of-pocket payment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
