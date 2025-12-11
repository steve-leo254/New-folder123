import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Shield, Bell, Lock, Globe, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PrivacySettings {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  showOnlineStatus: boolean;
  shareLocation: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  prescriptionAlerts: boolean;
}

const SettingsPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    cameraEnabled: true,
    microphoneEnabled: true,
    showOnlineStatus: true,
    shareLocation: false,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    prescriptionAlerts: true,
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
    // Load saved settings from localStorage or API
    loadSettings();
  }, [token, navigate]);

  const loadSettings = () => {
    try {
      const savedPrivacy = localStorage.getItem('privacySettings');
      const savedNotifications = localStorage.getItem('notificationSettings');
      
      if (savedPrivacy) {
        setPrivacySettings(JSON.parse(savedPrivacy));
      }
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handlePrivacySettingChange = (setting: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleNotificationSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage (in a real app, this would be saved to backend)
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));

      // Apply camera and microphone restrictions
      if (!privacySettings.cameraEnabled) {
        // Request camera permissions and then deny them
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.log('Camera already denied or not available');
        }
      }

      if (!privacySettings.microphoneEnabled) {
        // Request microphone permissions and then deny them
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.log('Microphone already denied or not available');
        }
      }

      setSaveMessage({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPermissions = async () => {
    try {
      // Reset media permissions
      if (privacySettings.cameraEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      }
      if (privacySettings.microphoneEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
      setSaveMessage({ type: 'success', message: 'Permissions reset successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'Failed to reset permissions.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {saveMessage && (
        <div className="mb-6">
          <Alert
            type={saveMessage.type}
            message={saveMessage.message}
            onClose={() => setSaveMessage(null)}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your privacy, security, and notification preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Privacy Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
            </div>
            
            <div className="space-y-4">
              {/* Camera Settings */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 mr-3 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Camera Access</h4>
                    <p className="text-sm text-gray-600">Allow applications to access your camera</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacySettingChange('cameraEnabled', !privacySettings.cameraEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.cameraEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.cameraEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Microphone Settings */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Mic className="w-5 h-5 mr-3 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Microphone Access</h4>
                    <p className="text-sm text-gray-600">Allow applications to access your microphone</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacySettingChange('microphoneEnabled', !privacySettings.microphoneEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.microphoneEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.microphoneEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Online Status */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-3 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Show Online Status</h4>
                    <p className="text-sm text-gray-600">Let others see when you're online</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacySettingChange('showOnlineStatus', !privacySettings.showOnlineStatus)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.showOnlineStatus ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Location Sharing */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Location Sharing</h4>
                    <p className="text-sm text-gray-600">Share your location for emergency services</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacySettingChange('shareLocation', !privacySettings.shareLocation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.shareLocation ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.shareLocation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive updates and alerts via email</p>
                </div>
                <button
                  onClick={() => handleNotificationSettingChange('emailNotifications', !notificationSettings.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Receive browser push notifications</p>
                </div>
                <button
                  onClick={() => handleNotificationSettingChange('pushNotifications', !notificationSettings.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                  <p className="text-sm text-gray-600">Get reminded about upcoming appointments</p>
                </div>
                <button
                  onClick={() => handleNotificationSettingChange('appointmentReminders', !notificationSettings.appointmentReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.appointmentReminders ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.appointmentReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Prescription Alerts</h4>
                  <p className="text-sm text-gray-600">Notifications for new prescriptions and refills</p>
                </div>
                <button
                  onClick={() => handleNotificationSettingChange('prescriptionAlerts', !notificationSettings.prescriptionAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.prescriptionAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.prescriptionAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleSaveSettings} disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={handleResetPermissions} className="flex-1">
              Reset Permissions
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Privacy Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Disable camera/mic when not in use</li>
              <li>• Regularly review app permissions</li>
              <li>• Keep your software updated</li>
              <li>• Use strong, unique passwords</li>
              <li>• Be cautious with public Wi-Fi</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
