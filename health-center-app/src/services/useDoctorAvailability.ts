import { useState, useEffect } from 'react';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface DoctorAvailability {
  day: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  appointmentDuration: number;
  bufferTime: number;
  maxAppointmentsPerDay: number;
}

const API_BASE_URL = 'http://localhost:8000';

export const useDoctorAvailability = (doctorId: string) => {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/availability`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.statusText}`);
      }

      const data: DoctorAvailability[] = await response.json();
      setAvailability(data);
      
      // Generate time slots based on availability
      const generatedSlots = generateTimeSlots(data);
      setTimeSlots(generatedSlots);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching doctor availability:', err);
      
      // Fallback to default time slots
      const fallbackSlots = generateDefaultTimeSlots();
      setTimeSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (availability: DoctorAvailability[]): TimeSlot[] => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayAvailability = availability.find(avail => avail.day === today);
    
    if (!todayAvailability || !todayAvailability.isOpen) {
      return generateDefaultTimeSlots();
    }

    const slots: TimeSlot[] = [];
    const { startTime, endTime, breakStart, breakEnd, appointmentDuration } = todayAvailability;
    
    // Parse times
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    const breakStartParsed = breakStart ? parseTime(breakStart) : null;
    const breakEndParsed = breakEnd ? parseTime(breakEnd) : null;
    
    let currentTime = start;
    
    while (currentTime < end) {
      // Skip break time
      if (breakStartParsed && breakEndParsed && 
          currentTime >= breakStartParsed && currentTime < breakEndParsed) {
        currentTime = breakEndParsed;
        continue;
      }
      
      const timeString = formatTime(currentTime);
      const slotId = `${timeString.replace(':', '')}-${Math.random()}`;
      
      // Randomly mark some slots as unavailable for demo
      const isAvailable = Math.random() > 0.2; // 80% availability
      
      slots.push({
        id: slotId,
        time: timeString,
        available: isAvailable,
      });
      
      // Add appointment duration + buffer time
      currentTime = new Date(currentTime.getTime() + (appointmentDuration + 10) * 60000);
    }
    
    return slots;
  };

  const generateDefaultTimeSlots = (): TimeSlot[] => {
    return [
      { id: '1', time: '9:00 AM', available: true },
      { id: '2', time: '9:30 AM', available: true },
      { id: '3', time: '10:00 AM', available: false },
      { id: '4', time: '10:30 AM', available: true },
      { id: '5', time: '11:00 AM', available: true },
      { id: '6', time: '11:30 AM', available: false },
      { id: '7', time: '2:00 PM', available: true },
      { id: '8', time: '2:30 PM', available: true },
      { id: '9', time: '3:00 PM', available: true },
      { id: '10', time: '3:30 PM', available: false },
      { id: '11', time: '4:00 PM', available: true },
      { id: '12', time: '4:30 PM', available: true },
    ];
  };

  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  useEffect(() => {
    if (doctorId) {
      fetchAvailability();
    }
  }, [doctorId]);

  return {
    availability,
    timeSlots,
    loading,
    error,
    refetch: fetchAvailability,
  };
};
