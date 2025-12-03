import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, Users, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Doctor } from '../../types';

interface AppointmentFormProps {
  doctor: Doctor | null;
  onClose: () => void;
}

type AppointmentType = 'video' | 'in-person';

interface AppointmentData {
  doctor: Doctor | null;
  date: string;
  time: string;
  type: AppointmentType;
  reason: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ doctor, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('video');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize time slots to prevent recreation on every render
  const timeSlots = useMemo(() => [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ], []);

  // Get minimum date (today) to prevent selecting past dates
  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return selectedDate && selectedTime && reason.trim().length > 0;
  }, [selectedDate, selectedTime, reason]);

  // Use useCallback to prevent function recreation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsSubmitting(true);

    const appointmentData: AppointmentData = {
      doctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      reason
    };

    try {
      // Handle appointment booking logic here
      console.log('Appointment booked:', appointmentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [doctor, selectedDate, selectedTime, appointmentType, reason, isFormValid, onClose]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  const handleReasonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const handleAppointmentTypeChange = useCallback((type: AppointmentType) => {
    setAppointmentType(type);
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                <p className="text-sm text-gray-600 mt-1">Schedule your consultation</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close appointment form"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Doctor Info */}
          {doctor && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-gradient-to-br from-gray-50 to-primary-50"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={doctor.avatar}
                    alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-gray-600">{doctor.specialization}</p>
                  <p className="text-primary-600 font-semibold mt-1">
                    ${doctor.consultationFee} <span className="text-sm text-gray-500">per session</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Appointment Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => handleAppointmentTypeChange('video')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all relative ${
                    appointmentType === 'video'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video className={`w-6 h-6 mx-auto mb-2 ${
                    appointmentType === 'video' ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                  <span className="block text-sm font-medium">Video Consultation</span>
                  {appointmentType === 'video' && (
                    <CheckCircle className="w-5 h-5 text-primary-600 absolute top-2 right-2" />
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleAppointmentTypeChange('in-person')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all relative ${
                    appointmentType === 'in-person'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className={`w-6 h-6 mx-auto mb-2 ${
                    appointmentType === 'in-person' ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                  <span className="block text-sm font-medium">In-Person Visit</span>
                  {appointmentType === 'in-person' && (
                    <CheckCircle className="w-5 h-5 text-primary-600 absolute top-2 right-2" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Select Date
              </label>
              <input
                id="appointment-date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={minDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Select Time
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <motion.button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      selectedTime === time
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={handleReasonChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                placeholder="Please describe your symptoms or reason for appointment..."
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {reason.length}/500 characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </span>
                ) : (
                  'Confirm Appointment'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppointmentForm;