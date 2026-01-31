/**
 * Standardized health measurement units for consistency across the application
 */

// Unit conversion utilities
export const healthUnits = {
  // Weight units
  weight: {
    kg: {
      name: 'kg',
      label: 'Kilograms',
      toLbs: (kg: number) => kg * 2.20462,
      fromLbs: (lbs: number) => lbs / 2.20462,
    },
    lbs: {
      name: 'lbs',
      label: 'Pounds',
      toKg: (lbs: number) => lbs / 2.20462,
      fromKg: (kg: number) => kg * 2.20462,
    },
  },
  
  // Height units
  height: {
    cm: {
      name: 'cm',
      label: 'Centimeters',
      toFt: (cm: number) => cm / 30.48,
      toInches: (cm: number) => cm / 2.54,
      fromFt: (ft: number) => ft * 30.48,
      fromInches: (inches: number) => inches * 2.54,
    },
    ft: {
      name: 'ft',
      label: 'Feet',
      toCm: (ft: number) => ft * 30.48,
      fromCm: (cm: number) => cm / 30.48,
    },
    inches: {
      name: 'in',
      label: 'Inches',
      toCm: (inches: number) => inches * 2.54,
      fromCm: (cm: number) => cm / 2.54,
    },
  },
  
  // Temperature units
  temperature: {
    celsius: {
      name: '°C',
      label: 'Celsius',
      toFahrenheit: (c: number) => (c * 9/5) + 32,
      fromFahrenheit: (f: number) => (f - 32) * 5/9,
    },
    fahrenheit: {
      name: '°F',
      label: 'Fahrenheit',
      toCelsius: (f: number) => (f - 32) * 5/9,
      fromCelsius: (c: number) => (c * 9/5) + 32,
    },
  },
  
  // Blood pressure
  bloodPressure: {
    mmHg: {
      name: 'mmHg',
      label: 'Millimeters of Mercury',
    },
  },
  
  // Blood glucose
  glucose: {
    mgdl: {
      name: 'mg/dL',
      label: 'Milligrams per Deciliter',
      toMmol: (mgdl: number) => mgdl / 18.018,
      fromMmol: (mmol: number) => mmol * 18.018,
    },
    mmol: {
      name: 'mmol/L',
      label: 'Millimoles per Liter',
      toMgdl: (mmol: number) => mmol * 18.018,
      fromMgdl: (mgdl: number) => mgdl / 18.018,
    },
  },
  
  // Heart rate
  heartRate: {
    bpm: {
      name: 'bpm',
      label: 'Beats Per Minute',
    },
  },
  
  // Cholesterol
  cholesterol: {
    mgdl: {
      name: 'mg/dL',
      label: 'Milligrams per Deciliter',
      toMmol: (mgdl: number) => mgdl / 38.67,
      fromMmol: (mmol: number) => mmol * 38.67,
    },
    mmol: {
      name: 'mmol/L',
      label: 'Millimoles per Liter',
      toMgdl: (mmol: number) => mmol * 38.67,
      fromMgdl: (mgdl: number) => mgdl / 38.67,
    },
  },
};

// Standard unit preferences by region
export const regionPreferences = {
  US: {
    weight: 'lbs',
    height: 'ft',
    temperature: 'fahrenheit',
    glucose: 'mgdl',
    cholesterol: 'mgdl',
  },
  UK: {
    weight: 'kg',
    height: 'cm',
    temperature: 'celsius',
    glucose: 'mmol',
    cholesterol: 'mmol',
  },
  EU: {
    weight: 'kg',
    height: 'cm',
    temperature: 'celsius',
    glucose: 'mmol',
    cholesterol: 'mmol',
  },
  default: {
    weight: 'kg',
    height: 'cm',
    temperature: 'celsius',
    glucose: 'mgdl',
    cholesterol: 'mgdl',
  },
};

// Get user's preferred units (could be based on locale or user preference)
export const getUserUnits = (region: keyof typeof regionPreferences = 'default') => {
  return regionPreferences[region];
};

// Format value with unit
export const formatWithUnit = (value: number, unit: string, precision: number = 1): string => {
  return `${value.toFixed(precision)} ${unit}`;
};

// BMI calculation utilities
export const calculateBMI = (weight: number, height: number, weightUnit: 'kg' | 'lbs', heightUnit: 'cm' | 'ft' | 'inches'): number => {
  // Convert to metric units for calculation
  const weightInKg = weightUnit === 'kg' ? weight : healthUnits.weight.lbs.toKg(weight);
  const heightInM = heightUnit === 'cm' ? height / 100 : heightUnit === 'ft' ? height * 0.3048 : height * 0.0254;
  
  return weightInKg / (heightInM * heightInM);
};

export const getBMICategory = (bmi: number): { category: string; color: string; status: 'excellent' | 'good' | 'fair' | 'poor' } => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', status: 'fair' };
  if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600', status: 'excellent' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600', status: 'good' };
  return { category: 'Obese', color: 'text-red-600', status: 'poor' };
};

// Blood pressure categories
export const getBloodPressureCategory = (systolic: number, diastolic: number): { category: string; color: string; status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' } => {
  if (systolic < 120 && diastolic < 80) {
    return { category: 'Normal', color: 'text-green-600', status: 'excellent' };
  }
  if (systolic < 130 && diastolic < 80) {
    return { category: 'Elevated', color: 'text-yellow-600', status: 'good' };
  }
  if (systolic < 140 || diastolic < 90) {
    return { category: 'High Stage 1', color: 'text-orange-600', status: 'fair' };
  }
  if (systolic < 180 || diastolic < 120) {
    return { category: 'High Stage 2', color: 'text-red-600', status: 'poor' };
  }
  return { category: 'Hypertensive Crisis', color: 'text-red-800', status: 'critical' };
};

// Glucose categories
export const getGlucoseCategory = (glucose: number, unit: 'mgdl' | 'mmol'): { category: string; color: string; status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' } => {
  const mgdlValue = unit === 'mgdl' ? glucose : healthUnits.glucose.mmol.toMgdl(glucose);
  
  if (mgdlValue < 70) return { category: 'Low', color: 'text-blue-600', status: 'fair' };
  if (mgdlValue < 100) return { category: 'Normal', color: 'text-green-600', status: 'excellent' };
  if (mgdlValue < 126) return { category: 'Prediabetes', color: 'text-yellow-600', status: 'fair' };
  return { category: 'Diabetes', color: 'text-red-600', status: 'poor' };
};
