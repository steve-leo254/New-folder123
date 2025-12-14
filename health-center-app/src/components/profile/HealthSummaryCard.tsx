import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Ruler, Weight, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { useMedicalInfo } from '../../services/useMedicalInfo';

export const HealthSummaryCard: React.FC = () => {
  const { medicalInfo, loading } = useMedicalInfo();

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Health Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-6 w-6 bg-gray-300 rounded-full mx-auto mb-1"></div>
              <div className="h-4 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
              <div className="h-3 w-16 bg-gray-300 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

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
              {medicalInfo?.bloodType || 'Not set'}
            </div>
            <div className="text-xs text-gray-500">Blood Type</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Ruler className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {medicalInfo?.height || 'Not set'}
            </div>
            <div className="text-xs text-gray-500">Height</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Weight className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {medicalInfo?.weight || 'Not set'}
            </div>
            <div className="text-xs text-gray-500">Weight</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-900">
              {medicalInfo?.allergies?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Allergies</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
