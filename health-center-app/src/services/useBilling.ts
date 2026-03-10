import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const updateBillingStatus = useCallback(
    async (id: string | number, status: 'pending' | 'paid' | 'refunded', notes?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.updateBillingStatus(id, { status, notes });
        const updated = normalizeBilling(response);
        setBillings(prev => 
          prev.map(record => 
            record.id === id ? updated : record
          )
        );
        
        // Update stats if we have them
        if (stats) {
          const updatedStats = calculateStats([
            ...billings.filter(r => r.id !== id),
            updated
          ]);
          setStats(updatedStats);
        }
        
        return updated;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to update billing status';
        setError(errorMessage);
        console.error('Error updating billing status:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [billings, stats]
  );

  const createBilling = useCallback(
    async (billingData: BillingCreateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.createBilling(billingData);
        const newBilling = normalizeBilling(response);
        setBillings(prev => [...prev, newBilling]);
        
        // Update stats
        if (stats) {
          const updatedStats = calculateStats([...billings, newBilling]);
          setStats(updatedStats);
        }
        
        return newBilling;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to create billing record';
        setError(errorMessage);
        console.error('Error creating billing record:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [billings, stats]
  );

  // Export billing data to PDF
  const exportBillingPDF = useCallback(async (billingData: any[], filters?: any) => {
    try {
      const doc = new jsPDF();
      
      // Add custom font for better text rendering
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(41, 98, 255);
      doc.text('Kiangombe Health Center', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Billing Report', 105, 30, { align: 'center' });
      
      // Report date and filters
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${reportDate}`, 105, 40, { align: 'center' });
      
      if (filters) {
        doc.text(`Filters: ${filters}`, 105, 47, { align: 'center' });
      }
      
      // Calculate summary statistics
      const totalRevenue = billingData.reduce((sum, item) => sum + (item.amount || 0), 0);
      const paidCount = billingData.filter(item => item.payment_status === 'paid').length;
      const pendingCount = billingData.filter(item => item.payment_status === 'pending').length;
      const refundedCount = billingData.filter(item => item.payment_status === 'refunded').length;
      
      // Summary section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Summary', 14, 60);
      
      doc.setFontSize(10);
      doc.text(`Total Records: ${billingData.length}`, 14, 70);
      doc.text(`Total Revenue: KES ${totalRevenue.toLocaleString()}`, 14, 77);
      doc.text(`Paid: ${paidCount}`, 14, 84);
      doc.text(`Pending: ${pendingCount}`, 14, 91);
      doc.text(`Refunded: ${refundedCount}`, 14, 98);
      
      // Prepare table data
      const tableData = billingData.map((item, index) => [
        index + 1,
        item.invoice_number || `INV-${item.id}`,
        item.patient_name || 'Unknown',
        item.clinician_name || 'Unknown',
        item.visit_type === 'medication_purchase' ? 'Medication' : 'Appointment',
        new Date(item.scheduled_at || item.created_at).toLocaleDateString(),
        `KES ${(item.amount || 0).toLocaleString()}`,
        item.payment_status || 'pending',
        item.payment_method || 'N/A'
      ]);
      
      // Table headers
      const headers = [
        '#',
        'Invoice',
        'Patient',
        'Doctor',
        'Type',
        'Date',
        'Amount',
        'Status',
        'Method'
      ];
      
      // Add table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 110,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [41, 98, 255],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          lineColor: [41, 98, 255]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 10 }, // #
          1: { cellWidth: 25 }, // Invoice
          2: { cellWidth: 30 }, // Patient
          3: { cellWidth: 30 }, // Doctor
          4: { cellWidth: 20 }, // Type
          5: { cellWidth: 20 }, // Date
          6: { cellWidth: 25 }, // Amount
          7: { cellWidth: 20 }, // Status
          8: { cellWidth: 20 }, // Method
        },
        didDrawCell: (data) => {
          // Color code status cells
          if (data.column.index === 7) { // Status column
            const status = data.cell.raw as string;
            if (status === 'paid') {
              doc.setFillColor(220, 252, 231);
              doc.setTextColor(22, 101, 52);
            } else if (status === 'pending') {
              doc.setFillColor(255, 251, 235);
              doc.setTextColor(217, 119, 6);
            } else if (status === 'refunded') {
              doc.setFillColor(239, 246, 255);
              doc.setTextColor(59, 130, 246);
            }
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.text(status, data.cell.x + 2, data.cell.y + 5);
          }
        }
      });
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          (doc as any).internal.pageSize.width / 2,
          (doc as any).internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          '© 2026 Kiangombe Health Center - Confidential',
          (doc as any).internal.pageSize.width / 2,
          (doc as any).internal.pageSize.height - 5,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      const fileName = `billing-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }, []);

  return {
    isLoading,
    billings,
    stats,
    error,
    fetchBillings,
    calculateStats,
    updateBillingStatus,
    createBilling,
    exportBillingPDF,
  };
};
