// import { useState } from 'react';
// import { 
//   Calendar, 
//   Clock, 
//   Download, 
//   FileText, 
//   Filter, 
//   Search, 
//   CheckCircle, 
//   AlertCircle, 
//   Activity, 
//   TrendingUp,
//   TrendingDown,
//   User,
//   Mail,
//   Phone,
//   MapPin,
//   FilterX,
//   Stethoscope,
//   Heart,
//   Shield,
//   Award
// } from 'lucide-react';
// import { motion } from 'framer-motion';

// interface LabResult {
//   id: string;
//   patientName: string;
//   testType: string;
//   testName: string;
//   date: string;
//   status: 'normal' | 'abnormal' | 'critical' | 'pending';
//   value?: string;
//   unit?: string;
//   normalRange?: string;
//   doctorName: string;
//   notes?: string;
// }

// interface LabResultsPageProps {
//   patientId?: string;
// }

// export const LabResultsPage = ({ patientId }: LabResultsPageProps) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedTestType, setSelectedTestType] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [selectedTimeRange, setSelectedTimeRange] = useState('all');
//   const [viewMode, setViewMode] = useState<'card' | 'detailed'>('card');

//   // Mock lab results data
//   const [labResults] = useState<LabResult[]>([
//     {
//       id: '1',
//       patientName: 'John Doe',
//       testType: 'Blood Test',
//       testName: 'Complete Blood Count (CBC)',
//       date: '2024-12-15',
//       status: 'normal',
//       value: '4.5',
//       unit: 'million/uL',
//       normalRange: '4.5-5.5 million/uL',
//       doctorName: 'Dr. Sarah Johnson',
//       notes: 'All values within normal range'
//     },
//     {
//       id: '2',
//       patientName: 'John Doe',
//       testType: 'Blood Test',
//       testName: 'Hemoglobin (Hgb)',
//       date: '2024-12-15',
//       status: 'abnormal',
//       value: '16.2',
//       unit: 'g/dL',
//       normalRange: '13.5-17.5 g/dL',
//       doctorName: 'Dr. Sarah Johnson',
//       notes: 'Slightly elevated - recommend follow-up'
//     },
//     {
//       id: '3',
//       patientName: 'John Doe',
//       testType: 'Metabolic Panel',
//       testName: 'Glucose (Fasting)',
//       date: '2024-12-10',
//       status: 'critical',
//       value: '145',
//       unit: 'mg/dL',
//       normalRange: '70-100 mg/dL',
//       doctorName: 'Dr. Michael Chen',
//       notes: 'Immediate medical attention required'
//     },
//     {
//       id: '4',
//       patientName: 'John Doe',
//       testType: 'Lipid Panel',
//       testName: 'Total Cholesterol',
//       date: '2024-12-15',
//       status: 'normal',
//       value: '185',
//       unit: 'mg/dL',
//       normalRange: '<200 mg/dL',
//       doctorName: 'Dr. Sarah Johnson',
//       notes: 'Good cholesterol levels'
//     },
//     {
//       id: '5',
//       patientName: 'John Doe',
//       testType: 'Urinalysis',
//       testName: 'Protein',
//       date: '2024-12-08',
//       status: 'normal',
//       value: 'Trace',
//       unit: '',
//       normalRange: 'Negative or Trace',
//       doctorName: 'Dr. Emily Rodriguez',
//       notes: 'No protein detected - normal result'
//     },
//     {
//       id: '6',
//       patientName: 'John Doe',
//       testType: 'X-Ray',
//       testName: 'Chest X-Ray',
//       date: '2024-12-05',
//       status: 'normal',
//       value: 'Normal',
//       unit: '',
//       normalRange: 'No abnormalities detected',
//       doctorName: 'Dr. James Wilson',
//       notes: 'Clear lungs, no signs of infection'
//     },
//     {
//       id: '7',
//       patientName: 'John Doe',
//       testType: 'ECG',
//       testName: 'Electrocardiogram',
//       date: '2024-12-15',
//       status: 'normal',
//       value: 'Normal Sinus Rhythm',
//       unit: '',
//       normalRange: '60-100 bpm',
//       doctorName: 'Dr. Sarah Johnson',
//       notes: 'Regular heart rhythm, no arrhythmias detected'
//     },
//     {
//       id: '8',
//       patientName: 'John Doe',
//       testType: 'Blood Test',
//       testName: 'White Blood Cell Count',
//       date: '2024-11-20',
//       status: 'pending',
//       value: 'Processing',
//       unit: '',
//       normalRange: 'Results in 2-3 days',
//       doctorName: 'Dr. Sarah Johnson',
//       notes: 'Sample sent to laboratory'
//     }
//   ]);

//   const testTypes = ['all', ...Array.from(new Set(labResults.map(r => r.testType)))];
//   const statusOptions = ['all', 'normal', 'abnormal', 'critical', 'pending'];
//   const timeRanges = ['all', 'last-week', 'last-month', 'last-3-months'];

//   const filteredResults = labResults.filter(result => {
//     const matchesSearch = result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          result.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          result.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesTestType = selectedTestType === 'all' || result.testType === selectedTestType;
//     const matchesStatus = selectedStatus === 'all' || result.status === selectedStatus;
    
//     return matchesSearch && matchesTestType && matchesStatus;
//   }).sort((a, b) => {
//     switch (selectedTimeRange) {
//       case 'last-week':
//         return new Date(b.date).getTime() - new Date(a.date).getTime();
//       case 'last-month':
//         return new Date(b.date).getTime() - new Date(a.date).getTime();
//       case 'last-3-months':
//         return new Date(b.date).getTime() - new Date(a.date).getTime();
//       default:
//         return 0;
//     }
//   });

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'normal':
//         return 'text-emerald-600 bg-emerald-100 border-emerald-200';
//       case 'abnormal':
//         return 'text-amber-600 bg-amber-100 border-amber-200';
//       case 'critical':
//         return 'text-red-600 bg-red-100 border-red-200';
//       case 'pending':
//         return 'text-blue-600 bg-blue-100 border-blue-200';
//       default:
//         return 'text-gray-600 bg-gray-100 border-gray-200';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'normal':
//         return <CheckCircle className="h-4 w-4" />;
//       case 'abnormal':
//         return <AlertCircle className="h-4 w-4" />;
//       case 'critical':
//         return <AlertCircle className="h-4 w-4" />;
//       case 'pending':
//         return <Clock className="h-4 w-4 animate-spin" />;
//       default:
//         return null;
//     }
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setSelectedTestType('all');
//     setSelectedStatus('all');
//     setSelectedTimeRange('all');
//   };

//   const activeFiltersCount = [
//     searchTerm !== '',
//     selectedTestType !== 'all',
//     selectedStatus !== 'all',
//     selectedTimeRange !== 'all'
//   ].filter(Boolean).length;

//   const exportResults = () => {
//     const dataStr = JSON.stringify(labResults, null, 2);
//     const blob = new Blob([dataStr], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `lab-results-${new Date().toISOString().split('T')[0]}.json`;
//     link.click();
//   };

//   return (
//     <div className="min-h-screen gradient-medical">
//       <div className="container-medical py-8">
//         {/* Header Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="mb-8"
//         >
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//             <div>
//               <h1 className="heading-1 text-secondary-900 mb-2">
//                 Lab Results & Test History
//               </h1>
//               <p className="text-body text-secondary-600">
//                 Comprehensive medical test results and diagnostic history
//               </p>
//             </div>

//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={exportResults}
//                 className="btn-secondary text-sm flex items-center"
//               >
//                 <Download className="h-4 w-4 mr-2" />
//                 Export Results
//               </button>
//               <button
//                 onClick={clearFilters}
//                 className="btn-secondary text-sm"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </motion.div>

//         {/* Search and Filters */}
//         <div className="card-elevated p-6 mb-8">
//           <div className="grid lg:grid-cols-5 gap-4">
//             {/* Search Bar */}
//             <div className="lg:col-span-2">
//               <label className="block text-sm font-medium text-secondary-700 mb-3">
//                 Search Results
//               </label>
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search by test name, type, or doctor..."
//                   className="input pl-12 pr-4"
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
//                   >
//                     <FilterX className="h-4 w-4" />
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Test Type Filter */}
//             <div>
//               <label className="block text-sm font-medium text-secondary-700 mb-3">
//                 Test Type
//               </label>
//               <select
//                 value={selectedTestType}
//                 onChange={(e) => setSelectedTestType(e.target.value)}
//                 className="input appearance-none"
//               >
//                 {testTypes.map(testType => (
//                   <option key={testType} value={testType}>
//                     {testType === 'all' ? 'All Tests' : testType}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Status Filter */}
//             <div>
//               <label className="block text-sm font-medium text-secondary-700 mb-3">
//                 Status
//               </label>
//               <select
//                 value={selectedStatus}
//                 onChange={(e) => setSelectedStatus(e.target.value)}
//                 className="input appearance-none"
//               >
//                 {statusOptions.map(status => (
//                   <option key={status} value={status}>
//                     {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Time Range Filter */}
//             <div>
//               <label className="block text-sm font-medium text-secondary-700 mb-3">
//                 Time Range
//               </label>
//               <select
//                 value={selectedTimeRange}
//                 onChange={(e) => setSelectedTimeRange(e.target.value)}
//                 className="input appearance-none"
//               >
//                 {timeRanges.map(range => (
//                   <option key={range} value={range}>
//                     {range === 'all' ? 'All Time' : range.replace('-', ' ').replace(/\b\w/g, (match) => match.toUpperCase())}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* View Mode Toggle */}
//             <div>
//               <label className="block text-sm font-medium text-secondary-700 mb-3">
//                 View Mode
//               </label>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => setViewMode('card')}
//                   className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
//                     viewMode === 'card'
//                       ? 'border-primary-500 bg-primary-50 text-primary-700'
//                       : 'border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300'
//                   }`}
//                 >
//                   <div className="flex items-center justify-center">
//                     <div className="grid grid-cols-3 gap-1 w-4 h-4">
//                       <div className="w-2 h-2 bg-current rounded-sm"></div>
//                       <div className="w-2 h-2 bg-current rounded-sm"></div>
//                       <div className="w-2 h-2 bg-current rounded-sm"></div>
//                     </div>
//                   </div>
//                   <span className="ml-2 text-sm">Card</span>
//                 </button>
//                 <button
//                   onClick={() => setViewMode('detailed')}
//                   className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
//                     viewMode === 'detailed'
//                       ? 'border-primary-500 bg-primary-50 text-primary-700'
//                       : 'border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300'
//                   }`}
//                 >
//                   <div className="flex items-center justify-center">
//                     <div className="space-y-1 w-4">
//                       <div className="w-full h-0.5 bg-current rounded-sm"></div>
//                       <div className="w-full h-0.5 bg-current rounded-sm"></div>
//                       <div className="w-full h-0.5 bg-current rounded-sm"></div>
//                     </div>
//                   </div>
//                   <span className="ml-2 text-sm">Detailed</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Results Stats */}
//         <div className="flex flex-wrap gap-4 mb-6">
//           <div className="flex items-center px-4 py-2 bg-blue-50 rounded-lg">
//             <FileText className="h-5 w-5 text-blue-600 mr-2" />
//             <div>
//               <div className="text-lg font-bold text-blue-900">{filteredResults.length}</div>
//               <div className="text-sm text-blue-700">Total Results</div>
//             </div>
//           </div>
//           <div className="flex items-center px-4 py-2 bg-emerald-50 rounded-lg">
//             <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
//             <div>
//               <div className="text-lg font-bold text-emerald-900">
//                 {filteredResults.filter(r => r.status === 'normal').length}
//               </div>
//               <div className="text-sm text-emerald-700">Normal Results</div>
//             </div>
//           </div>
//           <div className="flex items-center px-4 py-2 bg-amber-50 rounded-lg">
//             <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
//             <div>
//               <div className="text-lg font-bold text-amber-900">
//                 {filteredResults.filter(r => r.status === 'abnormal').length}
//               </div>
//               <div className="text-sm text-amber-700">Abnormal Results</div>
//             </div>
//           </div>
//           <div className="flex items-center px-4 py-2 bg-red-50 rounded-lg">
//             <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
//             <div>
//               <div className="text-lg font-bold text-red-900">
//                 {filteredResults.filter(r => r.status === 'critical').length}
//               </div>
//               <div className="text-sm text-red-700">Critical Results</div>
//             </div>
//           </div>
//         </div>

//         {/* Lab Results Display */}
//         {filteredResults.length > 0 ? (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className={
//               viewMode === 'card'
//                 ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
//                 : "space-y-4"
//             }
//           >
//             {filteredResults.map((result, index) => (
//               <motion.div
//                 key={result.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: index * 0.1 }}
//               >
//                 {viewMode === 'card' ? (
//                   <div className="card-elevated p-6 hover:shadow-large transition-shadow duration-300">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <div className="flex items-center mb-2">
//                           <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
//                             {getStatusIcon(result.status)}
//                             <span className="ml-2">{result.status.toUpperCase()}</span>
//                           </div>
//                         </div>
//                         <div className="text-sm text-secondary-500">
//                           {result.date}
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <button className="text-secondary-400 hover:text-secondary-600">
//                           <Download className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <h3 className="heading-3 text-secondary-900 mb-2">
//                         {result.testName}
//                       </h3>
//                       <p className="text-sm text-secondary-600 mb-1">
//                         {result.testType}
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <p className="text-sm text-secondary-500 mb-1">Value</p>
//                         <div className="flex items-center">
//                           <span className="text-2xl font-bold text-secondary-900">
//                             {result.value}
//                             {result.unit && <span className="text-lg text-secondary-600 ml-1">{result.unit}</span>}
//                           </span>
//                         </div>
//                       </div>
//                       <div>
//                         <p className="text-sm text-secondary-500 mb-1">Normal Range</p>
//                         <div className="text-lg font-semibold text-emerald-600">
//                           {result.normalRange}
//                         </div>
//                       </div>
//                     </div>
//                     </div>

