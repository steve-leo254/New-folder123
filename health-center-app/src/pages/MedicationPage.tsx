import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Pill } from 'lucide-react';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MedicationCard from '../components/features/MedicationCard';
import { Medication } from '../types';
import { useMedications } from '../services/useMedication';

const MedicationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPrescriptionOnly, setShowPrescriptionOnly] = useState(false);

  // Fetch real medication data from backend
  const { medications: backendMedications, isLoading, fetchMedications, error: medicationsError } = useMedications();

  // Load medications on component mount
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Convert backend medications to Medication type format
  const medications: Medication[] = useMemo(
    () =>
      backendMedications.map((med) => ({
        id: med.id.toString(),
        name: med.name || 'Unknown Medication',
        dosage: med.dosage || 'N/A',
        frequency: 'As directed',  // Default value - can be customized per medication
        duration: '30 days',        // Default value - can be customized per medication
        price: typeof med.price === 'string' ? parseFloat(med.price) : (med.price || 0),
        description: med.description || 'Professional medication',
        category: med.category || 'Other',
        inStock: med.inStock !== false && med.stock > 0,
        prescriptionRequired: med.prescriptionRequired || false,
        image: med.image || undefined,  // Add image from backend
      })),
    [backendMedications]
  );

  // Get unique categories from medications
  const categories = useMemo(
    () => ['all', ...new Set(medications.map(m => m.category))],
    [medications]
  );

  // Filter medications based on search, category, and prescription requirement
  const filteredMedications = useMemo(
    () =>
      medications.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             med.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;
        const matchesPrescription = !showPrescriptionOnly || med.prescriptionRequired;
        return matchesSearch && matchesCategory && matchesPrescription;
      }),
    [medications, searchTerm, selectedCategory, showPrescriptionOnly]
  );

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

      {medicationsError && (
        <Card className="p-6 mb-6 bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">
            <strong>Unable to load medications:</strong> {medicationsError}. 
            {medicationsError.includes('404') && ' The medications service is currently unavailable. Please try again later.'}
          </p>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-12 flex items-center justify-center">
          <LoadingSpinner />
        </Card>
      ) : filteredMedications.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((medication) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
          <p className="text-gray-600">
            {medicationsError 
              ? 'The medications service is temporarily unavailable.' 
              : 'Try adjusting your search or filter criteria'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicationPage;