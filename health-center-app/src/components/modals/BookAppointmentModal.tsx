import React, { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { StaffMember } from '../../types';

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
  }) => Promise<void>;
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
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await onSubmit({
        patient_id: patientId,
        doctor_id: doctor.id,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        notes: formData.notes || undefined,
      });
      setFormData({
        date: '',
        time: '',
        type: 'video',
        notes: '',
      });
      onClose();
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

  if (!isOpen || !doctor) return null;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Doctor Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={doctor.avatar || '/images/default-avatar.jpg'}
                alt={doctor.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {doctor.role === 'Doctor' ? 'Dr. ' : ''}{doctor.name}
                </p>
                {doctor.specialization && (
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                )}
              </div>
            </div>
            {doctor.consultationFee && (
              <p className="mt-3 text-sm text-gray-700">
                <span className="font-medium">Fee:</span> ${doctor.consultationFee}
              </p>
            )}
          </div>

          {serverError && (
            <Alert
              type="error"
              message={serverError}
              onClose={() => setServerError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
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
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
