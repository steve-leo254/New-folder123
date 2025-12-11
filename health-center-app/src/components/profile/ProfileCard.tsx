import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, Camera } from 'lucide-react';
import Card from '../ui/Card';
import { PatientProfile } from '../../services/api/patientApi';

interface ProfileCardProps {
  formData: PatientProfile;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateAge: (dob: string) => number;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  formData,
  isUploading,
  fileInputRef,
  onImageUpload,
  calculateAge,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6">
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={formData.avatar}
              alt={`${formData.firstName} ${formData.lastName}`}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-4 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all hover:scale-110"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {formData.firstName} {formData.lastName}
          </h2>
          <p className="text-gray-500 text-sm mb-2">Member ID: {formData.memberId}</p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              formData.status === 'active'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
          </span>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              {formData.email}
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {formData.phone}
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {calculateAge(formData.dateOfBirth)} years old
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
