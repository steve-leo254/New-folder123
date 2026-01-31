import { useState, useEffect } from 'react';
import { usePatient } from './usePatient';

interface InsuranceDiscount {
  hasInsurance: boolean;
  insuranceType: string;
  discountPercentage: number;
  discountAmount: number;
  quarterlyLimit: number;
  quarterlyUsed: number;
  remainingQuarterly: number;
  isEligible: boolean;
}

export const useInsuranceDiscount = (subtotal: number): InsuranceDiscount => {
  const { patient } = usePatient();
  
  const calculateDiscount = (): InsuranceDiscount => {
    // Default values
    const defaultDiscount: InsuranceDiscount = {
      hasInsurance: false,
      insuranceType: 'standard',
      discountPercentage: 0,
      discountAmount: 0,
      quarterlyLimit: 0,
      quarterlyUsed: 0,
      remainingQuarterly: 0,
      isEligible: false
    };

    // Check if patient has insurance
    if (!patient || !patient.insuranceProvider) {
      return defaultDiscount;
    }

    const hasInsurance = !!patient.insuranceProvider;
    const insuranceType = patient.insuranceType || 'standard';
    const quarterlyLimit = patient.insuranceQuarterlyLimit || 0;
    const quarterlyUsed = patient.insuranceQuarterlyUsed || 0;
    const remainingQuarterly = quarterlyLimit - quarterlyUsed;

    // Calculate discount based on insurance type
    let discountPercentage = 0;
    let isEligible = false;

    if (hasInsurance) {
      if (insuranceType === 'sha') {
        // SHA insurance gets 30% discount
        discountPercentage = 0.30;
        isEligible = remainingQuarterly >= subtotal * 0.70; // Check if remaining limit covers patient portion
      } else {
        // Standard insurance gets 15% discount
        discountPercentage = 0.15;
        isEligible = remainingQuarterly >= subtotal * 0.85; // Check if remaining limit covers patient portion
      }
    }

    const discountAmount = subtotal * discountPercentage;

    return {
      hasInsurance,
      insuranceType,
      discountPercentage,
      discountAmount,
      quarterlyLimit,
      quarterlyUsed,
      remainingQuarterly,
      isEligible: isEligible && hasInsurance
    };
  };

  const discount = calculateDiscount();

  return discount;
};
