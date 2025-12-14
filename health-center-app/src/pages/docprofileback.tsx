// pages/DoctorProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Edit3, Camera, Lock, MapPin, Building2,
  GraduationCap, Award, Clock, Calendar, Star, FileText,
  Globe, Stethoscope, Shield, CheckCircle, X, Plus, Trash2,
  Video, MessageSquare, Users, TrendingUp, DollarSign,
  Bell, Settings, ChevronRight, Save, AlertCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useUser } from '../services/useUser';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

// Types
interface Certification {
  id: string;
  title: string;
  institution: string;
  year: string;
  type: 'degree' | 'certification' | 'license';
  licenseNumber?: string;
  expiryDate?: string;
}

interface AvailabilitySlot {
  day: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientImage: string;
  date: string;
  time: string;
  type: 'in-person' | 'video' | 'phone';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  duration: number;
}

interface DoctorStats {
  totalPatients: number;
  appointmentsThisWeek: number;
  rating: number;
  reviewCount: number;
  earnings: number;
}

const DoctorProfilePage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State Management
  const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'availability' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    full_name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@citymedical.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Gastroenterology',
    experience: '15',
    bio: 'Board-certified gastroenterologist with over 15 years of experience in digestive health. Specializing in IBD, liver diseases, and advanced endoscopic procedures.',
    hospital: 'City Medical Center',
    department: 'Gastroenterology Department',
    location: 'Main Building, Floor 3, Room 312',
    consultationFee: '150',
    languages: ['English', 'Spanish', 'French'],
    profile_picture: ''
  });

  // Certifications
  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: '1',
      title: 'Doctor of Medicine (MD)',
      institution: 'Harvard Medical School',
      year: '2008',
      type: 'degree'
    },
    {
      id: '2',
      title: 'Board Certified - Gastroenterology',
      institution: 'American Board of Internal Medicine',
      year: '2012',
      type: 'certification',
      expiryDate: '2025-12'
    },
    {
      id: '3',
      title: 'State Medical License',
      institution: 'State Medical Board',
      year: '2008',
      type: 'license',
      licenseNumber: 'ML-2008-12345',
      expiryDate: '2025-06'
    }
  ]);

  // Availability
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { day: 'Monday', isOpen: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Tuesday', isOpen: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Wednesday', isOpen: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Thursday', isOpen: true, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Friday', isOpen: true, startTime: '09:00', endTime: '15:00' },
    { day: 'Saturday', isOpen: false, startTime: '', endTime: '' },
    { day: 'Sunday', isOpen: false, startTime: '', endTime: '' }
  ]);

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientName: 'John Smith',
      patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      date: '2024-01-15',
      time: '09:00',
      type: 'in-person',
      status: 'pending',
      reason: 'Follow-up consultation for digestive issues',
      duration: 30
    },
    {
      id: '2',
      patientName: 'Emily Davis',
      patientImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      date: '2024-01-15',
      time: '10:00',
      type: 'video',
      status: 'confirmed',
      reason: 'Initial consultation - stomach pain',
      duration: 45
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      patientImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      date: '2024-01-15',
      time: '11:00',
      type: 'in-person',
      status: 'confirmed',
      reason: 'Endoscopy results review',
      duration: 30
    },
    {
      id: '4',
      patientName: 'Sarah Wilson',
      patientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      date: '2024-01-16',
      time: '09:30',
      type: 'phone',
      status: 'pending',
      reason: 'Prescription renewal',
      duration: 15
    }
  ]);

  // Stats
  const [stats] = useState<DoctorStats>({
    totalPatients: 1247,
    appointmentsThisWeek: 32,
    rating: 4.9,
    reviewCount: 328,
    earnings: 12500
  });

  const { user, isLoading, updateUser } = useUser();

  // Handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      // API call to save profile
      setSaveMessage({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'confirm' | 'reschedule' | 'cancel' | 'complete') => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: action === 'confirm' ? 'confirmed' : action === 'cancel' ? 'cancelled' : action === 'complete' ? 'completed' : apt.status }
          : apt
      )
    );
    setSaveMessage({ type: 'success', message: `Appointment ${action}ed successfully!` });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleAvailabilityChange = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability(prev =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      title: '',
      institution: '',
      year: '',
      type: 'certification'
    };
    setCertifications([...certifications, newCert]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(cert =>
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const addLanguage = () => {
    const language = prompt('Enter language:');
    if (language && !profileData.languages.includes(language)) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, language]
      });
    }
  };

  const removeLanguage = (lang: string) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages.filter(l => l !== lang)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Messages */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert
              type={saveMessage.type}
              message={saveMessage.message}
              onClose={() => setSaveMessage(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={profileData.profile_picture || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                alt="Doctor Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-lg hover:bg-gray-100"
              >
                <Camera className="w-4 h-4" />
              </button>
              <div className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{profileData.full_name}</h1>
                <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">Verified</span>
              </div>
              <p className="text-blue-100 text-lg mb-2">{profileData.specialization}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {profileData.hospital}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profileData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {stats.rating} ({stats.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <div className="text-xs text-blue-100">Total Patients</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.appointmentsThisWeek}</div>
                <div className="text-xs text-blue-100">This Week</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.rating}</div>
                <div className="text-xs text-blue-100">Rating</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">${stats.earnings}</div>
                <div className="text-xs text-blue-100">This Month</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'availability', label: 'Availability', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <ProfileTab
              profileData={profileData}
              certifications={certifications}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleProfileChange={handleProfileChange}
              handleSaveProfile={handleSaveProfile}
              addCertification={addCertification}
              removeCertification={removeCertification}
              updateCertification={updateCertification}
              addLanguage={addLanguage}
              removeLanguage={removeLanguage}
            />
          )}
          {activeTab === 'appointments' && (
            <AppointmentsTab
              appointments={appointments}
              handleAppointmentAction={handleAppointmentAction}
            />
          )}
          {activeTab === 'availability' && (
            <AvailabilityTab
              availability={availability}
              handleAvailabilityChange={handleAvailabilityChange}
              consultationFee={profileData.consultationFee}
              onFeeChange={(fee) => setProfileData({ ...profileData, consultationFee: fee })}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Profile Tab Component
interface ProfileTabProps {
  profileData: any;
  certifications: Certification[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSaveProfile: () => void;
  addCertification: () => void;
  removeCertification: (id: string) => void;
  updateCertification: (id: string, field: keyof Certification, value: string) => void;
  addLanguage: () => void;
  removeLanguage: (lang: string) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profileData,
  certifications,
  isEditing,
  setIsEditing,
  handleProfileChange,
  handleSaveProfile,
  addCertification,
  removeCertification,
  updateCertification,
  addLanguage,
  removeLanguage
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid lg:grid-cols-3 gap-8"
    >
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* About Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          
          {isEditing ? (
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write about yourself..."
            />
          ) : (
            <p className="text-gray-600 leading-relaxed">{profileData.bio}</p>
          )}

          {/* Specializations */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Specializations</h4>
            <div className="flex flex-wrap gap-2">
              {['Gastroenterology', 'Endoscopy', 'IBD Treatment', 'Liver Diseases', 'Colonoscopy'].map(spec => (
                <span
                  key={spec}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Education & Certifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Education & Certifications</h3>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={addCertification}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`p-3 rounded-lg ${
                  cert.type === 'degree' ? 'bg-purple-100 text-purple-600' :
                  cert.type === 'certification' ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {cert.type === 'degree' ? <GraduationCap className="w-6 h-6" /> :
                   cert.type === 'certification' ? <Award className="w-6 h-6" /> :
                   <Shield className="w-6 h-6" />}
                </div>
                
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) => updateCertification(cert.id, 'title', e.target.value)}
                      placeholder="Title"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={cert.institution}
                      onChange={(e) => updateCertification(cert.id, 'institution', e.target.value)}
                      placeholder="Institution"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={cert.year}
                      onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                      placeholder="Year"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={cert.type}
                      onChange={(e) => updateCertification(cert.id, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="degree">Degree</option>
                      <option value="certification">Certification</option>
                      <option value="license">License</option>
                    </select>
                    {cert.type === 'license' && (
                      <input
                        type="text"
                        value={cert.licenseNumber || ''}
                        onChange={(e) => updateCertification(cert.id, 'licenseNumber', e.target.value)}
                        placeholder="License Number"
                        className="px-3 py-2 border border-gray-300 rounded-lg col-span-2"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{cert.title}</h4>
                    <p className="text-gray-600 text-sm">{cert.institution}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{cert.year}</span>
                      {cert.licenseNumber && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {cert.licenseNumber}
                        </span>
                      )}
                      {cert.expiryDate && (
                        <span>Expires: {cert.expiryDate}</span>
                      )}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={() => removeCertification(cert.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={profileData.full_name}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={profileData.specialization}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={profileData.experience}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                name="consultationFee"
                value={profileData.consultationFee}
                onChange={handleProfileChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        {isEditing && (
          <div className="flex gap-4">
            <Button onClick={handleSaveProfile} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hospital</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="hospital"
                    value={profileData.hospital}
                    onChange={handleProfileChange}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profileData.hospital}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profileData.location}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profileData.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  <p className="font-medium text-gray-900">{profileData.email}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
            {isEditing && (
              <button
                onClick={addLanguage}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.languages.map((lang: string) => (
              <span
                key={lang}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                {lang}
                {isEditing && (
                  <button
                    onClick={() => removeLanguage(lang)}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium text-green-600">98%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">On-time Rate</span>
              <span className="font-medium text-blue-600">95%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-600">Patient Satisfaction</span>
              <span className="font-medium text-purple-600">4.9/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

// Appointments Tab Component
interface AppointmentsTabProps {
  appointments: Appointment[];
  handleAppointmentAction: (id: string, action: 'confirm' | 'reschedule' | 'cancel' | 'complete') => void;
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ appointments, handleAppointmentAction }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRescheduleModal, setShowRescheduleModal] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  const filteredAppointments = appointments.filter(apt => {
    if (filter !== 'all' && apt.status !== filter) return false;
    return true;
  });

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);
  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Appointments</p>
              <p className="text-2xl font-bold">{todayAppointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Approval</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 opacity-80" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed Today</p>
              <p className="text-2xl font-bold">
                {appointments.filter(a => a.status === 'completed' && a.date === selectedDate).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">This Week</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments found</p>
                </div>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={appointment.patientImage}
                        alt={appointment.patientName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                            <p className="text-sm text-gray-500">{appointment.reason}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(appointment.type)}
                            {appointment.type}
                          </span>
                          <span>{appointment.duration} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {appointment.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Button
                          size="sm"
                          onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowRescheduleModal(appointment.id)}
                          className="flex-1"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {appointment.status === 'confirmed' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Button
                          size="sm"
                          onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                        {appointment.type === 'video' && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Video className="w-4 h-4 mr-1" />
                            Start Call
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowRescheduleModal(appointment.id)}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Reschedule
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Select Date</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments for this date</p>
              ) : (
                todayAppointments.map(apt => (
                  <div key={apt.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">{apt.time}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{apt.patientName}</p>
                      <p className="text-xs text-gray-500">{apt.duration} min</p>
                    </div>
                    {getTypeIcon(apt.type)}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Block Time Slot
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Set Vacation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Export Schedule
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowRescheduleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                  <input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                  <input
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => {
                    handleAppointmentAction(showRescheduleModal, 'reschedule');
                    setShowRescheduleModal(null);
                  }} className="flex-1">
                    Confirm Reschedule
                  </Button>
                  <Button variant="outline" onClick={() => setShowRescheduleModal(null)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Availability Tab Component
interface AvailabilityTabProps {
  availability: AvailabilitySlot[];
  handleAvailabilityChange: (index: number, field: keyof AvailabilitySlot, value: any) => void;
  consultationFee: string;
  onFeeChange: (fee: string) => void;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  availability,
  handleAvailabilityChange,
  consultationFee,
  onFeeChange
}) => {
  const [appointmentDuration, setAppointmentDuration] = useState('30');
  const [bufferTime, setBufferTime] = useState('10');
  const [maxAppointmentsPerDay, setMaxAppointmentsPerDay] = useState('20');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid lg:grid-cols-3 gap-6"
    >
      {/* Weekly Schedule */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Schedule</h3>
          <div className="space-y-4">
            {availability.map((slot, index) => (
              <div
                key={slot.day}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg ${
                  slot.isOpen ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slot.isOpen}
                      onChange={(e) => handleAvailabilityChange(index, 'isOpen', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="font-medium text-gray-900">{slot.day}</span>
                </div>

                {slot.isOpen ? (
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">From</span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">To</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Break</span>
                      <input
                        type="time"
                        value={slot.breakStart || ''}
                        onChange={(e) => handleAvailabilityChange(index, 'breakStart', e.target.value)}
                        placeholder="Start"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={slot.breakEnd || ''}
                        onChange={(e) => handleAvailabilityChange(index, 'breakEnd', e.target.value)}
                        placeholder="End"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Closed</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Schedule
            </Button>
            <Button variant="outline" className="flex-1">
              Reset to Default
            </Button>
          </div>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Appointment Settings */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Appointment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee ($)
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => onFeeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Duration (minutes)
              </label>
              <select
                value={appointmentDuration}
                onChange={(e) => setAppointmentDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buffer Between Appointments (minutes)
              </label>
              <select
                value={bufferTime}
                onChange={(e) => setBufferTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="0">No buffer</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Appointments Per Day
              </label>
              <input
                type="number"
                value={maxAppointmentsPerDay}
                onChange={(e) => setMaxAppointmentsPerDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* Consultation Types */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Consultation Types</h3>
          <div className="space-y-3">
            {[
              { type: 'In-Person', icon: User, enabled: true, fee: '$150' },
              { type: 'Video Call', icon: Video, enabled: true, fee: '$120' },
              { type: 'Phone Call', icon: Phone, enabled: true, fee: '$80' },
              { type: 'Chat', icon: MessageSquare, enabled: false, fee: '$50' }
            ].map(item => (
              <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={item.enabled ? 'text-gray-900' : 'text-gray-400'}>{item.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{item.fee}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Time Off */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upcoming Time Off</h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Conference</span>
                <button className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">Jan 20-22, 2024</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Off
          </Button>
        </Card>
      </div>
    </motion.div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid lg:grid-cols-2 gap-6"
    >
      {/* Notification Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'New Appointment Requests', description: 'Get notified when patients book appointments', enabled: true },
            { label: 'Appointment Reminders', description: 'Receive reminders before scheduled appointments', enabled: true },
            { label: 'Patient Messages', description: 'Notifications for new messages from patients', enabled: true },
            { label: 'Cancellation Alerts', description: 'Get notified when appointments are cancelled', enabled: true },
            { label: 'Weekly Summary', description: 'Receive weekly performance summary', enabled: false },
            { label: 'Marketing Emails', description: 'Promotional content and platform updates', enabled: false }
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Shield className="w-4 h-4 mr-2" />
            Enable Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <User className="w-4 h-4 mr-2" />
            Manage Connected Devices
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Deactivate Account
          </Button>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'Show Profile to Patients', description: 'Your profile will appear in search results', enabled: true },
            { label: 'Show Rating & Reviews', description: 'Display your ratings publicly', enabled: true },
            { label: 'Allow Online Booking', description: 'Patients can book appointments directly', enabled: true },
            { label: 'Show Availability', description: 'Display your schedule to patients', enabled: true }
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Data & Export */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Data & Export</h3>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Download Patient Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Export Appointment History
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <DollarSign className="w-4 h-4 mr-2" />
            Download Financial Reports
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default DoctorProfilePage;