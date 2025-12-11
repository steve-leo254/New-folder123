import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StaffMembers from '../components/features/StaffMembers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Doctor, StaffMember } from '../types';
import { useDoctors } from '../services/useDoctors';
import { getFullImageUrl } from '../utils/imageUtils';

const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  // Call useDoctors hook consistently without parameters
  const { doctors, loading, error } = useDoctors();

  // Transform backend doctor data to match frontend Doctor type
  const formattedDoctors: Doctor[] = useMemo(() => {
    console.log('Raw doctor data:', doctors);
    
    return doctors.map((doctor) => ({
      id: doctor.id.toString(),
      firstName: doctor.fullName.split(' ')[0] || 'Dr',
      lastName: doctor.fullName.split(' ').slice(1).join(' ') || '',
      name: doctor.fullName,
      specialization: doctor.specialization,
      specialty: doctor.specialization,
      experience: 5, // Default value - could be calculated from created_at
      rating: doctor.rating,
      avatar: getFullImageUrl(doctor.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&size=128&background=4F46E5&color=fff`,
      imageUrl: getFullImageUrl(doctor.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&size=128&background=4F46E5&color=fff`,
      bio: doctor.bio || 'Professional healthcare provider',
      availability: [],
      consultationFee: doctor.consultationFee,
      available: doctor.isAvailable,
      reviewCount: 0, // Could be added to backend later
      hospital: 'City Medical Center', // Could be added to backend later
      location: 'Main Building', // Could be added to backend later
      phone: doctor.phone,
      email: doctor.email,
      languages: ['English'], // Could be added to backend later
      education: 'Medical Degree', // Could be added to backend later
      specializations: [doctor.specialization],
    }));
  }, [doctors]);

  // Convert Doctor objects to StaffMember format for the shared component
  const staffMembers: StaffMember[] = useMemo(
    () =>
      formattedDoctors.map((doctor) => ({
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        role: 'Doctor',
        specialization: doctor.specialization,
        status: 'active' as const,
        rating: doctor.rating,
        avatar: doctor.avatar,
        experience: typeof doctor.experience === 'number' ? doctor.experience : parseInt(doctor.experience) || 0,
        consultationFee: doctor.consultationFee ?? 0,
        bio: doctor.bio,
        availability: doctor.availability
      })),
    [formattedDoctors]
  );

  const handleBookAppointment = (member: StaffMember) => {
    // Navigate to appointments page with doctor pre-selected
    navigate(`/appointments?doctor=${member.id}`);
  };

  const handleViewProfile = (member: StaffMember) => {
    // Navigate to doctor profile page
    navigate(`/doctor/${member.id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading doctors..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Doctors</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Doctors</h1>
        <p className="text-gray-600">Find and book appointments with our expert medical professionals</p>
      </motion.div>

      <StaffMembers 
        staff={staffMembers}
        viewMode="cards"
        showActions={false}
        showFilters={true}
        showSearch={true}
        title=""
        onStaffClick={(member) => console.log('View doctor:', member)}
        onBookAppointment={handleBookAppointment}
        onView={handleViewProfile}
        className="space-y-6"
      />
    </div>
  );
};

export default DoctorsPage;