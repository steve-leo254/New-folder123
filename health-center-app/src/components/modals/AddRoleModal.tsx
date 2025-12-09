import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { StaffRole } from '../../types';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleData: Omit<StaffRole, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingRole?: StaffRole;
}

const availablePermissions = [
  { id: 'view_patients', label: 'View Patients', description: 'Can view patient information and records' },
  { id: 'create_appointments', label: 'Create Appointments', description: 'Can schedule patient appointments' },
  { id: 'manage_schedule', label: 'Manage Schedule', description: 'Can manage and modify schedules' },
  { id: 'prescribe_medication', label: 'Prescribe Medication', description: 'Can prescribe medications to patients' },
  { id: 'view_medical_records', label: 'View Medical Records', description: 'Can access patient medical history' },
  { id: 'update_vitals', label: 'Update Vitals', description: 'Can record patient vital signs' },
  { id: 'assist_procedures', label: 'Assist Procedures', description: 'Can assist in medical procedures' },
  { id: 'view_test_requests', label: 'View Test Requests', description: 'Can view laboratory test requests' },
  { id: 'conduct_tests', label: 'Conduct Tests', description: 'Can perform laboratory tests' },
  { id: 'update_results', label: 'Update Results', description: 'Can update test results' },
  { id: 'view_prescriptions', label: 'View Prescriptions', description: 'Can view medication prescriptions' },
  { id: 'dispense_medication', label: 'Dispense Medication', description: 'Can dispense prescribed medications' },
  { id: 'manage_inventory', label: 'Manage Inventory', description: 'Can manage medication inventory' },
  { id: 'patient_registration', label: 'Patient Registration', description: 'Can register new patients' },
  { id: 'billing_management', label: 'Billing Management', description: 'Can manage billing and payments' },
  { id: 'staff_management', label: 'Staff Management', description: 'Can manage staff accounts and roles' },
  { id: 'system_administration', label: 'System Administration', description: 'Can access system admin functions' }
];

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, onSubmit, editingRole }) => {
  const [formData, setFormData] = useState({
    name: editingRole?.name || '',
    description: editingRole?.description || '',
    permissions: editingRole?.permissions || [],
    isActive: editingRole?.isActive ?? true,
    requiresSpecialization: editingRole?.requiresSpecialization || false,
    requiresLicense: editingRole?.requiresLicense || false,
    defaultConsultationFee: editingRole?.defaultConsultationFee?.toString() || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Role name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.permissions.length === 0) newErrors.permissions = 'At least one permission is required';
    if (formData.defaultConsultationFee && isNaN(Number(formData.defaultConsultationFee))) {
      newErrors.defaultConsultationFee = 'Consultation fee must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const roleData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
        isActive: formData.isActive,
        requiresSpecialization: formData.requiresSpecialization,
        requiresLicense: formData.requiresLicense,
        defaultConsultationFee: formData.defaultConsultationFee ? Number(formData.defaultConsultationFee) : undefined
      };

      await onSubmit(roleData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        permissions: [],
        isActive: true,
        requiresSpecialization: false,
        requiresLicense: false,
        defaultConsultationFee: ''
      });
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save role';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingRole ? "Edit Role" : "Add New Role"} size="xl">
      {serverError && (
        <div className="mb-4">
          <Alert type="error" message={serverError} onClose={() => setServerError(null)} />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Role Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., Doctor, Nurse, Receptionist"
          />
          
          <Input
            label="Default Consultation Fee (USD)"
            name="defaultConsultationFee"
            type="number"
            value={formData.defaultConsultationFee}
            onChange={handleChange}
            error={errors.defaultConsultationFee}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the responsibilities and functions of this role"
            required
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Role Requirements</label>
          <div className="space-y-2">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="requiresSpecialization"
                checked={formData.requiresSpecialization}
                onChange={handleChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Requires Specialization</span>
            </label>
            
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="requiresLicense"
                checked={formData.requiresLicense}
                onChange={handleChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Requires Professional License</span>
            </label>
            
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Role is Active</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
          {errors.permissions && <p className="text-red-500 text-sm mb-2">{errors.permissions}</p>}
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePermissions.map((permission) => (
                <label key={permission.id} className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="mt-1 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">{permission.label}</div>
                    <div className="text-xs text-gray-500">{permission.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            {editingRole ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRoleModal;
