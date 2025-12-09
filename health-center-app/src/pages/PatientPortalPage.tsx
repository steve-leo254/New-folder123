import { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Download, 
  FileText, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  MapPin,
  FilterX,
  Stethoscope,
  Heart,
  Shield,
  Award,
  Pill,
  Video,
  Users,
  Zap,
  Camera,
  MessageSquare,
  Bell,
  Settings,
  ChevronRight,
  Home,
  Clipboard,
  Clock,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider: string;
  memberId: string;
  avatar: string;
  lastVisit: string;
  nextAppointment: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  status: 'active' | 'inactive';
  registrationDate: string;
}

interface LabResult {
  id: string;
  testName: string;
  testType: string;
  date: string;
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  value?: string;
  unit?: string;
  normalRange?: string;
  doctorName: string;
  notes?: string;
}

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  status: 'active' | 'expired' | 'filled';
  refillAvailable: boolean;
  pharmacy: string;
  lastFilled: string;
}

interface PatientPortalProps {
  patientId?: string;
}

export const PatientPortalPage = ({ patientId }: PatientPortalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lab-results' | 'prescriptions' | 'appointments' | 'profile'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Mock patient data
  const [patient] = useState<Patient>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234 567 8900',
    dateOfBirth: '1985-03-15',
    bloodType: 'O+',
    address: '123 Medical Avenue, Healthcare City, HC 12345',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1 234 567 8901',
    insuranceProvider: 'BlueCross Blue Shield',
    memberId: 'KH-2024-001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5e8dd733a6f5e9c4?w=400&h=400&fit=crop',
    lastVisit: '2024-12-15',
    nextAppointment: '2024-12-20',
    allergies: ['Penicillin', 'Peanuts'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Lisinopril', 'Metformin'],
    status: 'active',
    registrationDate: '2020-01-15'
  });

  // Mock lab results
  const [labResults] = useState<LabResult[]>([
    {
      id: '1',
      testName: 'Complete Blood Count (CBC)',
      testType: 'Blood Test',
      date: '2024-12-15',
      status: 'normal',
      value: '4.5',
      unit: 'million/uL',
      normalRange: '4.5-5.5 million/uL',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'All values within normal range'
    },
    {
      id: '2',
      testName: 'Hemoglobin (Hgb)',
      testType: 'Blood Test',
      date: '2024-12-15',
      status: 'abnormal',
      value: '16.2',
      unit: 'g/dL',
      normalRange: '13.5-17.5 g/dL',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'Slightly elevated - recommend follow-up'
    },
    {
      id: '3',
      testName: 'Lipid Panel',
      testType: 'Blood Test',
      date: '2024-12-10',
      status: 'normal',
      value: '185',
      unit: 'mg/dL',
      normalRange: '<200 mg/dL',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'Good cholesterol levels'
    },
    {
      id: '4',
      testName: 'Glucose (Fasting)',
      testType: 'Metabolic Panel',
      date: '2024-12-10',
      status: 'critical',
      value: '145',
      unit: 'mg/dL',
      normalRange: '70-100 mg/dL',
      doctorName: 'Dr. Michael Chen',
      notes: 'Immediate medical attention required'
    },
    {
      id: '5',
      testName: 'Electrocardiogram',
      testType: 'Cardiac Test',
      date: '2024-12-15',
      status: 'normal',
      value: 'Normal Sinus Rhythm',
      unit: '60-100 bpm',
      normalRange: '60-100 bpm',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'Regular heart rhythm, no arrhythmias detected'
    }
  ]);

  // Mock prescriptions
  const [prescriptions] = useState<Prescription[]>([
    {
      id: '1',
      medicationName: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: '7 days',
      instructions: 'Take with food, complete full course',
      prescribedBy: 'Dr. Sarah Johnson',
      prescribedDate: '2024-12-15',
      status: 'active',
      refillAvailable: false,
      pharmacy: 'Kiangombe Pharmacy',
      lastFilled: 'Never'
    },
    {
      id: '2',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take in the morning with or without food',
      prescribedBy: 'Dr. Michael Chen',
      prescribedDate: '2024-11-20',
      status: 'active',
      refillAvailable: true,
      pharmacy: 'Kiangombe Pharmacy',
      lastFilled: '2024-11-25'
    },
    {
      id: '3',
      medicationName: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '90 days',
      instructions: 'Take with meals, monitor blood sugar',
      prescribedBy: 'Dr. Michael Chen',
      prescribedDate: '2024-10-15',
      status: 'active',
      refillAvailable: true,
      pharmacy: 'Kiangombe Pharmacy',
      lastFilled: '2024-11-20'
    },
    {
      id: '4',
      medicationName: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      duration: '90 days',
      instructions: 'Take with breakfast for better absorption',
      prescribedBy: 'Dr. Emily Rodriguez',
      prescribedDate: '2024-11-15',
      status: 'expired',
      refillAvailable: false,
      pharmacy: 'Kiangombe Pharmacy',
      lastFilled: '2024-08-15'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'abnormal':
        return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'pending':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPrescriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'expired':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'filled':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const timeRanges = ['all', 'last-week', 'last-month', 'last-3-months'];

  const filteredLabResults = labResults.filter(result => {
    const matchesSearch = result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTimeRange = selectedTimeRange === 'all' || 
      (selectedTimeRange === 'last-week' && new Date(result.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (selectedTimeRange === 'last-month' && new Date(result.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (selectedTimeRange === 'last-3-months' && new Date(result.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesTimeRange;
  });

  const filteredPrescriptions = prescriptions.filter(prescription => {
    return prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen gradient-medical">
      <div className="container-medical py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="heading-1 text-secondary-900 mb-2">
                Patient Portal
              </h1>
              <p className="text-body text-secondary-600">
                Welcome back, {patient.name}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="btn-secondary text-sm flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
              </button>
              <button className="btn-secondary text-sm flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </button>
              <button className="btn-secondary text-sm flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </motion.div>

        {/* Patient Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="card-elevated overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={patient.avatar}
                    alt={patient.name}
                    className="w-20 h-20 rounded-full border-4 border-white object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="ml-6 text-white">
                  <h2 className="heading-2 mb-1">{patient.name}</h2>
                  <p className="text-sm opacity-90 mb-2">Member ID: {patient.memberId}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {patient.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {patient.phone}
                    </div>
                  </div>
                  <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      DOB: {patient.dateOfBirth}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-lg font-bold text-white">{patient.conditions.length}</div>
                <div className="text-sm text-white/80">Active Conditions</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Pill className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-lg font-bold text-white">{patient.medications.length}</div>
                <div className="text-sm text-white/80">Current Medications</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-lg font-bold text-white">{patient.nextAppointment}</div>
                <div className="text-sm text-white/80">Next Appointment</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-secondary-200">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'lab-results', label: 'Lab Results', icon: FileText },
            { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'profile', label: 'Profile', icon: User }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-700 bg-primary-50'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-compact p-6">
                <h3 className="heading-3 text-secondary-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="btn-primary w-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </button>
                  <button className="btn-secondary w-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Doctor
                  </button>
                  <button className="btn-secondary w-full flex items-center justify-center">
                    <Video className="h-4 w-4 mr-2" />
                    Video Consultation
                  </button>
                </div>
              </div>
              </div>

              <div className="card-compact p-6">
                <h3 className="heading-3 text-secondary-900 mb-4">Upcoming Appointments</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-blue-900">Dr. Sarah Johnson</h4>
                        <p className="text-sm text-blue-700">General Practitioner</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-blue-600">Dec 20, 2024</span>
                      </div>
                    </div>
                    <div className="text-sm text-blue-600">Annual Checkup</div>
                    <div className="text-sm text-blue-600">10:00 AM</div>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-emerald-900">Dr. Michael Chen</h4>
                        <p className="text-sm text-emerald-700">Cardiologist</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-emerald-600">Jan 15, 2025</span>
                      </div>
                    </div>
                    <div className="text-sm text-emerald-600">Follow-up Consultation</div>
                    <div className="text-sm text-emerald-600">2:00 PM</div>
                  </div>
                </div>
              </div>
            </div>

              <div className="card-compact p-6">
                <h3 className="heading-3 text-secondary-900 mb-4">Health Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">A+</div>
                    <div className="text-sm text-blue-600">Blood Type</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-900">120/80</div>
                    <div className="text-sm text-emerald-600">Blood Pressure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lab-results' && (
          <div>
            {/* Search and Filter */}
            <div className="card-compact p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Search Lab Results
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by test name or doctor..."
                      className="input pl-12 pr-4"
                    />
                  </div>
                </div>
                <div className="flex items-end space-x-4">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="input appearance-none"
                  >
                    {timeRanges.map(range => (
                      <option key={range} value={range}>
                        {range === 'all' ? 'All Time' : range.replace('-', ' ').replace(/\b\w/g, (match) => match.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn-secondary text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Results Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mb-2 mx-auto" />
                <div className="text-2xl font-bold text-blue-900">{filteredLabResults.length}</div>
                <div className="text-sm text-blue-700">Total Results</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-emerald-600 mb-2 mx-auto" />
                <div className="text-2xl font-bold text-emerald-900">
                  {filteredLabResults.filter(r => r.status === 'normal').length}
                </div>
                <div className="text-sm text-emerald-700">Normal</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-amber-600 mb-2 mx-auto" />
                <div className="text-2xl font-bold text-amber-900">
                  {filteredLabResults.filter(r => r.status === 'abnormal').length}
                </div>
                <div className="text-sm text-amber-700">Abnormal</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-600 mb-2 mx-auto" />
                <div className="text-2xl font-bold text-red-900">
                  {filteredLabResults.filter(r => r.status === 'critical').length}
                </div>
                <div className="text-sm text-red-700">Critical</div>
              </div>
            </div>
          </div>

          {/* Lab Results Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={`card-compact p-6 hover:shadow-medium transition-all duration-300 border-l-4 ${getStatusColor(result.status)}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status === 'pending' ? (
                            <Clock className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          <span className="ml-2">{result.status.toUpperCase()}</span>
                        </div>
                        <div className="text-sm text-secondary-500">{result.date}</div>
                      </div>
                      <button className="text-secondary-400 hover:text-secondary-600">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="heading-3 text-secondary-900 mb-2">{result.testName}</h3>
                    <p className="text-sm text-secondary-600 mb-1">{result.testType}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-secondary-500 mb-1">Result</p>
                      <div className="text-lg font-bold text-secondary-900">{result.value} {result.unit}</div>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500 mb-1">Normal Range</p>
                      <div className="text-lg font-semibold text-emerald-600">{result.normalRange}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-secondary-500 mb-1">Doctor</p>
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-primary-600 mr-2" />
                        <span className="font-medium text-secondary-900">{result.doctorName}</span>
                      </div>
                    </div>
                    <div className="text-sm text-secondary-500 mb-1">Date</p>
                      <div className="text-sm text-secondary-900">{result.date}</div>
                    </div>
                  </div>

                  {result.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-secondary-500 mb-1">Notes</p>
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">{result.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
        )}
        </motion.div>
      )}

        {activeTab === 'prescriptions' && (
          <div>
            {/* Search */}
            <div className="card-compact p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search prescriptions by medication name..."
                  className="input pl-12 pr-4"
                />
              </div>
            </div>

            {/* Prescriptions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrescriptions.map((prescription, index) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`card-compact p-6 hover:shadow-medium transition-all duration-300 border-l-4 ${getPrescriptionStatusColor(prescription.status)}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPrescriptionStatusColor(prescription.status)}`}>
                            {prescription.status === 'active' ? 'Active' : prescription.status.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-sm text-secondary-500">{prescription.prescribedDate}</div>
                      </div>
                      <button className="text-secondary-400 hover:text-secondary-600">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="heading-3 text-secondary-900 mb-2">{prescription.medicationName}</h3>
                    <p className="text-sm text-secondary-600 mb-1">Prescribed by {prescription.prescribedBy}</p>
                  </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Dosage</p>
                        <div className="text-lg font-semibold text-secondary-900">{prescription.dosage}</div>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Frequency</p>
                        <div className="text-sm font-medium text-secondary-900">{prescription.frequency}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Duration</p>
                        <div className="text-sm font-medium text-secondary-900">{prescription.duration}</div>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Pharmacy</p>
                        <div className="text-sm font-medium text-secondary-900">{prescription.pharmacy}</div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-secondary-500 mb-1">Instructions</p>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-secondary-700">{prescription.instructions}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Refill Status</p>
                        <div className="flex items-center">
                          {prescription.refillAvailable ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
                              <span className="text-sm font-medium text-emerald-700">Available for Refill</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                              <span className="text-sm font-medium text-red-700">No Refills Available</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-secondary-500">
                        Last Filled: {prescription.lastFilled}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    {prescription.refillAvailable && (
                      <button className="btn-primary text-sm flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Request Refill
                      </button>
                    )}
                    <button className="btn-secondary text-sm flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Pharmacy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
        </motion.div>
      )}

        {activeTab === 'appointments' && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Calendar className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6" />
              <h3 className="heading-2 text-secondary-900 mb-4">
                Appointments Coming Soon
              </h3>
              <p className="text-body text-secondary-600 mb-8">
                Appointment management features will be available in the next update.
              </p>
              <button className="btn-primary">
                Book New Appointment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Settings className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6" />
              <h3 className="heading-2 text-secondary-900 mb-4">
                Profile Settings Coming Soon
              </h3>
              <p className="text-body text-secondary-600 mb-8">
                Profile management features will be available in the next update.
              </p>
              <button className="btn-primary">
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};