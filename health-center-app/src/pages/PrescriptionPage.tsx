import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, Calendar, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PrescriptionCard from '../components/features/PrescriptionCard';
import { Prescription } from '../types';

const PrescriptionPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const prescriptions: Prescription[] = [
    {
      id: '1',
      patientId: '1',
      doctorId: '1',
      medications: [
        { id: '1', name: 'Amoxicillin', dosage: '500mg', frequency: '3x daily', duration: '7 days', price: 25, description: 'Antibiotic', category: 'Antibiotics', inStock: true, prescriptionRequired: true },
        { id: '2', name: 'Ibuprofen', dosage: '200mg', frequency: 'as needed', duration: '30 days', price: 15, description: 'Pain reliever', category: 'Pain Relief', inStock: true, prescriptionRequired: false }
      ],
      issuedDate: '2024-01-10',
      expiryDate: '2024-04-10',
      instructions: 'Take with food after meals'
    },
    {
      id: '2',
      patientId: '1',
      doctorId: '2',
      medications: [
        { id: '3', name: 'Vitamin D', dosage: '1000 IU', frequency: 'daily', duration: '90 days', price: 20, description: 'Vitamin supplement', category: 'Vitamins', inStock: true, prescriptionRequired: false }
      ],
      issuedDate: '2024-01-05',
      expiryDate: '2024-04-05',
      instructions: 'Take with breakfast'
    }
  ];

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

      <div className="grid gap-6">
        {prescriptions.map((prescription) => (
          <PrescriptionCard key={prescription.id} prescription={prescription} />
        ))}
      </div>
    </div>
  );
};

export default PrescriptionPage;