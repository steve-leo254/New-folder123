import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useStaffRoles } from '../../services/useStaffRoles';
import { StaffRole } from '../../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    account: {
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      gender?: string;
      date_of_birth?: string;
      role: string;
      profile_image?: string;
    };
    profile: {
      specialization: string;
      bio?: string;
      consultation_fee?: number;
      license_number?: string;
      is_available?: boolean;
    };
  }) => Promise<void>;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { roles, loading: rolesLoading } = useStaffRoles();
  const [selectedRole, setSelectedRole] = useState<StaffRole | null>(null);
  
  // Filter active roles only
  const availableRoles = roles.filter(role => role.isActive);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    role: '', // Remove hardcoded default
    specialization: '',
    consultationFee: '',
    licenseNumber: '',
    bio: '',
    isAvailable: true,
    profileImage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Set default role to first available role if no role is selected
    if (availableRoles.length > 0 && !formData.role) {
      const defaultRole = availableRoles[0];
      setFormData(prev => ({ ...prev, role: defaultRole.name.toLowerCase() }));
      setSelectedRole(defaultRole);
    } else if (formData.role) {
      // Find the selected role object
      const currentRole = availableRoles.find(r => r.name.toLowerCase() === formData.role.toLowerCase());
      setSelectedRole(currentRole || null);
    }
  }, [availableRoles, formData.role]);

  useEffect(() => {
    // Update form fields when role changes
    if (selectedRole) {
      setFormData(prev => ({
        ...prev,
        consultationFee: selectedRole.defaultConsultationFee?.toString() || prev.consultationFee,
        specialization: selectedRole.requiresSpecialization ? prev.specialization : '',
        licenseNumber: selectedRole.requiresLicense ? prev.licenseNumber : prev.licenseNumber
      }));
    }
  }, [selectedRole]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Update selected role when role changes
      if (name === 'role') {
        const role = availableRoles.find(r => r.name.toLowerCase() === value.toLowerCase());
        setSelectedRole(role || null);
      }
    }
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate specialization if required by role
    if (selectedRole?.requiresSpecialization && !formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required for this role';
    }
    
    // Validate license if required by role
    if (selectedRole?.requiresLicense && !formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required for this role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, profileImage: 'Only image files are allowed' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profileImage: 'File size must be less than 5MB' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, profileImage: result.img_url }));
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.profileImage;
        return copy;
      });
    } catch (error) {
      setErrors({ ...errors, profileImage: 'Failed to upload image' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        account: {
          full_name: formData.fullName.trim(),
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          gender: formData.gender || undefined,
          date_of_birth: formData.dateOfBirth || undefined,
          role: formData.role,
          profile_image: formData.profileImage || undefined,
        },
        profile: {
          specialization: formData.specialization.trim(),
          bio: formData.bio || undefined,
          consultation_fee: formData.consultationFee ? Number(formData.consultationFee) : undefined,
          license_number: formData.licenseNumber || undefined,
          is_available: formData.isAvailable,
        },
      });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        role: 'doctor',
        specialization: '',
        consultationFee: '',
        licenseNumber: '',
        bio: '',
        isAvailable: true,
        profileImage: '',
      });
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create staff account';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Staff Member" size="xl">
      {serverError && (
        <div className="mb-4">
          <Alert type="error" message={serverError} onClose={() => setServerError(null)} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <Input
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Role *</label>
          {rolesLoading ? (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <span className="text-gray-500">Loading roles...</span>
            </div>
          ) : availableRoles.length === 0 ? (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-red-50">
              <span className="text-red-500">No active roles available. Please create roles first.</span>
            </div>
          ) : (
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a role</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.name.toLowerCase()}>
                  {role.name}
                </option>
              ))}
            </select>
          )}
          {selectedRole && (
            <p className="text-xs text-gray-500 mt-1">{selectedRole.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.profileImage && (
            <p className="text-red-500 text-sm mt-1">{errors.profileImage}</p>
          )}
          {formData.profileImage && (
            <div className="mt-2">
              <img
                src={formData.profileImage}
                alt="Profile preview"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <p className="text-xs text-green-600 mt-1">Image uploaded successfully</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedRole?.requiresSpecialization && (
            <Input
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              error={errors.specialization}
              required={selectedRole?.requiresSpecialization}
              placeholder={selectedRole?.requiresSpecialization ? "e.g., Cardiology, Pediatrics" : "Optional for this role"}
            />
          )}
          <Input
            label="Consultation Fee (USD)"
            name="consultationFee"
            type="number"
            value={formData.consultationFee}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder={selectedRole?.defaultConsultationFee ? `Default: $${selectedRole.defaultConsultationFee}` : "0.00"}
          />
        </div>

        {selectedRole?.requiresLicense && (
          <Input
            label="License Number"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            error={errors.licenseNumber}
            required={selectedRole?.requiresLicense}
            placeholder={selectedRole?.requiresLicense ? "Professional license number" : "Optional for this role"}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Available for appointments</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading}>
            Add Staff Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddStaffModal;

