import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Activity,
  X,
  TestTube,
  Heart,
  Droplet,
  Zap,
  Eye,
  ChevronRight,
  Plus,
  Printer,
  Share2,
  MapPin,
  Home,
  Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LabTest {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  turnaroundTime: string;
  sampleType: string;
  fastingRequired: boolean;
  homeCollection: boolean;
  popular: boolean;
}

interface LabResult {
  id: string;
  patientName: string;
  testType: string;
  testName: string;
  date: string;
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  value?: string;
  unit?: string;
  normalRange?: string;
  doctorName: string;
  notes?: string;
}

interface LabTestPageProps {
  patientId?: string;
  patientName?: string;
}

export const LabTestPage = ({
  patientId = 'patient-1',
  patientName = 'John Doe',
}: LabTestPageProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'book' | 'results' | 'history'>('book');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    collectionType: 'lab' as 'lab' | 'home',
    address: '',
    notes: '',
  });

  // Lab Tests Catalog
  const [labTests] = useState<LabTest[]>([
    {
      id: 'test-1',
      name: 'Complete Blood Count (CBC)',
      category: 'Blood Test',
      description:
        'Measures various components of blood including red cells, white cells, and platelets',
      price: 25,
      turnaroundTime: '24 hours',
      sampleType: 'Blood',
      fastingRequired: false,
      homeCollection: true,
      popular: true,
    },
    {
      id: 'test-2',
      name: 'Lipid Panel',
      category: 'Blood Test',
      description: 'Measures cholesterol levels including HDL, LDL, and triglycerides',
      price: 35,
      turnaroundTime: '24 hours',
      sampleType: 'Blood',
      fastingRequired: true,
      homeCollection: true,
      popular: true,
    },
    {
      id: 'test-3',
      name: 'Comprehensive Metabolic Panel',
      category: 'Metabolic',
      description: 'Measures glucose, electrolytes, kidney and liver function',
      price: 45,
      turnaroundTime: '24-48 hours',
      sampleType: 'Blood',
      fastingRequired: true,
      homeCollection: true,
      popular: true,
    },
    {
      id: 'test-4',
      name: 'Thyroid Panel (TSH, T3, T4)',
      category: 'Hormones',
      description: 'Evaluates thyroid gland function',
      price: 55,
      turnaroundTime: '24-48 hours',
      sampleType: 'Blood',
      fastingRequired: false,
      homeCollection: true,
      popular: true,
    },
    {
      id: 'test-5',
      name: 'Hemoglobin A1C',
      category: 'Diabetes',
      description: 'Measures average blood sugar levels over the past 2-3 months',
      price: 30,
      turnaroundTime: '24 hours',
      sampleType: 'Blood',
      fastingRequired: false,
      homeCollection: true,
      popular: true,
    },
    {
      id: 'test-6',
      name: 'Urinalysis',
      category: 'Urine',
      description: 'Analyzes urine for signs of disease or infection',
      price: 15,
      turnaroundTime: '24 hours',
      sampleType: 'Urine',
      fastingRequired: false,
      homeCollection: true,
      popular: false,
    },
    {
      id: 'test-7',
      name: 'Vitamin D',
      category: 'Vitamins',
      description: 'Measures vitamin D levels in the blood',
      price: 40,
      turnaroundTime: '24-48 hours',
      sampleType: 'Blood',
      fastingRequired: false,
      homeCollection: true,
      popular: true,
    },
    {
      id: 'test-8',
      name: 'Iron Studies',
      category: 'Blood Test',
      description: 'Measures iron levels, ferritin, and transferrin',
      price: 45,
      turnaroundTime: '24-48 hours',
      sampleType: 'Blood',
      fastingRequired: true,
      homeCollection: true,
      popular: false,
    },
    {
      id: 'test-9',
      name: 'Liver Function Test',
      category: 'Organ Function',
      description: 'Evaluates liver health including ALT, AST, bilirubin',
      price: 35,
      turnaroundTime: '24 hours',
      sampleType: 'Blood',
      fastingRequired: true,
      homeCollection: true,
      popular: false,
    },
    {
      id: 'test-10',
      name: 'Kidney Function Test',
      category: 'Organ Function',
      description: 'Measures creatinine, BUN, and GFR',
      price: 35,
      turnaroundTime: '24 hours',
      sampleType: 'Blood',
      fastingRequired: false,
      homeCollection: true,
      popular: false,
    },
    {
      id: 'test-11',
      name: 'ECG / EKG',
      category: 'Cardiac',
      description: 'Records the electrical activity of the heart',
      price: 50,
      turnaroundTime: 'Immediate',
      sampleType: 'N/A',
      fastingRequired: false,
      homeCollection: false,
      popular: true,
    },
    {
      id: 'test-12',
      name: 'X-Ray Chest',
      category: 'Imaging',
      description: 'Imaging of chest to evaluate lungs and heart',
      price: 75,
      turnaroundTime: '2-4 hours',
      sampleType: 'N/A',
      fastingRequired: false,
      homeCollection: false,
      popular: false,
    },
  ]);

  // Lab Results
  const [labResults] = useState<LabResult[]>([
    {
      id: '1',
      patientName: patientName,
      testType: 'Blood Test',
      testName: 'Complete Blood Count (CBC)',
      date: '2024-12-15',
      status: 'normal',
      value: '4.5',
      unit: 'million/uL',
      normalRange: '4.5-5.5 million/uL',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'All values within normal range',
    },
    {
      id: '2',
      patientName: patientName,
      testType: 'Blood Test',
      testName: 'Hemoglobin (Hgb)',
      date: '2024-12-15',
      status: 'abnormal',
      value: '16.2',
      unit: 'g/dL',
      normalRange: '13.5-17.5 g/dL',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'Slightly elevated - recommend follow-up',
    },
    {
      id: '3',
      patientName: patientName,
      testType: 'Metabolic Panel',
      testName: 'Glucose (Fasting)',
      date: '2024-12-10',
      status: 'critical',
      value: '145',
      unit: 'mg/dL',
      normalRange: '70-100 mg/dL',
      doctorName: 'Dr. Michael Chen',
      notes: 'Immediate medical attention required',
    },
    {
      id: '4',
      patientName: patientName,
      testType: 'Lipid Panel',
      testName: 'Total Cholesterol',
      date: '2024-12-15',
      status: 'normal',
      value: '185',
      unit: 'mg/dL',
      normalRange: '<200 mg/dL',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'Good cholesterol levels',
    },
    {
      id: '5',
      patientName: patientName,
      testType: 'ECG',
      testName: 'Electrocardiogram',
      date: '2024-12-15',
      status: 'normal',
      value: 'Normal Sinus Rhythm',
      unit: '',
      normalRange: '60-100 bpm',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'Regular heart rhythm, no arrhythmias detected',
    },
    {
      id: '6',
      patientName: patientName,
      testType: 'Blood Test',
      testName: 'White Blood Cell Count',
      date: '2024-12-18',
      status: 'pending',
      value: 'Processing',
      unit: '',
      normalRange: 'Results in 2-3 days',
      doctorName: 'Dr. Sarah Johnson',
      notes: 'Sample sent to laboratory',
    },
  ]);

  // Test history (past bookings)
  const [testHistory] = useState([
    {
      id: 'booking-1',
      tests: ['Complete Blood Count (CBC)', 'Lipid Panel'],
      date: '2024-12-15',
      time: '9:00 AM',
      collectionType: 'lab',
      status: 'completed',
      totalAmount: 60,
    },
    {
      id: 'booking-2',
      tests: ['Thyroid Panel (TSH, T3, T4)'],
      date: '2024-12-10',
      time: '10:30 AM',
      collectionType: 'home',
      status: 'completed',
      totalAmount: 55,
    },
    {
      id: 'booking-3',
      tests: ['Comprehensive Metabolic Panel', 'Hemoglobin A1C'],
      date: '2024-12-20',
      time: '8:00 AM',
      collectionType: 'lab',
      status: 'scheduled',
      totalAmount: 75,
    },
  ]);

  const categories = ['all', ...Array.from(new Set(labTests.map((t) => t.category)))];

  const filteredTests = labTests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredResults = labResults.filter((result) => {
    return (
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleTestSelection = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const getSelectedTestsTotal = () => {
    return selectedTests.reduce((total, id) => {
      const test = labTests.find((t) => t.id === id);
      return total + (test?.price || 0);
    }, 0);
  };

  const getSelectedTestsDetails = () => {
    return selectedTests.map((id) => labTests.find((t) => t.id === id)).filter(Boolean) as LabTest[];
  };

  const handleBookTests = () => {
    if (selectedTests.length === 0) return;
    setShowBookingModal(true);
  };

  const handleConfirmBooking = () => {
    // In a real app, this would send to an API
    console.log('Booking confirmed:', {
      tests: getSelectedTestsDetails(),
      ...bookingForm,
      total: getSelectedTestsTotal(),
    });
    setShowBookingModal(false);
    setSelectedTests([]);
    setBookingForm({
      date: '',
      time: '',
      collectionType: 'lab',
      address: '',
      notes: '',
    });
    // Show success message
    alert('Tests booked successfully! You will receive a confirmation email shortly.');
  };

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
      case 'completed':
        return 'text-emerald-600 bg-emerald-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4" />;
      case 'abnormal':
        return <AlertCircle className="h-4 w-4" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4 animate-spin" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Blood Test':
        return <Droplet className="h-5 w-5" />;
      case 'Cardiac':
        return <Heart className="h-5 w-5" />;
      case 'Hormones':
        return <Zap className="h-5 w-5" />;
      case 'Imaging':
        return <Eye className="h-5 w-5" />;
      default:
        return <TestTube className="h-5 w-5" />;
    }
  };

  const clearSelection = () => {
    setSelectedTests([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Tests & Results</h1>
              <p className="text-gray-600">Book lab tests and view your results in one place</p>
            </div>
            <div className="flex items-center gap-4">
              {selectedTests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 px-4 py-2 bg-blue-100 rounded-lg"
                >
                  <span className="text-blue-800 font-medium">
                    {selectedTests.length} test(s) selected
                  </span>
                  <span className="text-blue-900 font-bold">${getSelectedTestsTotal()}</span>
                  <button
                    onClick={clearSelection}
                    className="p-1 hover:bg-blue-200 rounded"
                  >
                    <X className="h-4 w-4 text-blue-600" />
                  </button>
                </motion.div>
              )}
              <button
                onClick={() => navigate('/lab-results')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Activity className="h-4 w-4 mr-2" />
                Full Results Page
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-8">
          <div className="flex border-b">
            {[
              { id: 'book', label: 'Book Tests', icon: Plus },
              { id: 'results', label: 'My Results', icon: FileText },
              { id: 'history', label: 'Test History', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'book' && (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search and Filters */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Tests
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="lab-test-search"
                        name="lab-test-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by test name..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Popular Tests */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Tests</h2>
                <div className="flex flex-wrap gap-3">
                  {labTests
                    .filter((t) => t.popular)
                    .map((test) => (
                      <button
                        key={test.id}
                        onClick={() => toggleTestSelection(test.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedTests.includes(test.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                        }`}
                      >
                        {test.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Tests Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTests.includes(test.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => toggleTestSelection(test.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`p-3 rounded-xl ${
                          selectedTests.includes(test.id)
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        {getCategoryIcon(test.category)}
                      </div>
                      <div className="flex items-center gap-2">
                        {test.homeCollection && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Home Collection
                          </span>
                        )}
                        {selectedTests.includes(test.id) && (
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-2">{test.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Sample Type</p>
                        <p className="text-sm font-medium text-gray-900">{test.sampleType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Results In</p>
                        <p className="text-sm font-medium text-gray-900">{test.turnaroundTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">${test.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {test.fastingRequired && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                            Fasting Required
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Book Tests Button */}
              {selectedTests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40"
                >
                  <button
                    onClick={handleBookTests}
                    className="px-8 py-4 bg-blue-600 text-white rounded-full font-medium shadow-lg hover:bg-blue-700 flex items-center gap-3"
                  >
                    <Calendar className="h-5 w-5" />
                    Book {selectedTests.length} Test(s) - ${getSelectedTestsTotal()}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Results Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{labResults.length}</p>
                      <p className="text-sm text-gray-600">Total Results</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {labResults.filter((r) => r.status === 'normal').length}
                      </p>
                      <p className="text-sm text-gray-600">Normal</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {labResults.filter((r) => r.status === 'abnormal').length}
                      </p>
                      <p className="text-sm text-gray-600">Abnormal</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {labResults.filter((r) => r.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="lab-results-search"
                    name="lab-results-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search results..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl shadow p-6 border-l-4 ${getStatusColor(result.status)}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(result.status)}`}
                          >
                            {getStatusIcon(result.status)}
                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">{result.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{result.testName}</h3>
                        <p className="text-sm text-gray-600">{result.testType}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        {result.value && result.status !== 'pending' && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                              {result.value}
                              {result.unit && (
                                <span className="text-sm text-gray-500 ml-1">{result.unit}</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Normal: {result.normalRange}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                            <Download className="h-5 w-5 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Print">
                            <Printer className="h-5 w-5 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Share">
                            <Share2 className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {result.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Stethoscope className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {result.doctorName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{result.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredResults.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {testHistory.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {booking.time}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {booking.tests.map((test, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {test}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {booking.collectionType === 'home' ? (
                            <>
                              <Home className="h-4 w-4" />
                              Home Collection
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4" />
                              Lab Visit
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">${booking.totalAmount}</p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>

                        {booking.status === 'completed' && (
                          <button
                            onClick={() => setActiveTab('results')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
                          >
                            View Results
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        )}

                        {booking.status === 'scheduled' && (
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                            Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {testHistory.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Test History</h3>
                  <p className="text-gray-600 mb-6">You haven't booked any tests yet</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book Your First Test
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowBookingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Book Lab Tests</h2>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Selected Tests Summary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Selected Tests ({selectedTests.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getSelectedTestsDetails().map((test) => (
                        <div
                          key={test.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{test.name}</p>
                            <p className="text-sm text-gray-500">{test.turnaroundTime}</p>
                          </div>
                          <p className="font-bold text-gray-900">${test.price}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${getSelectedTestsTotal()}
                      </span>
                    </div>
                  </div>

                  {/* Collection Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Collection Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          setBookingForm((prev) => ({ ...prev, collectionType: 'lab' }))
                        }
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          bookingForm.collectionType === 'lab'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MapPin
                          className={`h-6 w-6 ${
                            bookingForm.collectionType === 'lab'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <span className="font-medium">Visit Lab</span>
                        <span className="text-xs text-gray-500">Free</span>
                      </button>
                      <button
                        onClick={() =>
                          setBookingForm((prev) => ({ ...prev, collectionType: 'home' }))
                        }
                        className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                          bookingForm.collectionType === 'home'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Home
                          className={`h-6 w-6 ${
                            bookingForm.collectionType === 'home'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <span className="font-medium">Home Collection</span>
                        <span className="text-xs text-gray-500">+$10</span>
                      </button>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, date: e.target.value }))
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <select
                        value={bookingForm.time}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, time: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select time</option>
                        <option value="7:00 AM">7:00 AM</option>
                        <option value="8:00 AM">8:00 AM</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Address (for home collection) */}
                  {bookingForm.collectionType === 'home' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Collection Address
                      </label>
                      <textarea
                        value={bookingForm.address}
                        onChange={(e) =>
                          setBookingForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        placeholder="Enter your full address"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Special Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Notes (Optional)
                    </label>
                    <textarea
                      value={bookingForm.notes}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Any special instructions or medical conditions..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Fasting Requirements */}
                  {getSelectedTestsDetails().some((t) => t.fastingRequired) && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Fasting Required</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Some of your selected tests require 8-12 hours of fasting. Please do not
                            eat or drink anything except water before your test.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex gap-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={!bookingForm.date || !bookingForm.time}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Booking - $
                    {getSelectedTestsTotal() + (bookingForm.collectionType === 'home' ? 10 : 0)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LabTestPage;