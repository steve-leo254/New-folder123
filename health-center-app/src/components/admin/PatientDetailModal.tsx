import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Heart,
  Droplet,
  Activity,
  Shield,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react';
import { PatientRecord } from '../../services/useAdminPatients';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface PatientDetailModalProps {
  patient: PatientRecord;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (patient: PatientRecord) => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'insurance' | 'emergency'>('overview');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={patient.profile_picture || '/images/default-avatar.png'}
                    alt={patient.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{patient.full_name}</h2>
                    <p className="text-sm text-gray-500">Member ID: {patient.member_id}</p>
                    <div className="mt-1">{getStatusBadge(patient.status)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusChange(patient)}
                    className={`flex items-center gap-1 ${
                      patient.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                    }`}
                  >
                    {patient.status === 'active' ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {patient.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'medical', label: 'Medical Info', icon: Heart },
                  { id: 'insurance', label: 'Insurance', icon: CreditCard },
                  { id: 'emergency', label: 'Emergency', icon: Shield },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-h-96 overflow-y-auto">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Full Name</span>
                          <span className="text-sm font-medium">{patient.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date of Birth</span>
                          <span className="text-sm font-medium">
                            {patient.date_of_birth} ({calculateAge(patient.date_of_birth)} years)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gender</span>
                          <span className="text-sm font-medium capitalize">{patient.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Member ID</span>
                          <span className="text-sm font-medium">{patient.member_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Registration Date</span>
                          <span className="text-sm font-medium">
                            {new Date(patient.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email</span>
                          <span className="text-sm font-medium">{patient.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone</span>
                          <span className="text-sm font-medium">{patient.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Address</span>
                          <span className="text-sm font-medium text-right">
                            {patient.address}<br />
                            {patient.city}, {patient.state} {patient.zip_code}<br />
                            {patient.country}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Notifications Preferences
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${patient.email_notifications ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Email Notifications</span>
                        {patient.email_notifications && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className={`w-4 h-4 ${patient.sms_notifications ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">SMS Notifications</span>
                        {patient.sms_notifications && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${patient.appointment_reminders ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Appointment Reminders</span>
                        {patient.appointment_reminders && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${patient.lab_results_notifications ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">Lab Results</span>
                        {patient.lab_results_notifications && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Medical Info Tab */}
              {activeTab === 'medical' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-red-500" />
                        Blood Type
                      </h3>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          {patient.blood_type || 'N/A'}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Physical Stats
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Height</span>
                          <span className="text-sm font-medium">{patient.height || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Weight</span>
                          <span className="text-sm font-medium">{patient.weight || 'N/A'}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Health Summary
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Conditions</span>
                          <span className="text-sm font-medium">{patient.conditions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Medications</span>
                          <span className="text-sm font-medium">{patient.medications.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Allergies</span>
                          <span className="text-sm font-medium">{patient.allergies.length}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Conditions</h3>
                      {patient.conditions.length > 0 ? (
                        <ul className="space-y-2">
                          {patient.conditions.map((condition, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">{condition}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No medical conditions recorded</p>
                      )}
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h3>
                      {patient.medications.length > 0 ? (
                        <ul className="space-y-2">
                          {patient.medications.map((medication, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">{medication}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No current medications</p>
                      )}
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
                    {patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="error" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No known allergies</p>
                    )}
                  </Card>
                </div>
              )}

              {/* Insurance Tab */}
              {activeTab === 'insurance' && (
                <div className="space-y-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-500" />
                      Insurance Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Provider</span>
                          <span className="text-sm font-medium">{patient.insurance_provider || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Policy Number</span>
                          <span className="text-sm font-medium">{patient.insurance_policy_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Group Number</span>
                          <span className="text-sm font-medium">{patient.insurance_group_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Insurance Type</span>
                          <span className="text-sm font-medium capitalize">{patient.insurance_type}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Policy Holder</span>
                          <span className="text-sm font-medium">{patient.insurance_holder_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Quarterly Limit</span>
                          <span className="text-sm font-medium">
                            ${patient.quarterly_limit?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Quarterly Used</span>
                          <span className="text-sm font-medium">
                            ${patient.quarterly_used?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Coverage Period</span>
                          <span className="text-sm font-medium">
                            {patient.coverage_start_date && patient.coverage_end_date
                              ? `${new Date(patient.coverage_start_date).toLocaleDateString()} - ${new Date(patient.coverage_end_date).toLocaleDateString()}`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {patient.quarterly_limit > 0 && (
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Usage</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Quarterly Usage</span>
                          <span className="font-medium">
                            ${patient.quarterly_used?.toLocaleString() || '0'} / ${patient.quarterly_limit?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(((patient.quarterly_used || 0) / patient.quarterly_limit) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {Math.round(((patient.quarterly_used || 0) / patient.quarterly_limit) * 100)}% used
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Emergency Contact Tab */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      Emergency Contact
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Contact Name</span>
                            <span className="text-sm font-medium">{patient.emergency_contact_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Relationship</span>
                            <span className="text-sm font-medium capitalize">{patient.emergency_contact_relation || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Phone Number</span>
                            <span className="text-sm font-medium">{patient.emergency_contact_phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                      <div>
                        <h4 className="font-semibold text-red-800">Emergency Information</h4>
                        <p className="text-sm text-red-600 mt-1">
                          This contact will be notified in case of medical emergency. Please ensure this information is always up to date.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(patient.updated_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Record
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PatientDetailModal;
