import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StaffMembers from '../components/features/StaffMembers';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import { Doctor, StaffMember } from '../types';
import { useStaff } from '../services/useStaff';
import { getFullImageUrl } from '../utils/imageUtils';

const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { staff, loading, fetchStaff } = useStaff();

  // Load staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter only doctors from staff and convert to Doctor type format
  const formattedDoctors: Doctor[] = useMemo(
    () => {
      // Debug: Log the raw staff data
      console.log('Raw staff data:', staff);
      
      const doctors = staff
        .filter((staffMember) => staffMember.role === 'doctor' && staffMember.doctor)
        .map((staffMember) => {
          const nameParts = staffMember.fullName.split(' ');
          const doctor = staffMember.doctor!; // We already filtered for doctor existence
          return {
            id: staffMember.id.toString(),
            firstName: nameParts[0] || 'Dr',
            lastName: nameParts.slice(1).join(' ') || '',
            specialization: doctor.specialization,
            experience: 0,
            rating: doctor.rating,
            avatar: getFullImageUrl(staffMember.avatar) || '/images/doctor-default.jpg',
            bio: doctor.bio || 'Professional healthcare provider',
            availability: [],
            consultationFee: doctor.consultationFee,
          };
        });
      console.log('Filtered doctors:', doctors);
      return doctors;
    },
    [staff]
  );

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

      {loading ? (
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