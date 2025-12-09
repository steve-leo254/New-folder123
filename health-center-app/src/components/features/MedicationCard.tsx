import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Medication } from '../../types';
import { formatCurrency } from '../../services/formatCurrency';
import { useShoppingCart } from '../../services/CartContext';

interface MedicationCardProps {
  medication: Medication;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
  const { addToCart, getItemQuantity, increaseCartQuantity, decreaseCartQuantity } = useShoppingCart();
  const quantity = getItemQuantity(parseInt(medication.id));

  const handleAddToCart = () => {
    addToCart({
      id: parseInt(medication.id),
      name: medication.name,
      price: medication.price,
      img_url: medication.image_url || null,
    });
  };

  const handleIncreaseQuantity = () => {
    increaseCartQuantity(parseInt(medication.id));
  };

  const handleDecreaseQuantity = () => {
    decreaseCartQuantity(parseInt(medication.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        {medication.image_url && medication.image_url !== "" ? (
          <div className="w-full h-48 bg-gray-200 overflow-hidden">
            <img 
              src={medication.image_url.startsWith('http') ? medication.image_url : `http://localhost:8000${medication.image_url}`} 
              alt={medication.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}
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
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary-600">{formatCurrency(medication.price)}</span>
              <span className="text-sm text-gray-600">Per Unit</span>
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
            {quantity > 0 ? (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleDecreaseQuantity}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="flex-1 text-center font-semibold text-gray-900">
                  {quantity} in cart
                </span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <Button 
                className="w-full" 
                disabled={!medication.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {medication.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MedicationCard;