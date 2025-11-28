import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, AlertCircle, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Medication } from '../../types';

interface MedicationCardProps {
  medication: Medication;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{medication.name}</h3>
              <p className="text-sm text-gray-600">{medication.description}</p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge variant={medication.inStock ? 'success' : 'error'}>
                {medication.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
              {medication.prescriptionRequired && (
                <Badge variant="warning">Prescription Required</Badge>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dosage:</span>
              <span className="font-medium">{medication.dosage}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frequency:</span>
              <span className="font-medium">{medication.frequency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{medication.duration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{medication.category}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-primary-600">${medication.price}</span>
              <span className="text-sm text-gray-600 ml-1">per course</span>
            </div>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-600">4.5</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              className="w-full" 
              disabled={!medication.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {medication.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            
            {medication.prescriptionRequired && (
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="w-4 h-4 mr-2" />
                Valid prescription required
              </div>
            )}
            
            {medication.inStock && (
              <div className="flex items-center text-sm text-green-600">
                <Check className="w-4 h-4 mr-2" />
                Fast delivery available
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MedicationCard;