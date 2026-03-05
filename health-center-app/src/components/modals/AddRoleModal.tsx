import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { StaffRole } from '../../types';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleData: Omit<StaffRole, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingRole?: StaffRole;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, onSubmit, editingRole }) => {
  const [formData, setFormData] = useState({
    name: editingRole?.name || '',
    description: editingRole?.description || '',
    permissions: editingRole?.permissions || [],
    isActive: editingRole?.isActive ?? true,
    requiresSpecialization: editingRole?.requiresSpecialization ?? false,
    requiresLicense: editingRole?.requiresLicense ?? false,
    defaultConsultationFee: editingRole?.defaultConsultationFee || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.defaultConsultationFee < 0) {
      newErrors.defaultConsultationFee = 'Consultation fee cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to save role' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: editingRole?.name || '',
      description: editingRole?.description || '',
      permissions: editingRole?.permissions || [],
      isActive: editingRole?.isActive ?? true,
      requiresSpecialization: editingRole?.requiresSpecialization ?? false,
      requiresLicense: editingRole?.requiresLicense ?? false,
      defaultConsultationFee: editingRole?.defaultConsultationFee || 0,
    });
    setErrors({});
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, editingRole]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingRole ? 'Edit Role' : 'Create New Role'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <Alert type="error" message={errors.submit} />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Senior Doctor, Emergency Nurse"
            error={errors.name}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the responsibilities and duties of this role"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Consultation Fee (KES)</label>
          <Input
            type="number"
            value={formData.defaultConsultationFee.toString()}
            onChange={(e) => handleChange('defaultConsultationFee', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0"
            step="0.01"
            error={errors.defaultConsultationFee}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Requirements</label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.requiresSpecialization}
              onChange={(e) => handleChange('requiresSpecialization', e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Requires Specialization</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.requiresLicense}
              onChange={(e) => handleChange('requiresLicense', e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Requires Professional License</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Role is Active</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
          <div className="space-y-2 border border-gray-200 rounded-lg p-3">
            {[
              'view_patients',
              'manage_patients', 
              'view_appointments',
              'manage_appointments',
              'view_prescriptions',
              'manage_prescriptions',
              'view_billing',
              'manage_billing',
              'manage_staff',
              'view_reports',
              'manage_settings'
            ].map(permission => (
              <label key={permission} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.includes(permission)}
                  onChange={(e) => {
                    const newPermissions = e.target.checked
                      ? [...formData.permissions, permission]
                      : formData.permissions.filter(p => p !== permission);
                    handleChange('permissions', newPermissions);
                  }}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {permission.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRoleModal;
