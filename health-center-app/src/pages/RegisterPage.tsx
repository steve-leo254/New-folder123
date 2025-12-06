import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import api from '../services/api';



interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  password: string;
  confirmPassword: string;
  newsletter: boolean;
  termsAccepted: boolean;
  ageVerified: boolean;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    password: '',
    confirmPassword: '',
    newsletter: false,
    termsAccepted: false,
    ageVerified: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Password validation helper
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters.' };
    }
    if (password.length > 72) {
      return { valid: false, message: 'Password cannot exceed 72 characters.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character.' };
    }
    return { valid: true, message: '' };
  };

  const validateForm = (): boolean => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check password complexity using helper
    const pwdCheck = validatePassword(formData.password);
    if (!pwdCheck.valid) {
      setError(pwdCheck.message);
      return false;
    }

    // Check required checkboxes
    if (!formData.termsAccepted) {
      setError('You must accept the Terms and Conditions');
      return false;
    }

    if (!formData.ageVerified) {
      setError('You must be over 18 years old to register');
      return false;
    }

    // Validate all required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.gender || !formData.dateOfBirth || !formData.phone) {
      setError('Please fill in all required fields');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/users', {
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: 'patient',
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Registration failed');
      }

      alert('Registration successful! Please login.');
      navigate('/');
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : 'An error occurred during registration');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log('Google signup clicked');
    alert('Google signup coming soon!');
  };

  const handleFacebookSignup = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook signup clicked');
    alert('Facebook signup coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-3xl w-full p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">KH</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Create your account</p>
              <p className="text-sm text-gray-600">
                Get started with Kiangombe Health. It only takes a minute.
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="firstName"
              label="First Name"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <Input
              name="lastName"
              label="Last Name"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="name@mail.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 flex space-x-3">
            <span className="mt-0.5">ℹ️</span>
            <p>
              We ask for your age and gender to keep things safe, accurate, and tailored just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors border-gray-300"
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Gender --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <Input
              name="dateOfBirth"
              type="date"
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="+254 Enter your phone number"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Password (min 8 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters, with upper, lower, number and symbol.
              </p>
            </div>

            <div className="relative">
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleInputChange}
              />
              <span className="text-sm text-gray-700">
                Get the latest updates on new products and offers from Kiangombe Health.
              </span>
            </label>

            <label className="flex items-start space-x-3">
              <input
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                required
              />
              <span className="text-sm text-gray-700">
                I accept the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                  Privacy Policy
                </a>{' '}
                *
              </span>
            </label>

            <label className="flex items-start space-x-3">
              <input
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                type="checkbox"
                name="ageVerified"
                checked={formData.ageVerified}
                onChange={handleInputChange}
                required
              />
              <span className="text-sm text-gray-700">I am over 18 years old *</span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            Sign Up
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="w-full"
            >
              <span className="mr-2">G</span>
              Sign up with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleFacebookSignup}
              className="w-full"
            >
              <span className="mr-2">f</span>
              Sign up with Facebook
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Signup;