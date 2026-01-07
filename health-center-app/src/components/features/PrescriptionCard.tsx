import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Download, Calendar, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Prescription } from '../../types';

interface PrescriptionCardProps {
  prescription: Prescription;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription }) => {
  const navigate = useNavigate();

  const handleDownloadPdf = async () => {
    try {
      const { data } = await api.get(`/prescriptions/${prescription.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${prescription.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download prescription PDF', err);
      alert('Unable to download PDF. Please try again later.');
    }
  };

  const handleOrderMedications = () => {
    navigate('/medications');
  };
  const isActive = new Date(prescription.expiryDate) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Prescription #{prescription.id}</h3>
              <p className="text-sm text-gray-600">
                {prescription.doctorName ? `Dr. ${prescription.doctorName}` : `Doctor ID: ${prescription.doctorId}`}
              </p>
            </div>
          </div>
          <Badge variant={isActive ? 'success' : 'error'}>
            {isActive ? 'Active' : 'Expired'}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Issued: {prescription.issuedDate}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Expires: {prescription.expiryDate}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Medications:</h4>
          <div className="space-y-2">
            {prescription.medications.map((medication) => (
              <div key={medication.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{medication.name || (medication as any).medicine || (medication as any).drug || 'Medication'}</p>
                  <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                </div>
                <span className="text-primary-600 font-semibold">KSH{medication.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <p className="text-sm text-gray-700">{prescription.instructions}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownloadPdf}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button className="flex-1" onClick={handleOrderMedications}>
            Order Medications
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default PrescriptionCard;