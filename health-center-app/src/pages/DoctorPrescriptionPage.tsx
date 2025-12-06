import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePrescription } from '../services/usePrescription';
import { useMedications } from '../services/useMedication';
import { useAppointments } from '../services/useAppointment';
import { formatCurrency } from '../services/formatCurrency';

interface PrescriptionMedicineItem {
  medicationId: number;
  dosage: string;
  frequency: string;
  duration: string;
  medicationName?: string;
  price?: number;
}

const DoctorPrescriptionPage: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [medicines, setMedicines] = useState<PrescriptionMedicineItem[]>([]);
  const [instructions, setInstructions] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { medications, isLoading: medicationsLoading } = useMedications();
  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { createPrescription, isLoading: prescriptionLoading } = usePrescription();

  // Load data on mount
  useEffect(() => {
    // Fetch medications and appointments
  }, []);

  // Get unique patients from appointments
  const patients = useMemo(() => {
    const uniquePatients = new Map();
    appointments.forEach((apt: any) => {
      if (!uniquePatients.has(apt.patientId)) {
        uniquePatients.set(apt.patientId, {
          id: apt.patientId,
          name: apt.patientName || `Patient ${apt.patientId}`,
        });
      }
    });
    return Array.from(uniquePatients.values());
  }, [appointments]);

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        medicationId: 0,
        dosage: '',
        frequency: '',
        duration: '',
      },
    ]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof PrescriptionMedicineItem, value: string | number) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };

    // If medication ID changed, fetch medication details
    if (field === 'medicationId') {
      const med = medications.find((m: any) => m.id === value);
      if (med) {
        updated[index].medicationName = med.name;
        updated[index].price = med.price;
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
      // Get current user ID (doctor ID) from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const doctorId = user?.id;

      if (!doctorId) {
        setErrorMessage('Unable to identify current doctor');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        patientId: selectedPatientId,
        doctorId,
        medications: medicines.map(med => ({
          medicationId: med.medicationId,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
        })),
        instructions,
        expiryDate,
      };

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

  if (medicationsLoading || appointmentsLoading) {
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
          <select
            value={selectedPatientId || ''}
            onChange={(e) => setSelectedPatientId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">-- Select a patient --</option>
            {patients.map((patient: any) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
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
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Medicine
            </Button>
          </div>

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
                        value={medicine.medicationId}
                        onChange={(e) => updateMedicine(index, 'medicationId', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">-- Select medication --</option>
                        {medications.map((med: any) => (
                          <option key={med.id} value={med.id}>
                            {med.name} - {formatCurrency(med.price || 0)}
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
