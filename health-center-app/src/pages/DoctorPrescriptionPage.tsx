import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePrescription } from '../services/usePrescription';
import { useMedications } from '../services/useMedication';
import { formatCurrency } from '../services/formatCurrency';
import { apiService } from '../services/api';
import { useAuth } from '../services/AuthContext';

interface PrescriptionMedicineItem {
  medicationId: number | null;
  dosage: string;
  frequency: string;
  duration: string;
  medicationName?: string;
  price?: number;
}

const DoctorPrescriptionPage: React.FC = () => {
  const { user } = useAuth();  // Get current user from AuthContext
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [medicines, setMedicines] = useState<PrescriptionMedicineItem[]>([]);
  const [instructions, setInstructions] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);

  const { medications, isLoading: medicationsLoading, fetchMedications } = useMedications();
  const { createPrescription, isLoading: prescriptionLoading } = usePrescription();

  // Fetch medications on component mount
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Fetch patients from users API
  useEffect(() => {
    const fetchPatients = async () => {
      setPatientsLoading(true);
      setPatientError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setPatientError('Please log in to access patients.');
        setPatientsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching patients from users API...');
        console.log('Using token:', token.substring(0, 20) + '...');
        const users = await apiService.getPatients();
        console.log('All users from API:', users);
        
        // The backend now returns only patients, so no filtering needed
        const patientUsers = users.map((user: any) => ({
          id: user.id,
          name: user.full_name || `Patient ${user.id}`,
          email: user.email,
        }));
        
        console.log('Processed patients:', patientUsers);
        setPatients(patientUsers);
        
        if (patientUsers.length === 0) {
          setPatientError('No patients found. Make sure there are users with patient role in the database.');
        }
      } catch (error: any) {
        console.error('Failed to fetch patients:', error);
        if (error.response?.status === 401) {
          setPatientError('Authentication expired. Please log in again.');
        } else {
          setPatientError('Failed to load patients. Please try refreshing the page.');
        }
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Debug medications
  useEffect(() => {
    console.log('Available medications:', medications);
  }, [medications]);

  const addMedicine = () => {
    setMedicines((prev) => {
      // Prevent adding multiple empty rows
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const lastIsEmpty =
          !last.medicationId &&
          last.dosage.trim() === '' &&
          last.frequency.trim() === '' &&
          last.duration.trim() === '';

        if (lastIsEmpty) return prev;
      }

      return [
        ...prev,
        {
          medicationId: null,
          dosage: '',
          frequency: '',
          duration: '',
        },
      ];
    });
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof PrescriptionMedicineItem, value: string | number | null) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };

    // If medication ID changed, fetch medication details
    if (field === 'medicationId') {
      if (!value) {
        updated[index].medicationName = undefined;
        updated[index].price = undefined;
      } else {
        const med = medications.find((m: any) => Number(m.id) === Number(value));
        if (med) {
          updated[index].medicationName = med.name;
          updated[index].price = Number(med.price) || 0;
        }
      }
    }

    setMedicines(updated);
  };

  const calculateTotal = () => {
    return medicines.reduce((sum, med) => sum + (med.price || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedPatientId) {
      setErrorMessage('Please select a patient');
      return;
    }

    if (medicines.length === 0) {
      setErrorMessage('Please add at least one medication');
      return;
    }

    if (!expiryDate) {
      setErrorMessage('Please set an expiry date');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user ID (doctor ID) from AuthContext
      const doctorId = user?.id;

      if (!doctorId) {
        setErrorMessage('Unable to identify current doctor');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        patientId: selectedPatientId,
        doctorId,
        medications: medicines
          .filter(med => med.medicationId !== null)
          .map(med => ({
            medicationId: med.medicationId!,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
          })),
        instructions,
        expiryDate,
      };

      console.log('Creating prescription with payload:', payload);
      await createPrescription(payload);
      setSuccessMessage('Prescription created successfully!');

      // Reset form
      setSelectedPatientId(null);
      setMedicines([]);
      setInstructions('');
      setExpiryDate('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create prescription';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (medicationsLoading || patientsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 flex items-center justify-center">
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Write Prescription</h1>
        <p className="text-gray-600">Create and issue prescriptions to your patients</p>
      </motion.div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-sm text-green-800">{successMessage}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
          
          {patientError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">{patientError}</p>
            </div>
          )}
          
          <select
            value={selectedPatientId || ''}
            onChange={(e) => setSelectedPatientId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">-- Select a patient --</option>
            {patients.map((patient: any) => (
              <option key={patient.id} value={patient.id}>
                {patient.name || `Patient ${patient.id}`}
              </option>
            ))}
          </select>
        </Card>

        {/* Medications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Medications</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMedicine}
              disabled={medicationsLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>

          {medicationsLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Loading medications...</span>
            </div>
          )}

          {!medicationsLoading && medications.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No medications available in the database.</p>
              <p className="text-sm text-gray-400">Please add medications to the inventory first.</p>
            </div>
          )}

          {!medicationsLoading && medications.length > 0 && (
            <div className="space-y-4">
              {medicines.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No medications added yet. Click "Add Medicine" to start.</p>
              ) : (
                medicines.map((medicine, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medication
                        </label>
                        <select
                          value={medicine.medicationId ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateMedicine(index, 'medicationId', v ? parseInt(v) : null);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        >
                          <option value="">-- Select medication --</option>
                          {medications.map((med: any) => (
                            <option key={med.id} value={med.id}>
                              {med.name || `Medication ${med.id}`} - {med.category || 'General'} - {formatCurrency(Number(med.price) || 0)} 
                              {med.stock !== undefined && `(Stock: ${med.stock})`}
                              {med.dosage && ` - ${med.dosage}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 500mg"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 3x daily"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 7 days"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Medication Details */}
                    {medicine.medicationId && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Medication Details</h4>
                        {(() => {
                          const selectedMed = medications.find((med: any) => Number(med.id) === Number(medicine.medicationId));
                          if (!selectedMed) return null;
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Category:</span>
                                <span className="ml-2 text-gray-900">{selectedMed.category || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Price:</span>
                                <span className="ml-2 text-gray-900">{formatCurrency(Number(selectedMed.price) || 0)}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Stock:</span>
                                <span className={`ml-2 ${selectedMed.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {selectedMed.stock !== undefined ? `${selectedMed.stock} units` : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Dosage Form:</span>
                                <span className="ml-2 text-gray-900">{selectedMed.dosage || 'N/A'}</span>
                              </div>
                              {selectedMed.description && (
                                <div className="md:col-span-2">
                                  <span className="font-medium text-gray-600">Description:</span>
                                  <span className="ml-2 text-gray-900">{selectedMed.description}</span>
                                </div>
                              )}
                              {selectedMed.supplier && (
                                <div>
                                  <span className="font-medium text-gray-600">Supplier:</span>
                                  <span className="ml-2 text-gray-900">{selectedMed.supplier}</span>
                                </div>
                              )}
                              {selectedMed.expiryDate && (
                                <div>
                                  <span className="font-medium text-gray-600">Expiry Date:</span>
                                  <span className="ml-2 text-gray-900">{new Date(selectedMed.expiryDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedicine(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {medicines.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Estimated Total Cost:</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Instructions & Expiry */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Take with food after meals. Avoid dairy products."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || prescriptionLoading}
            className="flex items-center gap-2"
          >
            {isSubmitting || prescriptionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Prescription
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorPrescriptionPage;
