// pages/GeneralPracticePage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Video,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Star,
  Search,
  Filter,
  Shield,
  Award,
  Users,
  Stethoscope,
  CheckCircle,
  X,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Maximize2,
  Send,
  Paperclip,
  MoreVertical,
  Globe,
  Zap,
  Settings,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  HeartPulse,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useDoctors } from '../services/useDoctors';
import { useConsultationPricing } from '../services/useConsultationPricing';
import { useDoctorAvailability } from '../services/useDoctorAvailability';
import { formatCurrency } from '../services/formatCurrency';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getFullImageUrl } from '../utils/imageUtils';
import type { Doctor } from '../types';

// Local type definitions specific to this page
interface GPDoctor {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  nextAvailable: string;
  consultationFee: number;
  bio: string;
  education: string[];
  badges: string[];
  totalConsultations: number;
}

interface Symptom {
  id: string;
  name: string;
  icon: string;
  category: string;
}
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}
interface Appointment {
  id: string;
  doctor: GPDoctor;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'chat';
  status: 'upcoming' | 'completed' | 'cancelled';
  symptoms: string[];
  notes?: string;
}
interface ConsultationType {
  id: string;
  type: 'video' | 'phone' | 'chat';
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  duration: string;
}

const symptoms: Symptom[] = [
  { id: '1', name: 'Headache', icon: '🤕', category: 'Pain' },
  { id: '2', name: 'Fever', icon: '🤒', category: 'General' },
  { id: '3', name: 'Cough', icon: '😷', category: 'Respiratory' },
  { id: '4', name: 'Fatigue', icon: '😴', category: 'General' },
  { id: '5', name: 'Nausea', icon: '🤢', category: 'Digestive' },
  { id: '6', name: 'Back Pain', icon: '🔙', category: 'Pain' },
  { id: '7', name: 'Anxiety', icon: '😰', category: 'Mental' },
  { id: '8', name: 'Skin Rash', icon: '🔴', category: 'Skin' },
  { id: '9', name: 'Sore Throat', icon: '🗣️', category: 'Respiratory' },
  { id: '10', name: 'Stomach Pain', icon: '🤮', category: 'Digestive' },
  { id: '11', name: 'Dizziness', icon: '💫', category: 'Neurological' },
  { id: '12', name: 'Insomnia', icon: '🌙', category: 'Sleep' },
  { id: '13', name: 'Diarrhea', icon: '💩', category: 'Digestive' },
  { id: '14', name: 'Vomiting', icon: '🤢', category: 'Digestive' },
  { id: '15', name: 'Abdominal Pain', icon: '🤕', category: 'Pain' },
];

// Utility Components
const AvailabilityBadge: React.FC<{ status: GPDoctor['availability'] }> = ({ status }) => {
  const config = {
    available: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Available Now' },
    busy: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'In Session' },
    offline: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Offline' },
  };

  const { bg, text, dot, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-2 h-2 rounded-full ${dot} ${status === 'available' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
};

const RatingStars: React.FC<{ rating: number; showValue?: boolean }> = ({ rating, showValue = true }) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
    {showValue && <span className="text-sm font-medium text-gray-700">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>}
  </div>
);

