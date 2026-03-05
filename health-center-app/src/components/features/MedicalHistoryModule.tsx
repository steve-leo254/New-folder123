import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Clock, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useMedicalHistory } from '../services/useMedicalHistory';

interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'diagnosis' | 'prescription' | 'lab_result' | 'vaccination';
  title: string;
  description: string;
  doctor: string;
  notes?: string;
  attachments?: string[];
}

const MedicalHistoryModule: React.FC<{ patientId?: string }> = ({ patientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { 
    records, 
    loading, 
    error, 
    fetchMedicalHistory, 
    addMedicalRecord,
    updateMedicalRecord 
  } = useMedicalHistory(patientId);

  useEffect(() => {
    if (patientId) {
      fetchMedicalHistory(patientId);
    }
  }, [patientId, fetchMedicalHistory]);

  // Filter records based on search and type
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'diagnosis': return 'bg-red-100 text-red-800';
      case 'prescription': return 'bg-green-100 text-green-800';
      case 'lab_result': return 'bg-yellow-100 text-yellow-800';
      case 'vaccination': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <FileText className="w-4 h-4" />;
      case 'diagnosis': return <AlertCircle className="w-4 h-4" />;
      case 'prescription': return <FileText className="w-4 h-4" />;
      case 'lab_result': return <FileText className="w-4 h-4" />;
      case 'vaccination': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
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
        <p className="text-gray-600">View and manage patient medical records</p>
      </motion.div>

      {/* Search and Filter */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medical records..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="consultation">Consultations</option>
            <option value="diagnosis">Diagnoses</option>
            <option value="prescription">Prescriptions</option>
            <option value="lab_result">Lab Results</option>
            <option value="vaccination">Vaccinations</option>
          </select>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Record
          </Button>
        </div>
      </Card>

      {/* Medical Records List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
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
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getTypeColor(record.type)}`}>
                        {getTypeIcon(record.type)}
                        {record.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <h3 className="font-semibold text-gray-900">{record.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-2">{record.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Dr. {record.doctor}
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{record.notes}</p>
                      </div>
                    )}
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                        <div className="flex gap-2">
                          {record.attachments.map((attachment, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {attachment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No medical records found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start by adding a medical record'
              }
            </p>
          </div>
        )}
      </Card>

      {/* Add Medical Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Add Medical Record</h2>
            {/* Add form fields here */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button>
                Add Record
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MedicalHistoryModule;
