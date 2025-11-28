import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Mock types since they're not defined
interface LoginCredentials {
  email: string;
  password: string;
}

// Mock auth hook since it's not implemented
const useAuth = () => ({
  login: async (credentials: LoginCredentials) => {
    console.log('Login attempt:', credentials);
    // Mock successful login
    return Promise.resolve();
  },
  error: null,
  clearError: () => {},
  loading: false
});





export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, clearError, loading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials);
      navigate('/dashboard'); // Redirect on successful login
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">KH</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {/* Alert Messages */}
        {authError && (
          <Alert
            type="error"
            message={authError}
            onClose={clearError}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              autoComplete="email"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              autoComplete="current-password"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
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

          {/* Signup Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
            </span>
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign Up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
