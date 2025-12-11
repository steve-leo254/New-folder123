import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import Card from '../../ui/Card';
import { PatientProfile } from '../../../services/api/patientApi';

interface NotificationsSectionProps {
  formData: PatientProfile;
  isEditing: boolean;
  onToggle: (field: keyof PatientProfile) => void;
}

interface NotificationItem {
  key: keyof PatientProfile;
  label: string;
  description: string;
}

const notificationItems: NotificationItem[] = [
  {
    key: 'emailNotifications',
    label: 'Email Notifications',
    description: 'Receive updates and reminders via email',
  },
  {
    key: 'smsNotifications',
    label: 'SMS Notifications',
    description: 'Receive text message alerts',
  },
  {
    key: 'appointmentReminders',
    label: 'Appointment Reminders',
    description: 'Get reminded about upcoming appointments',
  },
  {
    key: 'labResultsNotifications',
    label: 'Lab Results Notifications',
    description: 'Be notified when new lab results are available',
  },
];

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  formData,
  isEditing,
  onToggle,
}) => {
  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-purple-100 rounded-xl mr-4">
            <Bell className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500">
              Manage how you receive notifications
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ToggleSwitch
                enabled={Boolean(formData[item.key])}
                onChange={() => onToggle(item.key)}
                disabled={!isEditing}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> You can change these preferences at any time. Critical
            notifications related to your health and safety will always be sent regardless
            of your preferences.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

// Toggle Switch Component
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  disabled: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled }) => {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};
