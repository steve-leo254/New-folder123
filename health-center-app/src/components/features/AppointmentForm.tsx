import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Video, Users } from 'lucide-react';
import Button from '../ui/Button';
import { Doctor } from '../../types';

interface AppointmentFormProps {
  doctor: Doctor | null;
  onClose: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ doctor, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'video' | 'in-person'>('video');
  const [reason, setReason] = useState('');

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle appointment booking logic here
    console.log('Appointment booked:', {
      doctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      reason
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {doctor && (
          <div className="p-6 bg-gray-50">
            <div className="flex items-center space-x-4">
              <img
                src={doctor.avatar}
                alt={doctor.firstName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-gray-600">{doctor.specialization}</p>
                <p className="text-primary-600 font-semibold">${doctor.consultationFee}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAppointmentType('video')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  appointmentType === 'video'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                <span className="block text-sm font-medium">Video Consultation</span>
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType('in-person')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  appointmentType === 'in-person'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-primary-600" />
                <span className="block text-sm font-medium">In-Person Visit</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedTime === time
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Please describe your symptoms or reason for appointment..."
              required
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Confirm Appointment
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentForm;