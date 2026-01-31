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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    
    // Auto-format expiry date
    if (name === 'expiryDate') {
      // Remove any non-digit characters
      processedValue = value.replace(/\D/g, '');
      
      // Add slash after 2 digits
      if (processedValue.length >= 2) {
        processedValue = processedValue.slice(0, 2) + '/' + processedValue.slice(2, 4);
      }
      
      // Limit to MM/YY format
      processedValue = processedValue.slice(0, 5);
    }
    
    // Auto-format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      processedValue = value.replace(/\s/g, '').replace(/\D/g, '');
      const groups = processedValue.match(/.{1,4}/g) || [];
      processedValue = groups.join(' ');
      processedValue = processedValue.slice(0, 19); // Max 19 chars for 16 digits + 3 spaces
    }
    
    // Limit CVV to 4 digits
    if (name === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
      setAlertMessage('Please fill in all required fields');
      setShowAlert(true);
      return;
    }
    
    // Validate expiry date
    const [month, year] = formData.expiryDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      setAlertMessage('Invalid expiry month');
      setShowAlert(true);
      return;
    }
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      setAlertMessage('Card has expired');
      setShowAlert(true);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success alert
      setAlertMessage('Payment successful! Order confirmed.');
      setShowAlert(true);
      
      // Close form after success
      setTimeout(() => {
        onClose();
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      setAlertMessage('Payment failed. Please try again.');
      setShowAlert(true);
      setIsProcessing(false);
    }
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
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            </div>
            
            {/* Alert */}
            {showAlert && (
              <div className={`mt-4 p-3 rounded-lg ${
                alertMessage.includes('successful') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-sm">{alertMessage}</span>
                  <button
                    onClick={() => setShowAlert(false)}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CheckoutForm;