import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Shield } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CheckoutForm from '../components/features/checkoutForm';
import { useShoppingCart } from '../services/CartContext';
import { formatCurrency } from '../services/formatCurrency';

const CheckoutPage: React.FC = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const cart = useShoppingCart();

  // Provide defaults if context is not available
  const cartItems = cart?.cartItems || [];
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = cart?.deliveryFee || 0;

  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your medication order</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Your cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.img_url && <p className="text-sm text-gray-600">Product</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your delivery address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Postal Code"
                  />
                </div>
              </div>
            </div>
          </Card>

          {showPaymentForm && (
            <CheckoutForm onClose={() => setShowPaymentForm(false)} />
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Total</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (16%)</span>
                <span>{formatCurrency(Math.round(tax))}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(Math.round(total))}</span>
                </div>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              onClick={() => setShowPaymentForm(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>
          </Card>

          <Card className="p-6 bg-blue-50">
            <div className="flex items-start space-x-3">
              <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Free Delivery</h3>
                <p className="text-sm text-gray-600 mt-1">On orders above $50</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-50">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-600 mt-1">Your payment information is safe and encrypted</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;