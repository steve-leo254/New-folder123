import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../../ui/Card';
import { useAppointments } from '../../../services/useAppointment';
import { Calendar, Clock, Video, MapPin, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentsSectionProps {
  patientId: string | number;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({ patientId }) => {
  const { appointments, isLoading } = useAppointments();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5; // Show 5 appointments per page

  // Filter appointments for this patient
  const patientAppointments = appointments.filter((apt: any) => apt.patientId === patientId);
  
  // Sort appointments by date (newest first) for better user experience
  const sortedAppointments = useMemo(() => {
    return [...patientAppointments].sort((a, b) => {
      const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
      const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
  }, [patientAppointments]);
  
  // Pagination calculations
  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const endIndex = startIndex + appointmentsPerPage;
  const currentAppointments = sortedAppointments.slice(startIndex, endIndex);
  
  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (isLoading) {
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
        <h3 className='text-lg font-semibold text-gray-900 mb-6'>
          My Appointments 
          <span className='text-sm text-gray-500 ml-2'>
            ({sortedAppointments.length} total)
          </span>
        </h3>
        
        {sortedAppointments.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className='text-gray-500'>No appointments scheduled</p>
            <p className='text-sm text-gray-400 mt-2'>Patient ID: {patientId}</p>
          </div>
        ) : (
          <>
            <div className='space-y-4'>
              {currentAppointments.map((appointment: any) => (
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
                      <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                        <div className='flex items-center space-x-1'>
                          {getStatusIcon(appointment.status)}
                          <span className='capitalize'>{appointment.status}</span>
                        </div>
                      </div>
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
                      <div className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                        {getPaymentStatusText(appointment.paymentStatus)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-200'>
                <div className='text-sm text-gray-500'>
                  Showing {startIndex + 1} to {Math.min(endIndex, sortedAppointments.length)} of {sortedAppointments.length} appointments
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className='p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                  
                  <div className='flex items-center space-x-1'>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className='p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
};
