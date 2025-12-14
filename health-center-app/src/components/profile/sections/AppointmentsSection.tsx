import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../ui/Card';

interface AppointmentsSectionProps {
  patientId: string | number;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({ patientId }) => {
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
          <p className='text-gray-500'>No appointments scheduled</p>
          <p className='text-sm text-gray-400 mt-2'>Patient ID: {patientId}</p>
        </div>
      </Card>
    </motion.div>
  );
};
