import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, User, Download, Filter, Search, Eye, Clock, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { usePrescription } from '../services/usePrescription';
import { useAppointments } from '../services/useAppointment';

interface MedicalRecord {
  id: string;
  type: 'prescription' | 'appointment' | 'lab_result';
  date: string;
  title: string;
  doctor?: string;
  status?: string;
  details?: string;
  medications?: Array<{ name: string; dosage: string }>;
}

const MedicalHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'prescriptions' | 'appointments' | 'lab_results'>('all');
  const [dateRange, setDateRange] = useState<'all' | '3months' | '6months' | '1year'>('all');
  
  const { prescriptions, isLoading: prescriptionsLoading } = usePrescription();
  const { appointments, isLoading: appointmentsLoading } = useAppointments();

  // Combine and format medical records
  const medicalRecords: MedicalRecord[] = React.useMemo(() => {
    const records: MedicalRecord[] = [];

    // Add prescriptions
    if (prescriptions) {
      prescriptions.forEach((prescription: any) => {
        records.push({
          id: `prescription-${prescription.id}`,
          type: 'prescription',
          date: prescription.issued_date || prescription.created_at,
          title: 'Prescription',
          doctor: prescription.doctor_name || 'Unknown Doctor',
          status: prescription.status,
          details: prescription.pharmacy_name || 'Main Pharmacy',
          medications: prescription.medications_json || []
        });
      });
    }

    // Add appointments
    if (appointments) {
      appointments.forEach((appointment) => {
        records.push({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          date: appointment.date,
          title: 'Doctor Consultation',
          doctor: appointment.doctorName || 'Unknown Doctor',
          status: appointment.status,
          details: appointment.type || 'In-Person'
        });
      });
    }

    // Sort by date (most recent first)
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [prescriptions, appointments]);

  // Filter records
  const filteredRecords = React.useMemo(() => {
    let filtered = medicalRecords;

    // Filter by type
    if (filterType !== 'all') {
      const typeMap: Record<string, string> = {
        'prescriptions': 'prescription',
        'appointments': 'appointment', 
        'lab_results': 'lab_result'
      };
      filtered = filtered.filter(record => record.type === typeMap[filterType]);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (dateRange) {
        case '3months':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case '6months':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case '1year':
          cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(record => new Date(record.date) >= cutoffDate);
    }

    return filtered;
  }, [medicalRecords, searchTerm, filterType, dateRange]);

  const isLoading = prescriptionsLoading || appointmentsLoading;

  const handleDownloadRecord = (record: MedicalRecord) => {
    // In a real app, this would generate and download a PDF
    const dataStr = JSON.stringify(record, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `medical-record-${record.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'prescription':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'lab_result':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'filled':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical History</h1>
        <p className="text-gray-600">View and download your complete medical records</p>
      </motion.div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medical records..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All Records</option>
            <option value="prescriptions">Prescriptions</option>
            <option value="appointments">Appointments</option>
            <option value="lab_results">Lab Results</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="all">All Time</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </Card>

      {/* Records List */}
      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {getRecordIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{record.title}</h3>
                        {record.status && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(record.date)}
                          </span>
                          {record.doctor && (
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              Dr. {record.doctor}
                            </span>
                          )}
                          {record.details && (
                            <span>{record.details}</span>
                          )}
                        </div>
                        
                        {record.medications && record.medications.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700 mb-1">Medications:</p>
                            <div className="flex flex-wrap gap-2">
                              {record.medications.map((med, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {med.name} {med.dosage && `(${med.dosage})`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadRecord(record)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Records Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Your medical records will appear here once you have appointments or prescriptions'}
            </p>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {medicalRecords.filter(r => r.type === 'prescription').length}
          </div>
          <div className="text-sm text-gray-600">Prescriptions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {medicalRecords.filter(r => r.type === 'appointment').length}
          </div>
          <div className="text-sm text-gray-600">Appointments</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {medicalRecords.filter(r => r.type === 'lab_result').length}
          </div>
          <div className="text-sm text-gray-600">Lab Results</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {medicalRecords.length}
          </div>
          <div className="text-sm text-gray-600">Total Records</div>
        </Card>
      </div>
    </div>
  );
};

export default MedicalHistoryPage;
