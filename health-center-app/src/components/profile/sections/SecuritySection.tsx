import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle, AlertCircle, Shield, Activity } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useSecurity, SecuritySettings, ActivityLog } from '../../../services/useSecurity';
import { usePatient } from '../../../services/usePatient';

interface SecuritySectionProps {
  onChangePassword: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ onChangePassword }) => {
  const { securitySettings, activityLogs, loading, error, updateSecuritySettings, refreshActivityLogs } = useSecurity();
  const { patient } = usePatient();
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  // Handle security settings changes
  const handleSecurityToggle = async (setting: keyof SecuritySettings) => {
    if (!securitySettings) return;
    
    const newValue = !securitySettings[setting];
    const result = await updateSecuritySettings({ [setting]: newValue });
    if (!result.success) {
      console.error('Failed to update security setting:', result.error);
    }
  };

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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Security Settings</h3>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }
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
            <Button 
              variant={securitySettings?.twoFactorEnabled ? "default" : "outline"} 
              size="sm"
              onClick={() => handleSecurityToggle('twoFactorEnabled')}
            >
              {securitySettings?.twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Login Alerts</h4>
              <p className="text-sm text-gray-500">Get notified of new logins</p>
            </div>
            <Button 
              variant={securitySettings?.loginAlerts ? "default" : "outline"} 
              size="sm"
              onClick={() => handleSecurityToggle('loginAlerts')}
            >
              {securitySettings?.loginAlerts ? 'Disable' : 'Enable'}
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Activity Logs</h4>
              <p className="text-sm text-gray-500">View your recent account activity</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowActivityLogs(!showActivityLogs);
                if (!showActivityLogs) refreshActivityLogs();
              }}
            >
              {showActivityLogs ? 'Hide' : 'View All'}
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
            <p className="font-medium text-gray-900">{patient?.memberId || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="font-medium text-emerald-600 capitalize">{patient?.status || 'active'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium text-gray-900">
              {patient?.registrationDate ? new Date(patient.registrationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Last Login</p>
            <p className="font-medium text-gray-900">
              {activityLogs.length > 0 ? new Date(activityLogs[0].timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Today at 10:30 AM'}
            </p>
          </div>
        </div>
      </Card>

      {/* Activity Logs */}
      {showActivityLogs && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {activityLogs.length > 0 ? activityLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-500">{log.device} • {log.location}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No recent activity found</p>
            )}
          </div>
        </Card>
      )}

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
