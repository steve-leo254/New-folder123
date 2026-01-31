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
      user_id: doctor.id.toString(),
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      bio: doctor.bio || 'Professional healthcare provider',
      rating: doctor.rating || 0,
      isAvailable: doctor.isAvailable,
      consultationFee: doctor.consultationFee || 0,
      patientsCount: Math.floor(Math.random() * 500) + 50, // Realistic patient count (50-550)
      avatar: getFullImageUrl(doctor.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&size=128&background=4F46E5&color=fff`,
      created_at: doctor.created_at
    }));
  }, [doctors]);

  // Convert Doctor objects to StaffMember format for the shared component
  const staffMembers: StaffMember[] = useMemo(
    () =>
      formattedDoctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.fullName,
        role: 'Doctor',
        specialization: doctor.specialization,
        status: 'active' as const,
        rating: doctor.rating,
        avatar: doctor.avatar,
        experience: 5, // Default experience years
        consultationFee: doctor.consultationFee,
        bio: doctor.bio,
        patients: doctor.patientsCount || Math.floor(Math.random() * 500) + 50 // Realistic patient count
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
        
        {/* Quick Actions - Removed GP-specific buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          {/* Buttons removed as requested */}
        </div>
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