import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Trash2, Pill, AlertCircle } from 'lucide-react';
import Card from '../../ui/Card';
import { useMedicalInfo, MedicalInfo } from '../../../services/useMedicalInfo';

interface MedicalInfoSectionProps {
  isEditing: boolean;
}

export const MedicalInfoSection: React.FC<MedicalInfoSectionProps> = ({ isEditing }) => {
  const { medicalInfo, loading, error, updateMedicalInfo, addItem, removeItem } = useMedicalInfo();
  const [formData, setFormData] = useState<MedicalInfo>({
    bloodType: '',
    height: '',
    weight: '',
    allergies: [],
    conditions: [],
    medications: [],
  });
  const [newItems, setNewItems] = useState({
    allergy: '',
    condition: '',
    medication: '',
  });

  // Update local form data when medical info changes
  useEffect(() => {
    if (medicalInfo) {
      setFormData({
        ...medicalInfo,
        allergies: medicalInfo.allergies || [],
        conditions: medicalInfo.conditions || [],
        medications: medicalInfo.medications || [],
      });
    }
  }, [medicalInfo]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save medical info
  const handleSave = async () => {
    const result = await updateMedicalInfo(formData);
    if (!result.success) {
      // Handle error - you could show a toast or alert here
      console.error('Failed to update medical info:', result.error);
    }
  };

  // Add item to arrays
  const handleAddItem = async (type: 'allergies' | 'conditions' | 'medications', value: string) => {
    if (!value.trim()) return;
    
    const result = await addItem(
      type === 'allergies' ? 'allergy' : 
      type === 'conditions' ? 'condition' : 'medication', 
      value
    );
    
    if (result.success) {
      setNewItems(prev => ({
        ...prev,
        [type === 'allergies' ? 'allergy' : type === 'conditions' ? 'condition' : 'medication']: '',
      }));
    } else {
      console.error(`Failed to add ${type}:`, result.error);
    }
  };

  // Remove item from arrays
  const handleRemoveItem = async (type: 'allergies' | 'conditions' | 'medications', index: number) => {
    const result = await removeItem(
      type === 'allergies' ? 'allergy' : 
      type === 'conditions' ? 'condition' : 'medication', 
      index
    );
    
    if (!result.success) {
      console.error(`Failed to remove ${type}:`, result.error);
    }
  };

  // Auto-save when editing stops
  useEffect(() => {
    if (!isEditing && medicalInfo && JSON.stringify(formData) !== JSON.stringify(medicalInfo)) {
      handleSave();
    }
  }, [isEditing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Medical Info</h3>
        <p className="text-gray-600">{error}</p>
      </Card>
    );
  }
  return (
    <motion.div
      key="medical"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Basic Health Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Health Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Type
            </label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <input
              type="text"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., 5'10&quot;"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight
            </label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., 175 lbs"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </Card>

      {/* Allergies */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
          {isEditing && (
            <span className="text-sm text-gray-500">Click item to remove</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(formData.allergies || []).map((allergy, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => isEditing && handleRemoveItem('allergies', index)}
              className={`px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center ${
                isEditing ? 'cursor-pointer hover:bg-red-200' : ''
              }`}
            >
              {allergy}
              {isEditing && <X className="h-3 w-3 ml-1" />}
            </motion.span>
          ))}
          {(formData.allergies || []).length === 0 && (
            <span className="text-gray-500 text-sm">No allergies recorded</span>
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newItems.allergy}
              onChange={(e) => setNewItems(prev => ({ ...prev, allergy: e.target.value }))}
              placeholder="Add new allergy..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem('allergies', newItems.allergy);
                }
              }}
            />
            <button
              onClick={() => handleAddItem('allergies', newItems.allergy)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </Card>

      {/* Medical Conditions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medical Conditions</h3>
          {isEditing && (
            <span className="text-sm text-gray-500">Click item to remove</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(formData.conditions || []).map((condition, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => isEditing && handleRemoveItem('conditions', index)}
              className={`px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center ${
                isEditing ? 'cursor-pointer hover:bg-amber-200' : ''
              }`}
            >
              {condition}
              {isEditing && <X className="h-3 w-3 ml-1" />}
            </motion.span>
          ))}
          {(formData.conditions || []).length === 0 && (
            <span className="text-gray-500 text-sm">No conditions recorded</span>
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newItems.condition}
              onChange={(e) => setNewItems(prev => ({ ...prev, condition: e.target.value }))}
              placeholder="Add new condition..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem('conditions', newItems.condition);
                }
              }}
            />
            <button
              onClick={() => handleAddItem('conditions', newItems.condition)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </Card>

      {/* Current Medications */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
        </div>
        <div className="space-y-2 mb-4">
          {(formData.medications || []).map((medication, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center justify-between p-3 bg-blue-50 rounded-lg ${
                isEditing ? 'hover:bg-blue-100' : ''
              }`}
            >
              <div className="flex items-center">
                <Pill className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">{medication}</span>
              </div>
              {isEditing && (
                <button
                  onClick={() => handleRemoveItem('medications', index)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))}
          {(formData.medications || []).length === 0 && (
            <span className="text-gray-500 text-sm">No medications recorded</span>
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newItems.medication}
              onChange={(e) => setNewItems(prev => ({ ...prev, medication: e.target.value }))}
              placeholder="Add new medication (e.g., Aspirin 81mg)..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem('medications', newItems.medication);
                }
              }}
            />
            <button
              onClick={() => handleAddItem('medications', newItems.medication)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
