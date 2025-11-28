import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Search, Filter } from 'lucide-react';
import AppointmentForm from '../components/features/AppointmentForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Doctor, Appointment } from '../types';

const AppointmentsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');

  const doctors: Doctor[] = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialization: 'Cardiologist',
      experience: 10,
      rating: 4.8,
      avatar: '/images/doctor1.jpg',
      bio: 'Expert in heart diseases and cardiovascular health',
      availability: [],
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
      bio: 'Specialized in child healthcare and development',
      availability: [],
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
      bio: 'Skin care specialist and cosmetic dermatology expert',
      availability: [],
      consultationFee: 100
    }
  ];

  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      patientId: '1',
      doctorId: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'scheduled',
      type: 'video',
      paymentStatus: 'paid'
    },
    {
      id: '2',
      patientId: '1',
      doctorId: '2',
      date: '2024-01-20',
      time: '2:00 PM',
      status: 'scheduled',
      type: 'in-person',
      paymentStatus: 'pending'
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = filterSpecialization === 'all' || 
                                 doctor.specialization === filterSpecialization;
    return matchesSearch && matchesSpecialization;
  });

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
                <option value="Cardiologist">Cardiologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Dermatologist">Dermatologist</option>
              </select>
            </div>

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
                      alt={doctor.firstName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{doctor.experience} years experience</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-primary-600 font-semibold">${doctor.consultationFee}</span>
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
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border-l-4 border-primary-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.date}</p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {appointment.time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.type === 'video' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {appointment.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule New Appointment
              </Button>
              <Button variant="outline" className="w-full justify-start">
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