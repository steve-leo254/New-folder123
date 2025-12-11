import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';

export interface BillingRecord {
  id: string | number;
  appointmentId?: string | number;
  patientId: string | number;
  patientName?: string;
  amount: number;
  status: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  description?: string;
  invoiceNumber?: string;
  dueDate?: string;
  paidDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingCreateRequest {
  appointment_id?: string | number;
  patient_id: string | number;
  amount: number;
  payment_method?: string;
  description?: string;
  due_date?: string;
}

export interface BillingUpdateRequest extends Partial<BillingCreateRequest> {
  status?: 'pending' | 'paid' | 'refunded';
  paid_date?: string;
}

export interface BillingStats {
  totalRevenue: number;
  totalPending: number;
  totalPaid: number;
  totalRefunded: number;
  averageTransactionValue: number;
  transactionCount: number;
}

const normalizeBilling = (billing: any): BillingRecord => ({
  id: billing.id,
  appointmentId: billing.appointment_id || billing.appointmentId,
  patientId: billing.patient_id || billing.patientId,
  patientName: billing.patient_name || billing.patientName,
  amount: billing.amount,
  status: billing.status || 'pending',
  paymentMethod: billing.payment_method || billing.paymentMethod,
  description: billing.description,
  invoiceNumber: billing.invoice_number || billing.invoiceNumber,
  dueDate: billing.due_date || billing.dueDate,
  paidDate: billing.paid_date || billing.paidDate,
  createdAt: billing.created_at || billing.createdAt,
  updatedAt: billing.updated_at || billing.updatedAt,
});

const toArrayResponse = (response: any): BillingRecord[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response.map(normalizeBilling);
  if (response.items && Array.isArray(response.items)) {
    return response.items.map(normalizeBilling);
  }
  return [normalizeBilling(response)];
};

export const useBilling = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [billings, setBillings] = useState<BillingRecord[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBillings = useCallback(
    async (params?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getBilling(params);
        const normalized = toArrayResponse(response);
        setBillings(normalized);
        
        // Extract stats if available
        if (response && typeof response === 'object' && 'stats' in response) {
          setStats({
            totalRevenue: response.stats.total_revenue || 0,
            totalPending: response.stats.total_pending || 0,
            totalPaid: response.stats.total_paid || 0,
            totalRefunded: response.stats.total_refunded || 0,
            averageTransactionValue: response.stats.average_transaction_value || 0,
            transactionCount: response.stats.transaction_count || 0,
          });
        }
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch billing records';
        setError(errorMessage);
        console.error('Error fetching billing records:', axiosError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const calculateStats = useCallback((records: BillingRecord[]) => {
    const calculated: BillingStats = {
      totalRevenue: 0,
      totalPending: 0,
      totalPaid: 0,
      totalRefunded: 0,
      averageTransactionValue: 0,
      transactionCount: records.length,
    };

    records.forEach((record) => {
      if (record.status === 'paid') {
        calculated.totalPaid += record.amount;
        calculated.totalRevenue += record.amount;
      } else if (record.status === 'pending') {
        calculated.totalPending += record.amount;
      } else if (record.status === 'refunded') {
        calculated.totalRefunded += record.amount;
      }
    });

    calculated.averageTransactionValue =
      calculated.transactionCount > 0
        ? calculated.totalRevenue / calculated.transactionCount
        : 0;

    return calculated;
  }, []);

  return {
    isLoading,
    billings,
    stats,
    error,
    fetchBillings,
    calculateStats,
  };
};
