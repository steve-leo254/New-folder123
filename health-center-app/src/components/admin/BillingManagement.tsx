import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
  TrendingUp,
  CreditCard,
  Smartphone,
  User,
  DollarSign,
} from 'lucide-react';
import Button from '../ui/Button';
import { apiService } from '../../services/api';

interface Payment {
  id: string;
  transactionId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  amount: number;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
  paymentMethod: 'mpesa' | 'card' | 'cash';
  notes?: string;
}

interface BillingManagementProps {
  onPaymentUpdate?: (paymentId: string, newStatus: Payment['status']) => void;
}

const BillingManagement: React.FC<BillingManagementProps> = ({ onPaymentUpdate }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Payment['status'] | 'all'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false
  });

  // Fetch real billing data from API
  const fetchBillingData = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      
      // Add status filter if not 'all'
      if (statusFilter && statusFilter !== 'all') {
        params.payment_status = mapFrontendToBackendStatus(statusFilter);
      }
      
      const response = await apiService.getBillingPayments(params);
      
      // Handle paginated response
      const paymentsData = response.payments || response; // Handle both old and new response format
      
      // Transform API data to match the Payment interface
      const transformedPayments: Payment[] = paymentsData.map((payment: any) => ({
        id: payment.id.toString(),
        transactionId: payment.transaction_id || `TXN${payment.id}`,
        patientId: payment.patient_id?.toString() || '',
        patientName: payment.patient_name || 'Unknown Patient',
        patientPhone: '', // Phone number not available from API
        doctorId: payment.clinician_id?.toString() || '',
        doctorName: payment.clinician_name || 'Unknown Doctor',
        amount: payment.payment_amount || payment.cost || 0,
        appointmentDate: payment.scheduled_at ? new Date(payment.scheduled_at).toLocaleDateString('en-CA') : '',
        appointmentTime: payment.scheduled_at ? new Date(payment.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        appointmentType: 'in-person', // Default, not available from API
        status: mapPaymentStatus(payment.payment_status),
        createdAt: payment.created_at || payment.payment_date || new Date().toISOString(),
        updatedAt: payment.updated_at || payment.payment_date || new Date().toISOString(),
        paymentMethod: mapPaymentMethod(payment.payment_method),
        notes: payment.cancellation_reason || '',
      }));

      setPayments(transformedPayments);
      setFilteredPayments(transformedPayments);
      
      // Update pagination if available
      if (response.pagination) {
        setPagination(response.pagination);
      } else {
        // Fallback pagination for old response format
        setPagination({
          page: 1,
          limit: 10,
          total: transformedPayments.length,
          pages: 1,
          has_next: false,
          has_prev: false
        });
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      // Fallback to empty array if API fails
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBillingData();
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBillingData(pagination.page, pagination.limit);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchBillingData(newPage, pagination.limit);
  };

  // Helper functions to map API data to frontend format
  const mapPaymentStatus = (status: string): Payment['status'] => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  };

  const mapPaymentMethod = (method: string): Payment['paymentMethod'] => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return 'mpesa';
      case 'card':
        return 'card';
      case 'cash':
        return 'cash';
      default:
        return 'mpesa';
    }
  };

  // Handle status filter change
  useEffect(() => {
    // Reset to first page when filter changes
    fetchBillingData(1, pagination.limit);
  }, [statusFilter]);

  // Filter payments based on search (client-side for now)
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.patientPhone.includes(searchTerm)
      );
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm]);

  // Status configuration
  const statusConfig = useMemo(
    () => ({
      pending: {
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-200',
      },
      processing: {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        label: 'Processing',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
      },
      completed: {
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Completed',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
      },
      failed: {
        icon: <XCircle className="w-4 h-4" />,
        label: 'Failed',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
      },
      cancelled: {
        icon: <XCircle className="w-4 h-4" />,
        label: 'Cancelled',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
      },
      refunded: {
        icon: <RefreshCw className="w-4 h-4" />,
        label: 'Refunded',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
      },
    }),
    []
  );

  // Handle payment status update
  const handleStatusUpdate = async (paymentId: string, newStatus: Payment['status']) => {
    try {
      // Map frontend status to backend status
      const backendStatus = mapFrontendToBackendStatus(newStatus);
      
      // Update payment status via API
      await apiService.updateBillingStatus(paymentId, { 
        status: backendStatus,
        notes: newStatus === 'cancelled' ? 'Cancelled by admin' : undefined
      });
      
      // Refresh data to get updated state
      await fetchBillingData();

      if (onPaymentUpdate) {
        onPaymentUpdate(paymentId, newStatus);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      // Optionally show error message to user
    }
  };

  // Helper function to map frontend status to backend status
  const mapFrontendToBackendStatus = (status: Payment['status']): string => {
    switch (status) {
      case 'completed':
        return 'paid';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const completed = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const failed = payments.filter((p) => p.status === 'failed').length;

    return {
      total,
      completed,
      pending,
      failed,
      transactionCount: payments.length,
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(statistics.total)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(statistics.completed)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(statistics.pending)}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.transactionCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, doctor name, transaction ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-900">{payment.transactionId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.patientName}</p>
                          <p className="text-xs text-gray-500">{payment.patientPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{payment.doctorName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <p>{payment.appointmentDate}</p>
                        <p className="text-xs text-gray-500">{payment.appointmentTime}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {payment.appointmentType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[payment.status].bgColor} ${statusConfig[payment.status].color} ${statusConfig[payment.status].borderColor}`}
                      >
                        {statusConfig[payment.status].icon}
                        {statusConfig[payment.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{formatDate(payment.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailsModal(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>

                        {/* Status change actions */}
                        {payment.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(payment.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(payment.id, 'cancelled')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        )}

                        {payment.status === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(payment.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}

                        {payment.status === 'failed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(payment.id, 'pending')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payments found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="flex items-center gap-1"
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="flex items-center gap-1"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Transaction Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Transaction ID:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPayment.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[selectedPayment.status].bgColor} ${statusConfig[selectedPayment.status].color} ${statusConfig[selectedPayment.status].borderColor}`}
                        >
                          {statusConfig[selectedPayment.status].icon}
                          {statusConfig[selectedPayment.status].label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Method:</span>
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">M-Pesa</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Patient Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPayment.patientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPayment.patientPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Appointment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Doctor:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPayment.doctorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{selectedPayment.appointmentType}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPayment.appointmentDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedPayment.appointmentTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedPayment.createdAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Updated:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedPayment.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedPayment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  {selectedPayment.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          handleStatusUpdate(selectedPayment.id, 'completed');
                          setShowDetailsModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Payment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedPayment.id, 'cancelled');
                          setShowDetailsModal(false);
                        }}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Payment
                      </Button>
                    </>
                  )}

                  {selectedPayment.status === 'processing' && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedPayment.id, 'completed');
                        setShowDetailsModal(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Payment
                    </Button>
                  )}

                  {selectedPayment.status === 'failed' && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedPayment.id, 'pending');
                        setShowDetailsModal(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry Payment
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingManagement;
