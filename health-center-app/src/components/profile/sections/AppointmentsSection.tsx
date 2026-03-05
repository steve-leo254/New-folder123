import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../ui/Card';
import { useAppointments } from '../../../services/useAppointment';
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../../ui/Badge';

interface AppointmentsSectionProps {
  patientId: string | number;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({ patientId }) => {
  const { appointments, loading } = useAppointments();

  // Filter appointments for this patient
  const patientAppointments = appointments.filter((apt: any) => apt.patientId === patientId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <motion.div
        key='appointments'
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className='space-y-6'
      >
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-6'>My Appointments</h3>
          <div className='text-center py-8'>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className='text-gray-500 mt-2'>Loading appointments...</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key='appointments'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='space-y-6'
    >
      <Card className='p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-6'>My Appointments</h3>
        
        {patientAppointments.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className='text-gray-500'>No appointments scheduled</p>
            <p className='text-sm text-gray-400 mt-2'>Patient ID: {patientId}</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {patientAppointments.map((appointment: any) => (
              <div key={appointment.id} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3 mb-2'>
                      <div className='flex items-center space-x-2'>
                        {getTypeIcon(appointment.type)}
                        <span className='text-sm font-medium text-gray-900 capitalize'>
                          {appointment.type} Appointment
                        </span>
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>
                        <div className='flex items-center space-x-1'>
                          {getStatusIcon(appointment.status)}
                          <span className='capitalize'>{appointment.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time}</span>
                      </div>
                      {appointment.doctorName && (
                        <div className='text-sm text-gray-600'>
                          <span className='font-medium'>Doctor:</span> {appointment.doctorName}
                        </div>
                      )}
                      {appointment.notes && (
                        <div className='text-sm text-gray-600'>
                          <span className='font-medium'>Notes:</span> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appointment.paymentStatus && (
                    <div className='ml-4'>
                      <Badge variant={appointment.paymentStatus === 'paid' ? 'success' : 'warning'}>
                        {appointment.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
