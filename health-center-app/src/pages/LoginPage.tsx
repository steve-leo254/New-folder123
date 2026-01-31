import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';
import logoImage from '../assets/kiangombe.jpg';
import backgroundImage from '../assets/loginwalpaper.png';

interface LoginCredentials {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: setTokenInContext } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!credentials.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!credentials.password.trim()) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { access_token } = response.data;
      setTokenInContext(access_token);
      navigate('/dashboard');
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Login failed. Please check your credentials and try again.';
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div 
        className="max-w-md w-full space-y-8 p-8 relative overflow-hidden bg-white rounded-lg shadow-md"
        style={{
          backgroundImage: `url(${logoImage})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center 35%',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12  rounded-lg flex items-center justify-center">
            <img src={logoImage} alt="Kiangombe Health" className="w-12 h-12" />
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your Kiangombe Health account</p>
        </div>

        {/* Alert Messages */}
        {authError && (
          <Alert
            type="error"
            message={authError}
            onClose={() => setAuthError(null)}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <Input
            type="email"
            name="email"
            label="Email Address"
            placeholder="your@email.com"
            value={credentials.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={formErrors.email}
            required
          />

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              label="Password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={formErrors.password}
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

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forget-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => alert('Google login not yet implemented')}
              className="w-full"
            >
              <span className="mr-2">🔍</span>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => alert('Facebook login not yet implemented')}
              className="w-full"
            >
              <span className="mr-2">f</span>
              Facebook
            </Button>
          </div>

          {/* Creative Navigation */}
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-700 mb-2">New to Kiangombe Health?</p>
              <Link 
                to="/register" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your Account
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <p className="text-xs text-gray-500">
                We've missed you here at Kiangombe Health
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