// GPDoctor Card Component
const DoctorCard: React.FC<{
  doctor: GPDoctor;
  onSelect: (doctor: GPDoctor) => void;
  isSelected?: boolean;
}> = ({ doctor, onSelect, isSelected }) => {
  return (
    <div
      onClick={() => onSelect(doctor)}
      className={`relative bg-white rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-100'
          : 'shadow-md hover:shadow-lg border border-gray-100'
      }`}
    >
      {/* Badges */}
      {doctor.badges.length > 0 && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          {doctor.badges.slice(0, 1).map((badge) => (
            <span
              key={badge}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md"
            >
              ⭐ {badge}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-20 h-20 rounded-2xl object-cover shadow-md"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              doctor.availability === 'available'
                ? 'bg-green-500'
                : doctor.availability === 'busy'
                ? 'bg-yellow-500'
                : 'bg-gray-400'
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{doctor.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" />
            {doctor.specialization}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <RatingStars rating={doctor.rating} />
            <span className="text-xs text-gray-500">({doctor.reviewCount})</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {doctor.experience}+ yrs
            </span>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {doctor.languages.length} {doctor.languages.length === 1 ? 'lang' : 'langs'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Consultation Fee</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(doctor.consultationFee)}</p>
        </div>
        <div className="text-right">
          <AvailabilityBadge status={doctor.availability} />
          {doctor.availability !== 'available' && (
            <p className="text-xs text-gray-500 mt-1">
              <Clock className="w-3 h-3 inline mr-1" />
              {doctor.nextAvailable}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Symptom Checker Component
const SymptomChecker: React.FC<{
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}> = ({ selectedSymptoms, onSymptomsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');

  const filteredSymptoms = symptoms.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      onSymptomsChange(selectedSymptoms.filter((id) => id !== symptomId));
    } else {
      onSymptomsChange([...selectedSymptoms, symptomId]);
    }
  };

  const categories = [...new Set(symptoms.map((s) => s.category))];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl text-white">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Symptom Checker</h2>
          <p className="text-sm text-gray-500">Select your symptoms for better consultation</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search symptoms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Severity Selection */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">How severe are your symptoms?</p>
        <div className="flex gap-2">
          {[
            { value: 'mild', label: 'Mild', icon: <Smile className="w-5 h-5" />, color: 'green' },
            { value: 'moderate', label: 'Moderate', icon: <Meh className="w-5 h-5" />, color: 'yellow' },
            { value: 'severe', label: 'Severe', icon: <Frown className="w-5 h-5" />, color: 'red' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSeverity(option.value as typeof severity)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                severity === option.value
                  ? option.color === 'green'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : option.color === 'yellow'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms by Category */}
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {filteredSymptoms
                .filter((s) => s.category === category)
                .map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{symptom.icon}</span>
                    {symptom.name}
                    {selectedSymptoms.includes(symptom.id) && (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Summary */}
      {selectedSymptoms.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-700">
              {selectedSymptoms.length} symptom(s) selected
            </p>
            <button
              onClick={() => onSymptomsChange([])}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal: React.FC<{
  doctor: GPDoctor;
  onClose: () => void;
  onBook: (appointment: Partial<Appointment>) => void;
}> = ({ doctor, onClose, onBook }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Get consultation pricing for this doctor (convert GPDoctor to Doctor)
  const doctorForPricing: Doctor = {
    id: doctor.id,
    user_id: doctor.id,
    fullName: doctor.name,
    email: '',
    phone: '',
    specialization: doctor.specialization,
    bio: doctor.bio,
    rating: doctor.rating,
    isAvailable: doctor.availability === 'available',
    consultationFee: doctor.consultationFee,
    patientsCount: 0,
    avatar: doctor.avatar,
  };

  const { getConsultationTypes } = useConsultationPricing(doctorForPricing);

  // Get doctor availability
  const { timeSlots } = useDoctorAvailability(doctor.id);

  // Get dynamic consultation types with icons
  const consultationTypes = useMemo(() => {
    const types = getConsultationTypes();
    return types.map((type, index) => ({
      ...type,
      icon: index === 0 ? <Video className="w-6 h-6" /> : index === 1 ? <Phone className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />,
    }));
  }, [getConsultationTypes]);

  const [selectedType, setSelectedType] = useState<ConsultationType>(consultationTypes[0] || {
    id: 'video',
    type: 'video' as const,
    name: 'Video Call',
    description: 'Face-to-face consultation via HD video',
    icon: <Video className="w-6 h-6" />,
    price: 49,
    duration: '15-30 min',
  });

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
    };
  });

  const handleBook = () => {
    onBook({
      doctor,
      date: selectedDate,
      time: selectedTime,
      type: selectedType.type,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30"
              />
              <div>
                <h2 className="text-xl font-bold">{doctor.name}</h2>
                <p className="text-blue-100">{doctor.specialization}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    step >= s ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 rounded-full ${
                      step > s ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Step 1: Consultation Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Choose Consultation Type
              </h3>
              <div className="grid gap-4">
                {consultationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedType.id === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        selectedType.id === type.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{type.name}</p>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(type.price)}</p>
                      <p className="text-xs text-gray-500">{type.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Date
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`flex-shrink-0 w-20 p-3 rounded-xl border-2 transition-all ${
                        selectedDate === d.date
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`text-xs font-medium ${d.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                        {d.isToday ? 'Today' : d.day}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{d.dayNum}</p>
                      <p className="text-xs text-gray-500">{d.month}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Time
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? 'bg-blue-500 text-white'
                          : slot.available
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Your Appointment
              </h3>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Type</span>
                  <span className="font-medium text-gray-900">{selectedType.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">{selectedTime}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-blue-600">{formatCurrency(selectedType.price)}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms or concerns..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                />
              </div>

              {/* Payment Method */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Lock className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-800">Secure Payment</p>
                  <p className="text-sm text-green-600">Your payment info is encrypted</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 px-6 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                handleBook();
              }
            }}
            disabled={
              (step === 2 && (!selectedDate || !selectedTime))
            }
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? 'Confirm & Pay' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Video Call Component
const VideoCall: React.FC<{
  doctor: GPDoctor;
  onEnd: () => void;
}> = ({ doctor, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isOwn: boolean; time: string }>>([
    { text: 'Hello! How can I help you today?', isOwn: false, time: '10:00 AM' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      { text: message, isOwn: true, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Main Video Area */}
      <div className="absolute inset-0">
        {/* GPDoctor Video (Main) */}
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-48 h-48 rounded-full object-cover border-4 border-white/20"
          />
        </div>

        {/* Self Video (PIP) */}
        <div className="absolute bottom-24 right-6 w-40 h-56 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <VideoOff className="w-10 h-10 text-gray-400" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">You</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md rounded-full px-4 py-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-medium">{formatDuration(duration)}</span>
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
              <span className="text-white">{doctor.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
              <Maximize2 className="w-5 h-5" />
            </button>
            <button className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${
              isMuted ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-all ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button
            onClick={onEnd}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-all ${
              showChat ? 'bg-blue-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-2xl flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.isOwn
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Page Component
const GeneralPracticePage: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<GPDoctor | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available'>('all');
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments'>('doctors');

  // Fetch doctors from backend
  const { doctors: rawDoctors, loading, error } = useDoctors();

  // Get consultation pricing for selected doctor
  const { getConsultationTypes } = useConsultationPricing();

  // Map backend shape to UI shape expected by this page
  const formattedDoctors: GPDoctor[] = useMemo(
    () =>
      rawDoctors.map((doctor) => ({
        id: doctor.id.toString(),
        name: doctor.fullName,
        specialization: doctor.specialization,
        avatar:
          getFullImageUrl(doctor.avatar) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&size=128&background=4F46E5&color=fff`,
        rating: doctor.rating ?? 0,
        reviewCount: 0,
        experience: 5,
        languages: doctor.languages || [],
        availability: doctor.isAvailable ? 'available' : 'offline',
        nextAvailable: doctor.isAvailable ? 'Now' : 'Later',
        consultationFee: doctor.consultationFee ?? 0,
        bio: doctor.bio ?? '',
        education: [],
        badges: [],
        totalConsultations: 0,
      })),
    [rawDoctors]
  );

  // Handle loading and error states
  if (loading) {
    return <LoadingSpinner message="Loading doctors..." />;
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  const filteredDoctors = formattedDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability =
      filterAvailability === 'all' || doctor.availability === 'available';
    return matchesSearch && matchesAvailability;
  });

  const handleBookAppointment = (appointment: Partial<Appointment>) => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      doctor: appointment.doctor!,
      date: appointment.date!,
      time: appointment.time!,
      type: appointment.type!,
      status: 'upcoming',
      symptoms: selectedSymptoms,
      notes: appointment.notes,
    };
    setUpcomingAppointments([...upcomingAppointments, newAppointment]);
    setShowBookingModal(false);
    setSelectedDoctor(null);
  };

  const startInstantCall = (doctor: GPDoctor) => {
    setSelectedDoctor(doctor);
    setShowVideoCall(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">Trusted by 100,000+ patients</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Your Health,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  One Click Away
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 max-w-lg">
                Connect with certified doctors instantly via video, audio, or chat.
                Get professional medical advice from the comfort of your home.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    const availableGPDoctor = formattedDoctors.find(d => d.availability === 'available');
                    if (availableGPDoctor) startInstantCall(availableGPDoctor);
                  }}
                  className="group flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-900/30 hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Video className="w-5 h-5" />
                  Start Instant Consultation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center gap-3 bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all">
                  <Calendar className="w-5 h-5" />
                  Schedule for Later
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                {[
                  { icon: <Users className="w-6 h-6" />, value: '500+', label: 'Expert Doctors' },
                  { icon: <CalendarCheck className="w-6 h-6" />, value: '50K+', label: 'Consultations' },
                  { icon: <ThumbsUp className="w-6 h-6" />, value: '98%', label: 'Satisfaction' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2">
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-blue-100">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">
                How are you feeling today?
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {symptoms.slice(0, 6).map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => {
                      if (selectedSymptoms.includes(symptom.id)) {
                        setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom.id));
                      } else {
                        setSelectedSymptoms([...selectedSymptoms, symptom.id]);
                      }
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-white text-blue-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <span className="text-xl">{symptom.icon}</span>
                    <span className="text-sm font-medium">{symptom.name}</span>
                  </button>
                ))}
              </div>

              <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                Find a GPDoctor Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Symptom Checker */}
          <div className="lg:col-span-1">
            <SymptomChecker
              selectedSymptoms={selectedSymptoms}
              onSymptomsChange={setSelectedSymptoms}
            />

            {/* Quick Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Health Tips
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '💧', tip: 'Stay hydrated - drink 8 glasses of water daily' },
                  { icon: '😴', tip: 'Get 7-9 hours of quality sleep' },
                  { icon: '🏃', tip: '30 minutes of exercise improves mood' },
                  { icon: '🥗', tip: 'Eat a balanced diet with vegetables' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-sm text-gray-600">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Doctors */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setActiveTab('doctors')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'doctors'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Find Doctors
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
                  activeTab === 'appointments'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                My Appointments
                {upcomingAppointments.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {upcomingAppointments.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'doctors' && (
              <>
                {/* Search & Filter */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search doctors by name or specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterAvailability(filterAvailability === 'all' ? 'available' : 'all')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                          filterAvailability === 'available'
                            ? 'bg-green-100 text-green-700 border-2 border-green-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${filterAvailability === 'available' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        Available Now
                      </button>
                      <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all">
                        <Filter className="w-5 h-5" />
                        Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Doctors Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onSelect={(d) => {
                        setSelectedDoctor(d);
                        setShowBookingModal(true);
                      }}
                      isSelected={selectedDoctor?.id === doctor.id}
                    />
                  ))}
                </div>

                {filteredDoctors.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-500 mb-6">Book your first consultation with a doctor</p>
                    <button
                      onClick={() => setActiveTab('doctors')}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Find a Doctor
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6"
                    >
                      <img
                        src={appointment.doctor.avatar}
                        alt={appointment.doctor.name}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{appointment.doctor.name}</h3>
                        <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-blue-600">
                            {appointment.type === 'video' ? <Video className="w-4 h-4" /> : 
                             appointment.type === 'phone' ? <Phone className="w-4 h-4" /> : 
                             <MessageCircle className="w-4 h-4" />}
                            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Call
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startInstantCall(appointment.doctor)}
                          className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                        >
                          {appointment.type === 'video' ? <Video className="w-5 h-5" /> :
                           appointment.type === 'phone' ? <Phone className="w-5 h-5" /> :
                           <MessageCircle className="w-5 h-5" />}
                        </button>
                        <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Telemedicine Service?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience healthcare reimagined with our cutting-edge platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'HIPAA Compliant',
                description: 'Your health data is encrypted and protected',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: '24/7 Availability',
                description: 'Access healthcare anytime, anywhere',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Certified Doctors',
                description: 'All physicians are board-certified',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: <CreditCard className="w-8 h-8" />,
                title: 'Affordable Care',
                description: 'Transparent pricing with no hidden fees',
                color: 'from-green-500 to-emerald-500',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
          onBook={handleBookAppointment}
        />
      )}

      {showVideoCall && selectedDoctor && (
        <VideoCall
          doctor={selectedDoctor}
          onEnd={() => {
            setShowVideoCall(false);
            setSelectedDoctor(null);
          }}
        />
      )}
    </div>
  );
};

export default GeneralPracticePage;