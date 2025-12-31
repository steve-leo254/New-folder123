import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../ui/Card';
import { PatientProfile } from '../../../services/api/patientApi';

interface PersonalInfoSectionProps {
  formData: PatientProfile;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  isEditing,
  onChange,
}) => {
  return (
    <motion.div
      key="personal"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            disabled={!isEditing}
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            disabled={!isEditing}
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            disabled={!isEditing}
          />
          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onChange}
            disabled={!isEditing}
          />
          <InputField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={onChange}
            disabled={!isEditing}
          />
          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            disabled={!isEditing}
            options={[
              { value: '', label: 'Select Gender' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'prefer-not-to-say', label: 'Prefer not to say' },
            ]}
          />
          <InputField
            label="Years of Experience"
            name="yearsOfExperience"
            type="number"
            value={formData.yearsOfExperience || ''}
            onChange={onChange}
            disabled={!isEditing}
            placeholder="Enter years of experience"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Education Completion Year"
            name="educationCompletionYear"
            type="number"
            value={formData.educationCompletionYear || ''}
            onChange={onChange}
            disabled={!isEditing}
            placeholder="Year of graduation/completion"
          />
          <div className="flex items-center">
            <div className="text-sm text-gray-600">
              {formData.educationCompletionYear ? (
                <span className="font-medium">
                  {new Date().getFullYear() - parseInt(formData.educationCompletionYear) >= 5 
                    ? `${new Date().getFullYear() - parseInt(formData.educationCompletionYear)}+ years experience` 
                    : `${Math.max(0, new Date().getFullYear() - parseInt(formData.educationCompletionYear))} years experience`}
                </span>
              ) : (
                <span>Enter completion year to calculate experience</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={onChange}
              disabled={!isEditing}
            />
          </div>
          <InputField
            label="City"
            name="city"
            value={formData.city}
            onChange={onChange}
            disabled={!isEditing}
          />
          <InputField
            label="State"
            name="state"
            value={formData.state}
            onChange={onChange}
            disabled={!isEditing}
          />
          <InputField
            label="ZIP Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={onChange}
            disabled={!isEditing}
          />
          <InputField
            label="Country"
            name="country"
            value={formData.country}
            onChange={onChange}
            disabled={!isEditing}
          />
        </div>
      </Card>
    </motion.div>
  );
};

// Reusable Input Field Component
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  disabled,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
    />
  </div>
);

// Reusable Select Field Component
interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  options: { value: string; label: string }[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  disabled,
  options,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
