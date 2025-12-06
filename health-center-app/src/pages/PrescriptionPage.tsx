import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PrescriptionCard from '../components/features/PrescriptionCard';
import { Prescription } from '../types';
import { usePrescription } from '../services/usePrescription';

const PrescriptionPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { prescriptions: backendPrescriptions, isLoading, error, fetchPrescriptions } = usePrescription();

  // Load prescriptions on component mount
  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Convert backend prescriptions to Prescription type format
  const prescriptions: Prescription[] = backendPrescriptions.map(p => ({
    id: p.id.toString(),
    patientId: p.patientId.toString(),
    doctorId: p.doctorId.toString(),
    medications: p.medications,
    issuedDate: p.issuedDate,
    expiryDate: p.expiryDate,
    instructions: p.instructions
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescriptions</h1>
        <p className="text-gray-600">View and manage your medical prescriptions</p>
      </motion.div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-6 mb-6 bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">
            <strong>Unable to load prescriptions:</strong> {error}
          </p>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-12 flex items-center justify-center">
          <LoadingSpinner />
        </Card>
      ) : prescriptions.length > 0 ? (
        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No prescriptions found</p>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionPage;