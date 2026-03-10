import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppointmentForm from '../components/features/AppointmentForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Doctor } from '../types';
import { formatCurrency } from '@/services/formatCurrency';
import { useStaff } from '../services/useStaff';
import { useAppointments } from '../services/useAppointment';
import { useRealtimeAppointments } from '../hooks/useRealtimeAppointments';
import { getFullImageUrl } from '../utils/imageUtils';

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');

  // Fetch real data from hooks
  const { staff, loading, fetchStaff } = useStaff();
  const { appointments: dbAppointments, isLoading: appointmentsLoading, fetchAppointments, error: appointmentsError } = useAppointments();
  
  // Use real-time appointments hook for automatic updates
  const { appointments: realtimeAppointments, refreshAppointments } = useRealtimeAppointments('current-user');
  
  // Merge appointments from both hooks for real-time updates
  const allAppointments = useMemo(() => {
    const combined = [...dbAppointments, ...realtimeAppointments];
    // Remove duplicates by ID - keep the most recent version
    const uniqueMap = new Map();
    combined.forEach(apt => {
      if (apt.id) {
        // If appointment already exists, keep the one with more recent updated_at
        const existing = uniqueMap.get(apt.id);
        if (!existing || new Date(apt.updated_at || apt.createdAt || 0) > new Date(existing.updated_at || existing.createdAt || 0)) {
          uniqueMap.set(apt.id, apt);
        }
      }
    });
    return Array.from(uniqueMap.values());
  }, [dbAppointments, realtimeAppointments]);

  // Payment status helper functions
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payment Completed';
      case 'pending': return 'Payment Pending';
      case 'unpaid': return 'Payment Pending';
      case 'cancelled': return 'Payment Cancelled';
      case 'refunded': return 'Payment Refunded';
      default: return 'Payment Pending';
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStaff();
    fetchAppointments();
  }, []);

  // Filter only doctors from staff and convert to Doctor type format
  const formattedDoctors: Doctor[] = useMemo(
    () =>
      staff
        .filter((staffMember) => staffMember.role === 'doctor' && staffMember.doctor)
        .map((staffMember) => {
          const doctor = staffMember.doctor!;
          return {
            id: staffMember.id.toString(),
            user_id: staffMember.id.toString(),
            fullName: staffMember.fullName,
            name: staffMember.fullName, // Alias for fullName
            email: staffMember.email || '',
            phone: staffMember.phone || '',
            specialization: doctor.specialization,
            specialty: doctor.specialization, // Alias for specialization
            bio: doctor.bio || 'Professional healthcare provider',
            rating: doctor.rating,
            isAvailable: doctor.isAvailable,
            available: doctor.isAvailable, // Alias for isAvailable
            consultationFee: doctor.consultationFee,
            video_consultation_fee: doctor.video_consultation_fee || doctor.consultationFee,
            phone_consultation_fee: doctor.phone_consultation_fee || doctor.consultationFee,
            chat_consultation_fee: doctor.chat_consultation_fee || doctor.consultationFee,
            patientsCount: 0,
            reviewCount: doctor.reviewCount,
            experience: doctor.experience,
            avatar: getFullImageUrl(staffMember.avatar) || '/images/doctor-default.jpg',
            license_number: doctor.license_number,
            education: doctor.education,
          };
        }),
    [staff]
  );

  // Get unique specializations for filter dropdown
  const specializations = useMemo(
    () => ['all', ...new Set(formattedDoctors.map(d => d.specialization))],
    [formattedDoctors]
  );

  // Filter doctors based on search and specialization
  const filteredDoctors = useMemo(
    () =>
      formattedDoctors.filter(doctor => {
        const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialization = filterSpecialization === 'all' || 
                                     doctor.specialization === filterSpecialization;
        return matchesSearch && matchesSpecialization;
      }),
    [formattedDoctors, searchTerm, filterSpecialization]
  );

  // Get upcoming appointments (scheduled status AND future date) - limited to 3 most recent
  const upcomingAppointments = useMemo(
    () =>
      allAppointments
        .filter(apt => {
          const aptDate = new Date(apt.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to start of day
          return apt.status === 'scheduled' && aptDate >= today;
        })
        .sort((a, b) => {
          // Primary sort: by date ascending (soonest first)
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare !== 0) return dateCompare;
          
          // Secondary sort: by time ascending (earliest first)
          const timeA = a.time || '00:00';
          const timeB = b.time || '00:00';
          return timeA.localeCompare(timeB);
        })
        .slice(0, 3), // Show only 3 most recent appointments
    [allAppointments]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-gray-600">Schedule and manage your medical appointments</p>
      </motion.div>

      {showForm && (
        <AppointmentForm
          doctor={selectedDoctor}
          onClose={() => {
            setShowForm(false);
            setSelectedDoctor(null);
          }}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
              >
                <option value="all">All Specializations</option>
                {specializations.map(specialization => (
                  <option key={specialization} value={specialization}>{specialization}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredDoctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={doctor.avatar}
                        alt={doctor.fullName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Dr. {doctor.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-primary-600 font-semibold">{formatCurrency(doctor.consultationFee)}</span>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setShowForm(true);
                            }}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No doctors found matching your criteria</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            {appointmentsError && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {appointmentsError === 'Failed to fetch appointments' 
                    ? 'Unable to load appointments. Please log in again or try later.'
                    : appointmentsError}
                </p>
              </div>
            )}
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  // Format the appointment date
                  const formattedDate = appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Date TBD';
                  
                  // Format the time - use appointment.time which is in HH:MM format
                  const formattedTime = appointment.time ? new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : 'Time TBD';

                  return (
                    <div key={appointment.id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{formattedDate}</p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formattedTime}
                          </p>
                          {appointment.doctorName && (
                            <p className="text-xs text-gray-500 mt-1">
                              Dr. {appointment.doctorName}
                            </p>
                          )}
                          {appointment.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            appointment.type === 'video' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {appointment.type || 'In-Person'}
                          </span>
                          {appointment.paymentStatus && (
                            <div className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                              {getPaymentStatusText(appointment.paymentStatus)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming appointments found</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start" onClick={() => navigate('/appointments/book')}>
                <Calendar className="w-5 h-5 mr-2" />
                Schedule New Appointment
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={refreshAppointments}>
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Appointments
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/medical-history')}>
                <User className="w-5 h-5 mr-2" />
                View Medical History
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;