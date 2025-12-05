import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    category: string;
    dosage?: string;
    price: number;
    stock: number;
    description?: string;
    prescription_required?: boolean;
    expiry_date?: string;
    batch_number?: string;
    supplier?: string;
  }) => Promise<void>;
}

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    dosage: '',
    price: 0,
    stock: 0,
    description: '',
    prescription_required: false,
    expiry_date: '',
    batch_number: '',
    supplier: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const categories = [
    'Antibiotics',
    'Pain Relief',
    'Vitamins',
    'Heart Health',
    'Digestive Health',
    'Cold & Flu',
    'Supplements',
    'Other',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Medication name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.price < 0) newErrors.price = 'Price must be a positive number';
    if (formData.stock < 0) newErrors.stock = 'Stock must be a positive number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        category: '',
        dosage: '',
        price: 0,
        stock: 0,
        description: '',
        prescription_required: false,
        expiry_date: '',
        batch_number: '',
        supplier: '',
      });
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Failed to add medication';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Medication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <Alert type="error" message={serverError} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Amoxicillin"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 500mg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                placeholder="e.g., BATCH001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g., Pharma Corp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter medication description..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Prescription Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="prescription_required"
              name="prescription_required"
              checked={formData.prescription_required}
              onChange={handleChange}
              className="rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            <label htmlFor="prescription_required" className="ml-2 text-sm text-gray-700 cursor-pointer">
              Prescription Required
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Medication'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModal;
