import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StaffMembers from '../components/features/StaffMembers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import { Doctor, StaffMember } from '../types';
import { useDoctors } from '../services/useDoctor';

const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { doctors, isLoading, fetchDoctors } = useDoctors();

  // Load doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Convert backend doctors to Doctor type format
  const formattedDoctors: Doctor[] = useMemo(
    () =>
      doctors.map((doctor) => {
        const nameParts = doctor.fullName.split(' ');
        return {
          id: doctor.id.toString(),
          firstName: nameParts[0] || 'Dr',
          lastName: nameParts.slice(1).join(' ') || '',
          specialization: doctor.specialization || 'General Practitioner',
          experience: 0,
          rating: doctor.rating || 0,
          avatar: doctor.avatar || '/images/doctor-default.jpg',
          bio: doctor.bio || 'Professional healthcare provider',
          availability: [],
          consultationFee: doctor.consultationFee || 0,
        };
      }),
    [doctors]
  );

  // Convert Doctor objects to StaffMember format for the shared component
  const staffMembers: StaffMember[] = useMemo(
    () =>
      formattedDoctors.map(doctor => ({
        id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        role: 'Doctor',
        specialization: doctor.specialization,
        status: 'active' as const,
        rating: doctor.rating,
        avatar: doctor.avatar,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        bio: doctor.bio,
        availability: doctor.availability
      })),
    [formattedDoctors]
  );

  const handleBookAppointment = (member: StaffMember) => {
    // Navigate to appointments page with doctor pre-selected
    navigate(`/appointments?doctor=${member.id}`);
  };

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

      {isLoading ? (
        <Card className="p-12 flex items-center justify-center">
          <LoadingSpinner />
        </Card>
      ) : (
        <StaffMembers 
          staff={staffMembers}
          viewMode="cards"
          showActions={false}
          showFilters={true}
          showSearch={true}
          title=""
          onStaffClick={(member) => console.log('View doctor:', member)}
          onBookAppointment={handleBookAppointment}
          onView={(member) => console.log('View profile:', member)}
          className="space-y-6"
        />
      )}
    </div>
  );
};

export default DoctorsPage;