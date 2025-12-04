import React from 'react';
import { motion } from 'framer-motion';
import StaffMembers from '../components/features/StaffMembers';
import { Doctor, StaffMember } from '../types';

const DoctorsPage: React.FC = () => {
  const doctors: Doctor[] = [
    {
      id: '1',
      firstName: 'Mumbi',
      lastName: 'Johnson',
      specialization: 'Cardiologist',
      experience: 10,
      rating: 4.8,
      avatar: '/images/doctor1.jpg',
      bio: 'Expert in heart diseases and cardiovascular health with over 10 years of experience',
      availability: [
        { day: 'Monday', startTime: '9:00 AM', endTime: '5:00 PM' },
        { day: 'Wednesday', startTime: '9:00 AM', endTime: '5:00 PM' },
        { day: 'Friday', startTime: '9:00 AM', endTime: '5:00 PM' }
      ],
      consultationFee: 150
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      specialization: 'Pediatrician',
      experience: 8,
      rating: 4.9,
      avatar: '/images/doctor2.jpg',
      bio: 'Specialized in child healthcare and development, passione',
      availability: [
        { day: 'Tuesday', startTime: '8:00 AM', endTime: '4:00 PM' },
        { day: 'Thursday', startTime: '8:00 AM', endTime: '4:00 PM' },
        { day: 'Saturday', startTime: '9:00 AM', endTime: '1:00 PM' }
      ],
      consultationFee: 120
    },
    {
      id: '3',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      specialization: 'Dermatologist',
      experience: 12,
      rating: 4.7,
      avatar: '/images/doctor3.jpg',
      bio: 'Skin care specialist and cosmetic dermatology expert with advanced training',
      availability: [
        { day: 'Monday', startTime: '10:00 AM', endTime: '6:00 PM' },
        { day: 'Wednesday', startTime: '10:00 AM', endTime: '6:00 PM' },
        { day: 'Friday', startTime: '10:00 AM', endTime: '6:00 PM' }
      ],
      consultationFee: 100
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Kimani',
      specialization: 'General Practitioner',
      experience: 15,
      rating: 4.6,
      avatar: '/images/doctor1.jpg',
      bio: 'Experienced family physician providing comprehensive healthcare for all ages',
      availability: [
        { day: 'Monday', startTime: '8:00 AM', endTime: '6:00 PM' },
        { day: 'Tuesday', startTime: '8:00 AM', endTime: '6:00 PM' },
        { day: 'Thursday', startTime: '8:00 AM', endTime: '6:00 PM' }
      ],
      consultationFee: 80
    },
    {
      id: '5',
      firstName: 'Mohamed',
      lastName: 'MbaBuu',
      specialization: 'General Practitioner',
      experience: 15,
      rating: 4.6,
      avatar: '/images/doctor1.jpg',
      bio: 'Experienced family physician providing comprehensive healthcare for all ages',
      availability: [
        { day: 'Monday', startTime: '8:00 AM', endTime: '6:00 PM' },
        { day: 'Tuesday', startTime: '8:00 AM', endTime: '6:00 PM' },
        { day: 'Thursday', startTime: '8:00 AM', endTime: '6:00 PM' }
      ],
      consultationFee: 80
    },
    {
      id: '6',
      firstName: 'Seco',
      lastName: 'Kanyatta',
      specialization: 'General Practitioner',
      experience: 15,
      rating: 4.6,
      avatar: '/images/doctor1.jpg',
      bio: 'Experienced family physician providing comprehensive healthcare for all ages',
      availability: [
        { day: 'Monday', startTime: '8:00 AM', endTime: '6:00 PM' },
        { day: 'Tuesday', startTime: '8:00 AM', endTime: '6:00 PM' },
        { day: 'Thursday', startTime: '8:00 AM', endTime: '6:00 PM' }
      ],
      consultationFee: 80
    }
  ];

  // Convert Doctor objects to StaffMember format for the shared component
  const staffMembers: StaffMember[] = doctors.map(doctor => ({
    id: doctor.id,
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
  }));

  const handleBookAppointment = (member: StaffMember) => {
    console.log('Book appointment for:', member);
    // Navigate to appointment booking page with doctor ID
    window.location.href = `/appointments?doctor=${member.id}`;
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
    </div>
  );
};

export default DoctorsPage;