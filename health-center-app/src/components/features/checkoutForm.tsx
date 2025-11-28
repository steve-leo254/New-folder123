import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CheckoutFormProps {
  onClose: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process payment
    console.log('Processing payment:', formData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg mb-4">
              <Lock className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Secure payment powered by Stripe</span>
            </div>

            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleInputChange}
              name="cardNumber"
              required
            />

            <Input
              label="Cardholder Name"
              placeholder="John Doe"
              value={formData.cardName}
              onChange={handleInputChange}
              name="cardName"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleInputChange}
                name="expiryDate"
                required
              />
              <Input
                label="CVV"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                name="cvv"
                required
              />
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="saveCard"
                checked={formData.saveCard}
                onChange={handleInputChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Save card for future purchases</span>
            </label>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CheckoutForm;