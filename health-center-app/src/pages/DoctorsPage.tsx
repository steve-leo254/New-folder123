import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Calendar, Video } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DoctorCard from '../components/features/DoctorCard';
import { Doctor } from '../types';

const DoctorsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const doctors: Doctor[] = [
    {
      id: '1',
      firstName: 'Sarah',
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
      bio: 'Specialized in child healthcare and development, passionate about pediatric medicine',
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
    }
  ];

  const specializations = ['all', 'Cardiologist', 'Pediatrician', 'Dermatologist', 'General Practitioner'];

  const filteredDoctors = doctors
    .filter(doctor => {
      const matchesSearch = doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = selectedSpecialization === 'all' || 
                                   doctor.specialization === selectedSpecialization;
      return matchesSearch && matchesSpecialization;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
      return 0;
    });

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

      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>
                {spec === 'all' ? 'All Specializations' : spec}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Sort by Rating</option>
            <option value="experience">Sort by Experience</option>
            <option value="fee">Sort by Fee</option>
          </select>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;