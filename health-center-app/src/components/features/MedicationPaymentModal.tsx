import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Phone,
  ArrowRight,
  RefreshCw,
  CreditCard,
  Zap,
  XCircle,
} from 'lucide-react';
import Button from '../ui/Button';
import { useBilling } from '../../services/useBilling';

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onPaymentFailed: () => void;
  amount: number;
  medicationName: string;
  medicationType: string;
  quantity: number;
  pharmacyName: string;
  patientId: string | number;
  phoneNumber?: string;
}

type PaymentStatus =
  | 'phone-input'
  | 'initiating'
  | 'stk-sent'
  | 'waiting'
  | 'processing'
  | 'success'
  | 'failed'
  | 'timeout'
  | 'cancelled';

interface StatusConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  bgGradient: string;
  pulseColor: string;
}

const MedicationPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  onPaymentFailed,
  amount,
  medicationName,
  medicationType,
  quantity,
  pharmacyName,
  patientId,
  phoneNumber = '0712***456',
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('phone-input');
  const [countdown, setCountdown] = useState(60);
  const [transactionId, setTransactionId] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [userPhoneNumber, setUserPhoneNumber] = useState(phoneNumber || '');
  const { createBilling } = useBilling();

  // Generate mock transaction ID
  const generateTransactionId = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TXN';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Mask phone number for display
  const maskedPhone = useMemo(() => {
    const phone = userPhoneNumber || phoneNumber;
    if (phone.length >= 10) {
      return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
    }
    return phone;
  }, [userPhoneNumber, phoneNumber]);

  // Simulate M-Pesa STK push flow
  const initiatePayment = useCallback(async () => {
    setPaymentStatus('initiating');
    setCountdown(60);

    // Phase 1: Initiating (1.5s)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPaymentStatus('stk-sent');

    // Phase 2: STK Sent visual (2s)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPaymentStatus('waiting');

    // Phase 3: Waiting for user input on phone
    // The countdown handles the rest
  }, []);

  // Handle phone number submission
  const handlePhoneSubmit = useCallback(() => {
    if (userPhoneNumber.length >= 10) {
      initiatePayment();
    }
  }, [userPhoneNumber, initiatePayment]);

  // Start payment flow when modal opens
  useEffect(() => {
    if (isOpen) {
      setTransactionId(generateTransactionId());
      // Don't auto-start payment, wait for phone input
    }
    return () => {
      setPaymentStatus('phone-input');
      setCountdown(60);
      setUserPhoneNumber(phoneNumber || '');
    };
  }, [isOpen, generateTransactionId, phoneNumber]);

  // Countdown timer for waiting state
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (paymentStatus === 'waiting' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setPaymentStatus('timeout');
            return 0;
          }
          // Simulate random success between 5-15 seconds
          if (prev === 45) {
            setPaymentStatus('processing');
            setTimeout(() => {
              setPaymentStatus('success');
            }, 3000);
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [paymentStatus, countdown]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setTransactionId(generateTransactionId());
    initiatePayment();
  }, [generateTransactionId, initiatePayment]);

  // Handle success close
  const handleSuccessClose = useCallback(async () => {
    try {
      // Create billing record for successful medication payment
      await createBilling({
        patient_id: patientId,
        amount: amount,
        payment_method: 'mpesa',
        description: `Medication Purchase: ${medicationName} (${quantity} units) from ${pharmacyName}`,
      });
      
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create billing record:', error);
      // Still close the modal even if billing record creation fails
      onPaymentSuccess();
      onClose();
    }
  }, [createBilling, patientId, amount, medicationName, quantity, pharmacyName, onPaymentSuccess, onClose]);

  // Handle failure close
  const handleFailureClose = useCallback(() => {
    onPaymentFailed();
    onClose();
  }, [onPaymentFailed, onClose]);

  // Status configurations
  const statusConfig: Record<PaymentStatus, StatusConfig> = useMemo(
    () => ({
      'phone-input': {
        icon: <Phone className="w-8 h-8" />,
        title: 'Enter Phone Number',
        subtitle: 'Enter your M-Pesa registered phone number',
        color: 'text-blue-600',
        bgGradient: 'from-blue-500/10 to-indigo-500/10',
        pulseColor: 'bg-blue-500',
      },
      initiating: {
        icon: <Zap className="w-8 h-8" />,
        title: 'Initiating Payment',
        subtitle: 'Connecting to M-Pesa...',
        color: 'text-green-600',
        bgGradient: 'from-green-500/10 to-emerald-500/10',
        pulseColor: 'bg-green-500',
      },
      'stk-sent': {
        icon: <Smartphone className="w-8 h-8" />,
        title: 'STK Push Sent!',
        subtitle: 'Check your phone for the M-Pesa prompt',
        color: 'text-green-600',
        bgGradient: 'from-green-500/10 to-emerald-500/10',
        pulseColor: 'bg-green-500',
      },
      waiting: {
        icon: <Phone className="w-8 h-8" />,
        title: 'Waiting for Confirmation',
        subtitle: 'Enter your M-Pesa PIN on your phone',
        color: 'text-amber-600',
        bgGradient: 'from-amber-500/10 to-yellow-500/10',
        pulseColor: 'bg-amber-500',
      },
      processing: {
        icon: <Loader2 className="w-8 h-8 animate-spin" />,
        title: 'Processing Payment',
        subtitle: 'Almost there, verifying transaction...',
        color: 'text-blue-600',
        bgGradient: 'from-blue-500/10 to-indigo-500/10',
        pulseColor: 'bg-blue-500',
      },
      success: {
        icon: <CheckCircle className="w-8 h-8" />,
        title: 'Payment Successful!',
        subtitle: 'Your appointment has been confirmed',
        color: 'text-green-600',
        bgGradient: 'from-green-500/10 to-emerald-500/10',
        pulseColor: 'bg-green-500',
      },
      failed: {
        icon: <AlertCircle className="w-8 h-8" />,
        title: 'Payment Failed',
        subtitle: 'The transaction could not be completed',
        color: 'text-red-600',
        bgGradient: 'from-red-500/10 to-rose-500/10',
        pulseColor: 'bg-red-500',
      },
      timeout: {
        icon: <AlertCircle className="w-8 h-8" />,
        title: 'Request Timed Out',
        subtitle: 'You didn\'t respond to the STK push in time',
        color: 'text-orange-600',
        bgGradient: 'from-orange-500/10 to-amber-500/10',
        pulseColor: 'bg-orange-500',
      },
      cancelled: {
        icon: <X className="w-8 h-8" />,
        title: 'Payment Cancelled',
        subtitle: 'You cancelled the M-Pesa prompt',
        color: 'text-gray-600',
        bgGradient: 'from-gray-500/10 to-slate-500/10',
        pulseColor: 'bg-gray-500',
      },
    }),
    []
  );

  const currentStatus = statusConfig[paymentStatus];

  // Circular progress for countdown
  const circumference = 2 * Math.PI * 45;
  const progress = (countdown / 60) * circumference;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && paymentStatus !== 'processing') {
            if (paymentStatus === 'success') {
              handleSuccessClose();
            }
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
          className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* M-Pesa Branded Header */}
          <div className="relative overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-6 py-5">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
              <div className="absolute top-2 right-20 w-8 h-8 bg-white/5 rounded-full" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* M-Pesa Logo placeholder */}
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-green-600 font-black text-lg">M</span>
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg tracking-tight">M-PESA</h2>
                    <p className="text-green-100 text-xs font-medium">Secure Payment</p>
                  </div>
                </div>

                {paymentStatus !== 'processing' && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (paymentStatus === 'success') {
                        handleSuccessClose();
                      } else {
                        handleFailureClose();
                      }
                    }}
                    className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                    aria-label="Close payment modal"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Wavy border effect */}
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 400 20"
              preserveAspectRatio="none"
            >
              <path
                d="M0,10 C100,20 200,0 300,10 C350,15 380,12 400,10 L400,20 L0,20 Z"
                fill="white"
              />
            </svg>
          </div>

          {/* Payment Amount Card */}
          <div className="px-4 pt-2 pb-2">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Shield className="w-3 h-3" />
                  <span>Encrypted</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-sm text-gray-500 font-medium">KSH</span>
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
                  className="text-2xl font-black text-gray-900 tracking-tight"
                >
                  {amount.toLocaleString()}
                </motion.span>
                <span className="text-xs text-gray-400 ml-1">.00</span>
              </div>

              {/* Order Summary */}
              <div className="mt-2 pt-2 border-t border-gray-200/50 space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Order Summary
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{medicationName}</h4>
                      <p className="text-xs text-gray-500 capitalize">{medicationType}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-sm">
                        KES {amount.toLocaleString()}.00
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Qty: {quantity}</span>
                    <span className="text-xs text-gray-400">{pharmacyName}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Status Display */}
          <div className="px-6 py-6">
            <motion.div
              key={paymentStatus}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`bg-gradient-to-br ${currentStatus.bgGradient} rounded-xl p-6 text-center relative overflow-hidden`}
            >
              {/* Animated background particles for waiting state */}
              {paymentStatus === 'waiting' && (
                <>
                  <motion.div
                    animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-4 left-8 w-2 h-2 bg-amber-300/30 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-4 right-12 w-3 h-3 bg-amber-300/20 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-8 right-6 w-1.5 h-1.5 bg-amber-400/25 rounded-full"
                  />
                </>
              )}

              {/* Success confetti-like particles */}
              {paymentStatus === 'success' && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
                      animate={{
                        y: [0, -60 - Math.random() * 40],
                        x: [(i - 3) * 30, (i - 3) * 50],
                        opacity: [1, 0],
                        scale: [0, 1],
                      }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full ${
                        ['bg-green-400', 'bg-emerald-400', 'bg-teal-400', 'bg-green-300', 'bg-emerald-300', 'bg-yellow-400'][i]
                      }`}
                    />
                  ))}
                </>
              )}

              {/* Countdown circle for waiting state */}
              {paymentStatus === 'waiting' && (
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-gray-200"
                    />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="text-amber-500"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      key={countdown}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-amber-600"
                    >
                      {countdown}
                    </motion.span>
                    <span className="text-[10px] text-amber-500 font-medium">seconds</span>
                  </div>
                </div>
              )}

              {/* Status icon for non-waiting states */}
              {paymentStatus !== 'waiting' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="relative w-20 h-20 mx-auto mb-4"
                >
                  {/* Pulse ring */}
                  {(paymentStatus === 'initiating' || paymentStatus === 'stk-sent' || paymentStatus === 'processing') && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`absolute inset-0 rounded-full ${currentStatus.pulseColor}/20`}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className={`absolute inset-0 rounded-full ${currentStatus.pulseColor}/15`}
                      />
                    </>
                  )}

                  <div
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center ${currentStatus.color} bg-white shadow-lg`}
                  >
                    {paymentStatus === 'success' ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                      >
                        {currentStatus.icon}
                      </motion.div>
                    ) : (
                      currentStatus.icon
                    )}
                  </div>
                </motion.div>
              )}

              {/* Status text */}
              <motion.h3
                key={`title-${paymentStatus}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-lg font-bold ${currentStatus.color} mb-1`}
              >
                {currentStatus.title}
              </motion.h3>
              <p className="text-sm text-gray-600">{currentStatus.subtitle}</p>

              {/* Phone number input for phone-input state */}
              {paymentStatus === 'phone-input' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 space-y-4"
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={userPhoneNumber}
                      onChange={(e) => setUserPhoneNumber(e.target.value)}
                      placeholder="Enter M-Pesa phone number (e.g., 0712345678)"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 placeholder-gray-400"
                      maxLength={12}
                    />
                  </div>
                  <Button
                    onClick={handlePhoneSubmit}
                    disabled={userPhoneNumber.length < 10}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-green-500/25 transition-all"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <Smartphone className="w-5 h-5" />
                      <span>Send STK Push</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </motion.div>
              )}

              {/* Phone number display for STK states */}
              {(paymentStatus === 'stk-sent' || paymentStatus === 'waiting') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-mono font-semibold text-gray-700">
                    {maskedPhone}
                  </span>
                </motion.div>
              )}

              {/* STK Push phone animation */}
              {paymentStatus === 'stk-sent' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex items-center justify-center space-x-2"
                >
                  <motion.div
                    animate={{ x: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <Smartphone className="w-6 h-6 text-green-500" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center space-x-1"
                  >
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  </motion.div>
                </motion.div>
              )}

              {/* Transaction ID for success */}
              {paymentStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 space-y-2"
                >
                  <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-mono font-semibold text-gray-600">
                      {transactionId}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    You will receive an SMS confirmation shortly
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Security badge */}
          <div className="px-6 pb-3">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Secured by Safaricom M-Pesa</span>
              <span className="text-gray-300">•</span>
              <span>256-bit SSL</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6">
            {paymentStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={handleSuccessClose}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-green-500/25 transition-all"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Done — View Appointment</span>
                  </span>
                </Button>
              </motion.div>
            )}

            {(paymentStatus === 'failed' || paymentStatus === 'timeout' || paymentStatus === 'cancelled') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {retryCount < 3 && (
                  <Button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-green-500/25"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-5 h-5" />
                      <span>Try Again</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                )}
                <Button
                  onClick={handleFailureClose}
                  variant="outline"
                  className="w-full py-3 rounded-xl"
                >
                  Cancel Payment
                </Button>
              </motion.div>
            )}

            {(paymentStatus === 'waiting' || paymentStatus === 'stk-sent') && (
              <div className="px-6 py-3">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStatus('cancelled')}
                  className="w-full text-red-600 border-red-600 hover:bg-red-50 font-semibold"
                >
                  <span className="flex items-center justify-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel this payment
                  </span>
                </Button>
              </div>
            )}
          </div>

          {/* Progress bar at bottom */}
          {(paymentStatus === 'initiating' || paymentStatus === 'stk-sent' || paymentStatus === 'processing') && (
            <div className="h-1 bg-gray-100 overflow-hidden">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-green-500 to-transparent"
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MedicationPaymentModal;