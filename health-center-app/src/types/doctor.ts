export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  avatar: string;
  bio: string;
  availability: TimeSlot[];
  consultationFee: number;
  education: Education[];
  certifications: Certification[];
  languages: string[];
  isAvailable: boolean;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Certification {
  name: string;
  issuedBy: string;
  year: string;
}