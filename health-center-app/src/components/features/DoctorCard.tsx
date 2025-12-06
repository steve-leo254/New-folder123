import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Video } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Doctor } from '../../types';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        <div className="relative">
          <img
            src={doctor.avatar}
            alt={doctor.firstName}
            className="w-full h-48 object-cover"
          />
          <Badge variant="primary" className="absolute top-4 right-4">
            {doctor.specialization}
          </Badge>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-gray-600 mb-4">{doctor.bio}</p>
          
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(doctor.rating) ? 'fill-current' : ''
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">{doctor.rating}</span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              Nairobi, Kenya
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {doctor.experience} years experience
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Video className="w-4 h-4 mr-2" />
              Available for video consultation
            </div>
          </div>
          
          {doctor.consultationFee && doctor.consultationFee > 0 && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-primary-600">
                KSH {doctor.consultationFee.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">per consultation</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Link to={`/appointments?doctor=${doctor.id}`} className="flex-1">
              <Button className="w-full">Book Appointment</Button>
            </Link>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DoctorCard;