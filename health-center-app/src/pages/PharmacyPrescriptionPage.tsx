import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePrescription } from '../services/usePrescription';
import { formatCurrency } from '../services/formatCurrency';

const PharmacyPrescriptionPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'fulfilled' | 'expired'>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { prescriptions, isLoading, fetchPrescriptions, updatePrescription } = usePrescription();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.id.toString().includes(searchTerm) ||
      prescription.patientId.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleFulfillPrescription = async (prescriptionId: number) => {
    setIsProcessing(true);
    try {
      await updatePrescription(prescriptionId, { status: 'fulfilled' });
      setSelectedPrescription(null);
    } catch (err) {
      console.error('Error fulfilling prescription:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'fulfilled':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'expired':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const calculatePrescriptionTotal = (prescription: any) => {
    return prescription.medications?.reduce((sum: number, med: any) => sum + (med.price || 0), 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 flex items-center justify-center">
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Prescriptions</h1>
        <p className="text-gray-600">Manage and fulfill patient prescriptions</p>
      </motion.div>

      {/* Search and Filter */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="pharmacy-prescription-search"
              name="pharmacy-prescription-search"
              placeholder="Search by prescription ID or patient ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </Card>

      {/* Prescriptions Grid */}
      {filteredPrescriptions.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
          <p className="text-gray-600">
            {prescriptions.length === 0 ? 'No prescriptions available yet.' : 'Try adjusting your search or filter criteria.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredPrescriptions.map((prescription) => (
            <motion.div
              key={prescription.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Prescription #{prescription.id}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Patient ID: {prescription.patientId} | Doctor ID: {prescription.doctorId}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(prescription.status)}`}>
                    {getStatusIcon(prescription.status)}
                    <span className="text-sm font-medium capitalize">{prescription.status}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Issued Date</p>
                    <p className="font-medium text-gray-900">{prescription.issuedDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expiry Date</p>
                    <p className="font-medium text-gray-900">{prescription.expiryDate}</p>
                  </div>
                </div>

                {/* Instructions */}
                {prescription.instructions && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Instructions:</strong> {prescription.instructions}
                    </p>
                  </div>
                )}

                {/* Medications */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Medications</h4>
                  <div className="space-y-2">
                    {prescription.medications?.map((med: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{med.name}</p>
                          <p className="text-sm text-gray-600">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">{formatCurrency(med.price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-xl font-bold text-primary-600">
                      {formatCurrency(calculatePrescriptionTotal(prescription))}
                    </p>
                  </div>

                  {prescription.status === 'active' && (
                    <Button
                      onClick={() => setSelectedPrescription(prescription)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Fulfilled
                    </Button>
                  )}

                  {prescription.status === 'fulfilled' && (
                    <div className="text-green-600 font-medium flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Fulfilled
                    </div>
                  )}

                  {prescription.status === 'expired' && (
                    <div className="text-red-600 font-medium flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Expired
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Mark Prescription as Fulfilled?
            </h2>
            <p className="text-gray-600 mb-6">
              Prescription #{selectedPrescription.id} will be marked as fulfilled and the patient will be notified.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedPrescription(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleFulfillPrescription(selectedPrescription.id)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPrescriptionPage;
