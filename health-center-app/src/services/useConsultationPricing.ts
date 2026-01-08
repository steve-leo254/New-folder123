import { useState, useEffect } from 'react';
import { Doctor } from '../types';

export interface ConsultationPricing {
  video: number;
  phone: number;
  chat: number;
}

export interface ConsultationType {
  id: string;
  type: 'video' | 'phone' | 'chat';
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  duration: string;
}

const DEFAULT_PRICING: ConsultationPricing = {
  video: 2000,
  phone: 1600,
  chat: 1200,
};

const ROLE_BASED_PRICING: Record<string, ConsultationPricing> = {
  'General Practitioner': {
    video: 2000,
    phone: 1600,
    chat: 1200,
  },
  'Internal Medicine': {
    video: 2500,
    phone: 2000,
    chat: 1500,
  },
  'Family Medicine': {
    video: 1800,
    phone: 1400,
    chat: 1000,
  },
  'Specialist': {
    video: 3000,
    phone: 2500,
    chat: 1800,
  },
};

export const useConsultationPricing = (doctor?: Doctor) => {
  const [pricing, setPricing] = useState<ConsultationPricing>(DEFAULT_PRICING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctor) {
      setPricing(DEFAULT_PRICING);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract pricing from doctor data with fallbacks
      let doctorPricing: ConsultationPricing;

      // Priority 1: Doctor-specific pricing from database
      if (doctor.video_consultation_fee || doctor.phone_consultation_fee || doctor.chat_consultation_fee) {
        doctorPricing = {
          video: doctor.video_consultation_fee || DEFAULT_PRICING.video,
          phone: doctor.phone_consultation_fee || DEFAULT_PRICING.phone,
          chat: doctor.chat_consultation_fee || DEFAULT_PRICING.chat,
        };
      }
      // Priority 2: Base consultation fee with multipliers
      else if (doctor.consultationFee) {
        const baseFee = Number(doctor.consultationFee);
        doctorPricing = {
          video: baseFee,
          phone: Math.round(baseFee * 0.8),
          chat: Math.round(baseFee * 0.6),
        };
      }
      // Priority 3: Role-based pricing (as fallback)
      else if (doctor.specialization && ROLE_BASED_PRICING[doctor.specialization]) {
        doctorPricing = ROLE_BASED_PRICING[doctor.specialization];
      }
      // Priority 4: Default pricing
      else {
        doctorPricing = DEFAULT_PRICING;
      }

      setPricing(doctorPricing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pricing');
      setPricing(DEFAULT_PRICING);
    } finally {
      setLoading(false);
    }
  }, [doctor]);

  const getConsultationTypes = (): ConsultationType[] => {
    return [
      {
        id: 'video',
        type: 'video',
        name: 'Video Call',
        description: 'Face-to-face consultation via HD video',
        icon: null, // Will be set in component
        price: pricing.video,
        duration: '15-30 min',
      },
      {
        id: 'phone',
        type: 'phone',
        name: 'Voice Call',
        description: 'Phone consultation with your doctor',
        icon: null, // Will be set in component
        price: pricing.phone,
        duration: '10-20 min',
      },
      {
        id: 'chat',
        type: 'chat',
        name: 'Chat',
        description: 'Text-based consultation with attachments',
        icon: null, // Will be set in component
        price: pricing.chat,
        duration: '24h response',
      },
    ];
  };

  return {
    pricing,
    loading,
    error,
    getConsultationTypes,
  };
};