//                     <div className="mb-4">
//                       <p className="text-sm text-secondary-500 mb-1">Doctor</p>
//                       <div className="flex items-center">
//                         <Stethoscope className="h-4 w-4 text-primary-600 mr-2" />
//                         <span className="font-medium text-secondary-900">{result.doctorName}</span>
//                       </div>
//                     </div>

//                     {result.notes && (
//                       <div className="mb-4">
//                         <p className="text-sm text-secondary-500 mb-1">Notes</p>
//                         <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
//                           <p className="text-sm text-amber-800">{result.notes}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   </div>
//                 ) : (
//                   <div className="card-elevated p-6 hover:shadow-large transition-shadow duration-300">
//                     <div className="flex justify-between items-start mb-4">
//                       <div>
//                         <div className="flex items-center mb-2">
//                           <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
//                             {getStatusIcon(result.status)}
//                             <span className="ml-2">{result.status.toUpperCase()}</span>
//                           </div>
//                         </div>
//                         <div className="text-sm text-secondary-500">
//                           {result.date}
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <button className="text-secondary-400 hover:text-secondary-600">
//                           <Download className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="border-t pt-4">
//                       <h3 className="heading-3 text-secondary-900 mb-4">
//                         {result.testName} - {result.testType}
//                       </h3>
                      
//                       <div className="grid md:grid-cols-2 gap-6">
//                         <div>
//                           <p className="text-sm text-secondary-500 mb-2">Test Result</p>
//                           <div className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}>
//                             <div className="text-3xl font-bold text-secondary-900">
//                               {result.value}
//                               {result.unit && <span className="text-lg text-secondary-600 ml-1">{result.unit}</span>}
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div>
//                           <p className="text-sm text-secondary-500 mb-2">Normal Range</p>
//                           <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
//                             <p className="text-lg font-semibold text-emerald-800">
//                               {result.normalRange}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="md:col-span-2">
//                         <p className="text-sm text-secondary-500 mb-2">Doctor</p>
//                         <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                           <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
//                           <span className="font-medium text-blue-900">{result.doctorName}</span>
//                         </div>
//                       </div>

//                       <div className="md:col-span-2">
//                         <p className="text-sm text-secondary-500 mb-2">Test Date</p>
//                         <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
//                           <div className="flex items-center">
//                             <Calendar className="h-5 w-5 text-gray-600 mr-2" />
//                             <span className="font-medium text-gray-900">{result.date}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {result.notes && (
//                       <div className="md:col-span-2">
//                         <p className="text-sm text-secondary-500 mb-2">Doctor Notes</p>
//                         <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                           <p className="text-sm text-amber-800">{result.notes}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))}
//         </motion.div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center py-16"
//           >
//             <div className="max-w-md mx-auto">
//               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <FileText className="h-10 w-10 text-gray-400" />
//               </div>
//               <h3 className="heading-2 text-secondary-900 mb-4">
//                 No Lab Results Found
//               </h3>
//               <p className="text-body text-secondary-600 mb-8">
//                 {searchTerm || selectedTestType !== 'all' || selectedStatus !== 'all'
//                   ? 'Try adjusting your search criteria or filters'
//                   : 'No lab results available. Check back after your next appointment.'
//                 }
//               </p>
//               <button
//                 onClick={clearFilters}
//                 className="btn-primary"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {/* Quick Stats Section */}
//         <div className="grid md:grid-cols-4 gap-6 mt-12">
//           {[
//             {
//               icon: Activity,
//               label: 'Total Tests',
//               value: labResults.length,
//               color: 'blue'
//             },
//             {
//               icon: TrendingUp,
//               label: 'This Month',
//               value: labResults.filter(r => {
//                 const testDate = new Date(r.date);
//                 const thisMonth = new Date();
//                 return testDate.getMonth() === thisMonth.getMonth() && 
//                        testDate.getFullYear() === thisMonth.getFullYear();
//               }).length,
//               color: 'emerald'
//             },
//             {
//               icon: CheckCircle,
//               label: 'Normal Results',
//               value: labResults.filter(r => r.status === 'normal').length,
//               color: 'green'
//             },
//             {
//               icon: AlertCircle,
//               label: 'Action Required',
//               value: labResults.filter(r => r.status === 'abnormal' || r.status === 'critical').length,
//               color: 'red'
//             }
//           ].map((stat, index) => (
//             <motion.div
//               key={stat.label}
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
//               className="text-center"
//             >
//               <div className={`w-16 h-16 bg-${stat.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
//                 <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
//               </div>
//               <div className="text-2xl font-bold text-secondary-900 mb-1">
//                 {stat.value}
//               </div>
//               <div className="text-sm text-secondary-600">
//                 {stat.label}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };