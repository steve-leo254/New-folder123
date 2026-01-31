// pages/EmailVerificationPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Home,
  User,
  Lock,
  ChevronRight,
  Send,
  Inbox,
  MailOpen,
  Timer,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  PartyPopper,
  Gift,
  Star,
  Heart,
  Zap,
  Award,
} from 'lucide-react';
import { authService } from '../services/auth';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'expired' | 'error';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [email] = useState(searchParams.get('email') || 'user@example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationMethod, setVerificationMethod] = useState<'code' | 'link'>('code');
  const [showConfetti, setShowConfetti] = useState(false);

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check for token in URL (for email link verification)
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmailWithToken(token);
    }
  }, [searchParams]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    if (status === 'pending' && verificationMethod === 'code') {
      codeInputRefs.current[0]?.focus();
    }
  }, [status, verificationMethod]);

  const verifyEmailWithToken = async (token: string) => {
    setStatus('verifying');
    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail(token);
      setStatus('success');
      setShowConfetti(true);
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code input
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...verificationCode];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setVerificationCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      codeInputRefs.current[nextIndex]?.focus();

      // Auto-submit if complete
      if (newCode.every((d) => d)) {
        handleCodeSubmit(newCode.join(''));
      }
    } else {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }

      // Auto-submit if complete
      if (value && index === 5 && newCode.every((d) => d)) {
        handleCodeSubmit(newCode.join(''));
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeSubmit = async (code?: string) => {
    const verifyCode = code || verificationCode.join('');
    if (verifyCode.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo, accept specific code or any 6-digit
      if (verifyCode === '123456' || /^\d{6}$/.test(verifyCode)) {
        setStatus('success');
        setShowConfetti(true);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setVerificationCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.resendVerification(email);
      setResendTimer(60);
      setVerificationCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.resendVerification(email);
      setResendTimer(60);
      setStatus('pending');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend verification link');
    } finally {
      setIsLoading(false);
    }
  };

  // Confetti Effect Component
  const ConfettiEffect = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className={`w-3 h-3 ${
              ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-purple-500'][
                Math.floor(Math.random() * 5)
              ]
            } ${Math.random() > 0.5 ? 'rounded-full' : 'rotate-45'}`}
          />
        </div>
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {showConfetti && <ConfettiEffect />}

      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className={`p-8 text-center ${
              status === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : status === 'error' || status === 'expired'
                ? 'bg-gradient-to-r from-red-500 to-pink-600'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            } text-white relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="relative inline-block mb-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    status === 'success'
                      ? 'bg-white/20'
                      : status === 'error' || status === 'expired'
                      ? 'bg-white/20'
                      : 'bg-white/20'
                  }`}
                >
                  {status === 'pending' && <Mail className="w-10 h-10" />}
                  {status === 'verifying' && (
                    <RefreshCw className="w-10 h-10 animate-spin" />
                  )}
                  {status === 'success' && <CheckCircle className="w-10 h-10" />}
                  {status === 'expired' && <Clock className="w-10 h-10" />}
                  {status === 'error' && <AlertCircle className="w-10 h-10" />}
                </div>

                {status === 'success' && (
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-2">
                {status === 'pending' && 'Verify Your Email'}
                {status === 'verifying' && 'Verifying...'}
                {status === 'success' && 'Email Verified!'}
                {status === 'expired' && 'Link Expired'}
                {status === 'error' && 'Verification Failed'}
              </h1>

              <p className="text-white/80">
                {status === 'pending' && `We've sent a verification ${verificationMethod === 'code' ? 'code' : 'link'} to`}
                {status === 'verifying' && 'Please wait while we verify your email'}
                {status === 'success' && 'Your email has been successfully verified'}
                {status === 'expired' && 'The verification link has expired'}
                {status === 'error' && error || 'Something went wrong'}
              </p>

              {status === 'pending' && (
                <p className="font-semibold mt-1">{email}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Method Toggle - shown for all pending states */}
            {status === 'pending' && (
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setVerificationMethod('code')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    verificationMethod === 'code'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Enter Code
                </button>
                <button
                  onClick={() => setVerificationMethod('link')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    verificationMethod === 'link'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Email Link
                </button>
              </div>
            )}

            {/* Pending State - Code Entry */}
            {status === 'pending' && verificationMethod === 'code' && (
              <div className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    Enter the 6-digit code
                  </label>
                  <div className="flex justify-center gap-3">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          codeInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(index, e.target.value.replace(/\D/g, ''))
                        }
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        disabled={isLoading}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    ))}
                  </div>
                </div>

                {/* Timer & Resend */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Timer className="w-4 h-4" />
                      <span>Resend code in {resendTimer}s</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  onClick={() => handleCodeSubmit()}
                  disabled={isLoading || verificationCode.some((d) => !d)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Tips */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Didn't receive the email?
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Check your spam or junk folder
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Make sure {email} is correct
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Add us to your contacts
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Pending State - Email Link */}
            {status === 'pending' && verificationMethod === 'link' && (
              <div className="space-y-6">
                {/* Email Illustration */}
                <div className="text-center py-8">
                  <div className="relative inline-block">
                    <div className="w-32 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Inbox className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                      <MailOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">
                    Click the verification link in your email to continue
                  </p>
                </div>

                {/* Open Email Button */}
                <a
                  href={`https://mail.google.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Open Email App
                  <ExternalLink className="w-5 h-5" />
                </a>

                {/* Resend Link */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-gray-600">
                      Resend link in{' '}
                      <span className="font-semibold text-blue-600">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendLink}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto"
                    >
                      <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
                      Resend Verification Link
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="text-center py-8">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                </div>
                <p className="text-gray-600">Please wait while we verify your email...</p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="space-y-6">
                {/* Welcome Message */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                    <PartyPopper className="w-6 h-6" />
                    <span className="font-semibold">Welcome aboard!</span>
                    <PartyPopper className="w-6 h-6 transform scale-x-[-1]" />
                  </div>
                  <p className="text-gray-600">
                    Your email has been verified. You now have full access to all features.
                  </p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Gift className="w-6 h-6" />, label: 'Exclusive Offers', color: 'bg-pink-100 text-pink-600' },
                    { icon: <Star className="w-6 h-6" />, label: 'Priority Support', color: 'bg-yellow-100 text-yellow-600' },
                    { icon: <Heart className="w-6 h-6" />, label: 'Save Favorites', color: 'bg-red-100 text-red-600' },
                    { icon: <Zap className="w-6 h-6" />, label: 'Fast Checkout', color: 'bg-purple-100 text-purple-600' },
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl ${benefit.color} flex flex-col items-center gap-2`}
                    >
                      {benefit.icon}
                      <span className="text-sm font-medium">{benefit.label}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/dashboard"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/profile/complete"
                    className="w-full py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Complete Your Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Expired State */}
            {status === 'expired' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    The verification link has expired for security reasons. Please request a new one.
                  </p>
                </div>

                <button
                  onClick={handleResendLink}
                  disabled={isLoading || resendTimer > 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : resendTimer > 0 ? (
                    `Resend in ${resendTimer}s`
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send New Verification Link
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setStatus('pending');
                    setVerificationMethod('code');
                  }}
                  className="w-full py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                >
                  Try verification code instead
                </button>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    {error || 'Something went wrong during verification. Please try again.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setStatus('pending');
                      setError(null);
                      setVerificationCode(['', '', '', '', '', '']);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>

                  <Link
                    to="/contact"
                    className="w-full py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Support
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {(status === 'pending' || status === 'expired' || status === 'error') && (
            <div className="border-t border-gray-100 p-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <Link to="/" className="hover:text-gray-700 flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link to="/help" className="hover:text-gray-700 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" />
                  Help
                </Link>
                <Link to="/contact" className="hover:text-gray-700 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Support
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secured with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;