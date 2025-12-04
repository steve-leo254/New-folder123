import React, { useState } from 'react';
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
    specialization: '',
    consultationFee: '',
    licenseNumber: '',
    bio: '',
    isAvailable: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
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

