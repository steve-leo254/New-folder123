import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, MapPin, User, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { StaffMember } from '../../types';
import { formatCurrency } from '@/services/formatCurrency';
import { apiService } from '../../services/api';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: StaffMember | null;
  patientId?: string | number;
  onSubmit: (appointmentData: {
    patient_id: string | number;
    doctor_id: string | number;
    date: string;
    time: string;
    type: 'in-person' | 'video';
    notes?: string;
    payment_method?: string;
    payment_amount?: number;
  }) => Promise<any>; // Return appointment data
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  doctor,
  patientId = '1',
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'video' as 'in-person' | 'video',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(patientId.toString());
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setUsersLoading(true);
      try {
        const usersData = await apiService.getPatients();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Debug log to see what's being captured
    if (name === 'time') {
      console.log('Time selected:', value);
    }
    
    if (name === 'patient_id') {
      setSelectedUserId(value);
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

    if (!selectedUserId.trim()) newErrors.patient_id = 'Patient selection is required';
    if (!formData.date.trim()) newErrors.date = 'Date is required';
    if (!formData.time.trim()) newErrors.time = 'Time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate() || !doctor) return;

    setLoading(true);
    try {
      const appointmentData = {
        patient_id: selectedUserId,
        doctor_id: doctor.id,
        date: formData.date,
        time: formData.time + ':00', // Add seconds for proper time format
        type: formData.type,
        notes: formData.notes || undefined,
        payment_method: 'pending', // Will be updated after payment
        payment_amount: doctor.consultationFee || 0,
      };
      
      // Debug log to see what's being sent
      console.log('Submitting appointment data:', appointmentData);
      
      const result = await onSubmit(appointmentData);
      
      // Store the created appointment ID for payment processing
      setCreatedAppointmentId(result.id);
      
      // Show payment section instead of success message
      setShowPayment(true);
      setSuccessMessage('Appointment created! Please complete the payment to confirm.');
      
      // Reset form data but keep modal open for payment
      setFormData({
        date: '',
        time: '',
        type: 'video',
        notes: '',
      });
      setSelectedUserId(patientId.toString());
      
    } catch (error: any) {
      setServerError(
        error.response?.data?.detail ||
        error.message ||
        'Failed to book appointment'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentMethod: string) => {
    if (!createdAppointmentId || !doctor) return;

    setPaymentLoading(true);
    try {
      const paymentData = {
        payment_method: paymentMethod,
        payment_amount: doctor.consultationFee || 0,
        transaction_id: `TXN-${Date.now()}`, // Generate mock transaction ID
      };

      const result = await apiService.processPayment(createdAppointmentId, paymentData);
      console.log('Payment processed:', result);
      
      setSuccessMessage('Payment successful! Your appointment is confirmed.');
      
      // Close modal only after successful payment
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setShowPayment(false);
        setCreatedAppointmentId(null);
      }, 2000);
      
    } catch (error: any) {
      setServerError(
        error.response?.data?.detail ||
        error.message ||
        'Payment failed. Please try again.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleModalClose = () => {
    // Prevent closing if payment is required but not completed
    if (showPayment && createdAppointmentId) {
      setServerError('Please complete the payment to confirm your appointment.');
      return;
    }
    onClose();
  };

  if (!isOpen || !doctor) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={showPayment && createdAppointmentId ? (e) => e.stopPropagation() : handleModalClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {showPayment ? 'Complete Payment' : 'Book Appointment'}
          </h2>
          <button
            onClick={handleModalClose}
            className={`text-gray-400 hover:text-gray-600 ${
              showPayment && createdAppointmentId ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={showPayment && createdAppointmentId ? true : false}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-20 right-4 z-[9999] max-w-sm"
            >
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 border border-green-600">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Success!</p>
                  <p className="text-sm text-green-100">{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-green-100 hover:text-white ml-4 flex-shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {serverError && (
          <div className="mx-6 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setServerError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {!showPayment ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 inline mr-2" />
                  Select Patient
                </label>
                <select
                  name="patient_id"
                  value={selectedUserId}
                  onChange={handleChange}
                  disabled={usersLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                >
                  <option value="">Select a patient...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
                {usersLoading && (
                  <p className="text-gray-500 text-xs mt-1">Loading users...</p>
                )}
                {errors.patient_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Appointment Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Appointment Time
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a time...</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                </select>
                {errors.time && (
                  <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="video"
                      checked={formData.type === 'video'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <Video className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm text-gray-700">Video Consultation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="in-person"
                      checked={formData.type === 'in-person'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-sm text-gray-700">In-Person Visit</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any specific concerns or symptoms..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </form>
          ) : (
            /* Payment Section */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Required</h3>
                <p className="text-gray-600 mb-4">Your appointment has been created. <strong>Payment is required to confirm your booking.</strong></p>
                
                {/* Warning message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You cannot close this window until payment is completed
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(doctor.consultationFee || 0)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatCurrency(doctor.consultationFee || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Select Payment Method</h4>
                <button
                  onClick={() => handlePayment('mpesa')}
                  disabled={paymentLoading}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">M</span>
                      </div>
                      <span className="font-medium">M-Pesa</span>
                    </div>
                    <span className="text-gray-500">Pay via M-Pesa</span>
                  </div>
                </button>

                <button
                  onClick={() => handlePayment('card')}
                  disabled={paymentLoading}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">C</span>
                      </div>
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                    <span className="text-gray-500">Pay with card</span>
                  </div>
                </button>

                <button
                  onClick={() => handlePayment('cash')}
                  disabled={paymentLoading}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">$</span>
                      </div>
                      <span className="font-medium">Cash</span>
                    </div>
                    <span className="text-gray-500">Pay at clinic</span>
                  </div>
                </button>
              </div>

              {/* Note about mandatory payment */}
              <div className="text-center text-sm text-gray-500">
                <p>Payment must be completed to confirm your appointment</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
