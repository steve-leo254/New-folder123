import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Ruler, Weight, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { PatientProfile } from '../../services/api/patientApi';

interface HealthSummaryCardProps {
  formData: PatientProfile;
}

export const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({ formData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Health Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <Droplet className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {formData.bloodType || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Blood Type</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Ruler className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {formData.height || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Height</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Weight className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {formData.weight || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Weight</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {formData.allergies.length}
            </div>
            <div className="text-xs text-gray-500">Allergies</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
