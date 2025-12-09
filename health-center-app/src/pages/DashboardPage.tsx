import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Pill, 
  FileText, 
  Video, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import { Prescription } from '../types';
import { useAppointments } from '../services/useAppointment';
import { useAuth } from '../services/AuthContext';
import { jwtDecode } from 'jwt-decode';


interface JwtPayload {
  sub: string;
  id: number;
  role: string;
}


const DashboardPage: React.FC = () => {
  const { token } = useAuth();
  const { appointments } = useAppointments();
  const [userName, setUserName] = useState('User');


  // Extract user name from token
  useEffect(() => {
    if (token) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        const firstName = decoded.sub.split(' ')[0];
        setUserName(firstName);
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }
  }, [token]);


  // Get upcoming appointments (next 2)
  const upcomingAppointments = useMemo(() => {
    console.log('Dashboard appointments:', appointments);
    const filtered = appointments.filter(apt => apt.status === 'scheduled');
    console.log('Filtered scheduled appointments:', filtered);
    return filtered.slice(0, 2);
  }, [appointments]);


  // Calculate real statistics from appointments data
  const stats = useMemo(() => {
    const upcomingCount = appointments.filter(apt => apt.status === 'scheduled').length;
    const videoConsultationsCount = appointments.filter(apt => apt.status === 'scheduled' && apt.type === 'video').length;
    
    // For now, prescriptions and medications would come from their respective services
    // These would be replaced with real API calls when those services are implemented
    const activePrescriptionsCount = 0; // Would come from prescriptions API
    const medicationsToTakeCount = 0; // Would come from medications API
    
    return [
      { 
        label: 'Upcoming Appointments', 
        value: upcomingCount.toString(), 
        icon: Calendar, 
        color: 'bg-blue-500' 
      },
      { 
        label: 'Active Prescriptions', 
        value: activePrescriptionsCount.toString(), 
        icon: FileText, 
        color: 'bg-green-500' 
      },
      { 
        label: 'Medications to Take', 
        value: medicationsToTakeCount.toString(), 
        icon: Pill, 
        color: 'bg-purple-500' 
      },
      { 
        label: 'Video Consultations', 
        value: videoConsultationsCount.toString(), 
        icon: Video, 
        color: 'bg-orange-500' 
      }
    ];
  }, [appointments]);


  // Mock data for prescriptions and reminders (would come from backend)
  const recentPrescriptions: Prescription[] = [
    {
      id: '1',
      patientId: '1',
      doctorId: '1',
      medications: [],
      issuedDate: '2024-01-10',
      expiryDate: '2024-04-10',
      instructions: 'Take after meals'
    }
  ];


  const medicationReminders = [
    { name: 'Amoxicillin', time: '8:00 AM', dose: '500mg' },
    { name: 'Vitamin D', time: '12:00 PM', dose: '1000 IU' },
    { name: 'Ibuprofen', time: '6:00 PM', dose: '200mg' }
  ];


  const healthMetrics = [
    { label: 'Blood Pressure', value: '120/80', status: 'normal', icon: TrendingUp },
    { label: 'Heart Rate', value: '72 bpm', status: 'normal', icon: TrendingUp },
    { label: 'Blood Sugar', value: '95 mg/dL', status: 'normal', icon: TrendingUp }
  ];


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
        <p className="text-gray-600">Here's your health overview for today</p>
      </motion.div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>


      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      appointment.type === 'video' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {appointment.type === 'video' ? 
                        <Video className="w-5 h-5 text-blue-600" /> :
                        <Calendar className="w-5 h-5 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'Appointment'}
                      </p>
                      <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                      <p className="text-xs text-gray-500 capitalize">{appointment.type} consultation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.paymentStatus}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <p className="text-sm text-gray-400 mt-2">Schedule your first appointment to get started</p>
                </div>
              )}
            </div>
          </Card>


          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {healthMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                    <span className="text-xs text-green-600 flex items-center justify-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {metric.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>


        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Medication Reminders</h2>
            <div className="space-y-3">
              {medicationReminders.map((med, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-600">{med.dose}</p>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{med.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>


          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Prescriptions</h2>
            <div className="space-y-3">
              {recentPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">Dr. Smith</p>
                  <p className="text-sm text-gray-600">Issued: {prescription.issuedDate}</p>
                  <p className="text-sm text-gray-500">{prescription.instructions}</p>
                </div>
              ))}
            </div>
          </Card>


          <Card className="p-6 bg-yellow-50 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Health Tip</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Remember to drink at least 8 glasses of water daily to stay hydrated and maintain optimal health.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default DashboardPage;