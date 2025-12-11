import React, { useMemo } from 'react';
import { useDoctors } from '../../services/useDoctors';
import DoctorsProfilePage from '../../pages/DoctorsProfilePage';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { Doctor } from '../../types';
import { getFullImageUrl } from '../../utils/imageUtils';

export const DoctorsProfilePageWrapper: React.FC = () => {
  // Call useDoctors hook consistently without parameters
  const { doctors, loading, error } = useDoctors();

  // Transform backend doctor data to match frontend Doctor type
  const transformedDoctors: Doctor[] = useMemo(() => {
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

  if (loading) {
    return <LoadingSpinner message="Loading doctor information..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DoctorsProfilePage
      doctors={transformedDoctors}
      currentUserId="patient-1"
      currentUserName="John Doe"
      userType="patient"
    />
  );
};

export default DoctorsProfilePageWrapper;
