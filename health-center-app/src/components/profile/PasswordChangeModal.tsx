import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface PasswordChangeModalProps {
  show: boolean;
  passwordForm: PasswordForm;
  showPasswords: ShowPasswords;
  onClose: () => void;
  onPasswordFormChange: React.Dispatch<React.SetStateAction<PasswordForm>>;
  onShowPasswordsChange: React.Dispatch<React.SetStateAction<ShowPasswords>>;
  onSubmit: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  show,
  passwordForm,
  showPasswords,
  onClose,
  onPasswordFormChange,
  onShowPasswordsChange,
  onSubmit,
}) => {
  if (!show) return null;

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    onPasswordFormChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    onShowPasswordsChange((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <PasswordInput
              label="Current Password"
              value={passwordForm.currentPassword}
              show={showPasswords.current}
              onChange={(value) => handlePasswordChange('currentPassword', value)}
              onToggleVisibility={() => togglePasswordVisibility('current')}
            />

            <PasswordInput
              label="New Password"
              value={passwordForm.newPassword}
              show={showPasswords.new}
              onChange={(value) => handlePasswordChange('newPassword', value)}
              onToggleVisibility={() => togglePasswordVisibility('new')}
            />

            <PasswordInput
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              show={showPasswords.confirm}
              onChange={(value) => handlePasswordChange('confirmPassword', value)}
              onToggleVisibility={() => togglePasswordVisibility('confirm')}
            />

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Password must be at least 8 characters long and include uppercase,
                lowercase, numbers, and special characters.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
              className="flex-1"
            >
              Update Password
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Password Input Component
interface PasswordInputProps {
  label: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  show,
  onChange,
  onToggleVisibility,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};
