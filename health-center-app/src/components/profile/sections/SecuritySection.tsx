import React from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { PatientProfile } from '../../../services/api/patientApi';

interface SecuritySectionProps {
  formData: PatientProfile;
  onChangePassword: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  formData,
  onChangePassword,
}) => {
  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Password & Security */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-green-100 rounded-xl mr-4">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Password & Security</h3>
            <p className="text-sm text-gray-500">
              Manage your account security settings
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-500">Last changed 30 days ago</p>
            </div>
            <Button onClick={onChangePassword} size="sm">
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Active Sessions</h4>
              <p className="text-sm text-gray-500">Manage your active sessions</p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Member ID</p>
            <p className="font-medium text-gray-900">{formData.memberId}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="font-medium text-emerald-600 capitalize">{formData.status}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium text-gray-900">
              {new Date(formData.registrationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Last Login</p>
            <p className="font-medium text-gray-900">Today at 10:30 AM</p>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-red-50 border border-red-200">
        <div className="flex items-start mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
        </div>
        <Button variant="danger" size="sm">
          Delete Account
        </Button>
      </Card>
    </motion.div>
  );
};
