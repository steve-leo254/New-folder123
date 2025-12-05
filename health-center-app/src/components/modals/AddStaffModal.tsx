import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

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
  const [formData, setFormData] = useState({
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="receptionist">Receptionist</option>
            <option value="lab_technician">Lab Technician</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            error={errors.specialization}
            required
          />
          <Input
            label="Consultation Fee (USD)"
            name="consultationFee"
            type="number"
            value={formData.consultationFee}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
        </div>

        <Input
          label="License Number"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleChange}
        />

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

