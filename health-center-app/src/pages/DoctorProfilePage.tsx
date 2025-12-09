import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, Video, Phone, Mail } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../services/formatCurrency';
import { getFullImageUrl } from '../utils/imageUtils';

interface Doctor {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  specialization: string;
  bio: string;
  rating: number;
  consultationFee: number;
  isAvailable: boolean;
  profilePicture?: string;
  experience?: number;
}

const DoctorProfilePage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/staff`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch doctor profile');
        }

        const staffData = await response.json();
        // Find the specific doctor from staff list
        const doctorData = staffData.find((staffMember: any) => 
          staffMember.id === parseInt(doctorId!) && 
          staffMember.role === 'DOCTOR' && 
          staffMember.doctor
        );
        
        if (!doctorData) {
          throw new Error('Doctor not found');
        }

        // Transform staff data to Doctor interface
        const transformedDoctor: Doctor = {
          id: doctorData.id,
          fullName: doctorData.fullName,
          email: doctorData.email,
          phone: doctorData.phone,
          specialization: doctorData.doctor.specialization,
          bio: doctorData.doctor.bio,
          rating: doctorData.doctor.rating,
          consultationFee: doctorData.doctor.consultationFee,
          isAvailable: doctorData.doctor.isAvailable,
          profilePicture: getFullImageUrl(doctorData.avatar),
          experience: 0, // This would need to be calculated from join date if needed
        };
        
        setDoctor(transformedDoctor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Doctor not found'}</p>
            <Link to="/doctors">
              <Button>Back to Doctors</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/doctors" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Doctors
        </Link>

        {/* Profile Header */}
        <Card className="overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={doctor.profilePicture || '/images/doctor-placeholder.jpg'}
                  alt={doctor.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                />
                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${
                  doctor.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">Dr. {doctor.fullName}</h1>
                <p className="text-primary-100 mb-2">{doctor.specialization}</p>
                <div className="flex items-center space-x-4">
                  <Badge variant={doctor.isAvailable ? 'success' : 'secondary'}>
                    {doctor.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                  <div className="flex items-center text-white">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{doctor.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{doctor.email}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Nairobi, Kenya</span>
                </div>
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience & Qualifications</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{doctor.experience || 5} years of experience</span>
                </div>
                <div className="flex items-center">
                  <Video className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Available for video consultations</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultation Fee */}
            {doctor.consultationFee && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Fee</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {formatCurrency(doctor.consultationFee)}
                  </div>
                  <p className="text-sm text-gray-600">per consultation</p>
                </div>
              </Card>
            )}

            {/* Book Appointment */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Appointment</h3>
              <Link to={`/appointments?doctor=${doctor.id}`}>
                <Button className="w-full" disabled={!doctor.isAvailable}>
                  {doctor.isAvailable ? 'Book Appointment' : 'Currently Unavailable'}
                </Button>
              </Link>
              {!doctor.isAvailable && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  This doctor is currently not accepting new appointments
                </p>
              )}
            </Card>

            {/* Availability */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monday - Friday</span>
                  <span className="text-sm font-medium">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Saturday</span>
                  <span className="text-sm font-medium">9:00 AM - 1:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sunday</span>
                  <span className="text-sm font-medium">Closed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
