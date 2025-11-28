import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Star, Pill } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MedicationCard from '../components/features/MedicationCard';
import { Medication } from '../types';

const MedicationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPrescriptionOnly, setShowPrescriptionOnly] = useState(false);

  const medications: Medication[] = [
    {
      id: '1',
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3x daily',
      duration: '7 days',
      price: 25,
      description: 'Broad-spectrum antibiotic used to treat bacterial infections',
      category: 'Antibiotics',
      inStock: true,
      prescriptionRequired: true
    },
    {
      id: '2',
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'as needed',
      duration: '30 days',
      price: 15,
      description: 'Nonsteroidal anti-inflammatory drug for pain relief',
      category: 'Pain Relief',
      inStock: true,
      prescriptionRequired: false
    },
    {
      id: '3',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'daily',
      duration: '90 days',
      price: 20,
      description: 'Essential vitamin for bone health and immune function',
      category: 'Vitamins',
      inStock: true,
      prescriptionRequired: false
    },
    {
      id: '4',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'once daily',
      duration: '30 days',
      price: 30,
      description: 'ACE inhibitor used to treat high blood pressure',
      category: 'Heart Health',
      inStock: false,
      prescriptionRequired: true
    }
  ];

  const categories = ['all', 'Antibiotics', 'Pain Relief', 'Vitamins', 'Heart Health'];

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
    const matchesPrescription = !showPrescriptionOnly || med.prescriptionRequired;
    return matchesSearch && matchesCategory && matchesPrescription;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medications</h1>
        <p className="text-gray-600">Browse and order your medications online</p>
      </motion.div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medications..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPrescriptionOnly}
              onChange={(e) => setShowPrescriptionOnly(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Prescription only</span>
          </label>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map((medication) => (
          <MedicationCard key={medication.id} medication={medication} />
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default MedicationPage;