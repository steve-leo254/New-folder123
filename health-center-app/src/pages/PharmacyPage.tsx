import { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Package,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Pill,
  X,
  Zap,
  Minus,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  strength: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
  sideEffects: string[];
  inStock: boolean;
  requiresPrescription: boolean;
  manufacturer: string;
  expiryDate: string;
  rating: number;
  reviews: number;
  imageUrl?: string;
}

interface CartItem {
  medication: Medication;
  quantity: number;
}

interface PharmacyPageProps {
  patientId?: string;
}

export const PharmacyPage = ({ patientId: _patientId }: PharmacyPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCheckout, setShowCheckout] = useState(false);

  // Mock pharmacy data
  const [medications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Amoxicillin',
      genericName: 'Amoxicillin Trihydrate',
      dosage: '500mg',
      form: 'Capsules',
      strength: '500mg',
      quantity: 20,
      price: 12.99,
      category: 'Antibiotics',
      description: 'Broad-spectrum antibiotic used to treat bacterial infections',
      sideEffects: ['Nausea', 'Diarrhea', 'Rash'],
      inStock: true,
      requiresPrescription: true,
      manufacturer: 'Pfizer',
      expiryDate: '2025-12-31',
      rating: 4.5,
      reviews: 1247,
    },
    {
      id: '2',
      name: 'Lisinopril',
      genericName: 'Lisinopril Dihydrate',
      dosage: '10mg',
      form: 'Tablets',
      strength: '10mg',
      quantity: 30,
      price: 15.99,
      category: 'Blood Pressure',
      description: 'ACE inhibitor used to treat high blood pressure and heart failure',
      sideEffects: ['Dry cough', 'Dizziness', 'Headache'],
      inStock: true,
      requiresPrescription: true,
      manufacturer: 'Merck',
      expiryDate: '2026-06-30',
      rating: 4.7,
      reviews: 892,
    },
    {
      id: '3',
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      dosage: '400mg',
      form: 'Tablets',
      strength: '400mg',
      quantity: 50,
      price: 8.99,
      category: 'Pain Relief',
      description:
        'Nonsteroidal anti-inflammatory drug (NSAID) used for pain relief and fever reduction',
      sideEffects: ['Stomach upset', 'Headache', 'Dizziness'],
      inStock: true,
      requiresPrescription: false,
      manufacturer: 'Advil',
      expiryDate: '2025-08-15',
      rating: 4.3,
      reviews: 2341,
    },
    {
      id: '4',
      name: 'Vitamin D3',
      genericName: 'Cholecalciferol',
      dosage: '1000 IU',
      form: 'Softgels',
      strength: '1000 IU',
      quantity: 60,
      price: 9.99,
      category: 'Vitamins',
      description: 'Essential vitamin for bone health and immune function',
      sideEffects: ['Generally well tolerated'],
      inStock: true,
      requiresPrescription: false,
      manufacturer: 'Nature Made',
      expiryDate: '2026-12-31',
      rating: 4.8,
      reviews: 567,
    },
    {
      id: '5',
      name: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      dosage: '500mg',
      form: 'Extended-Release Tablets',
      strength: '500mg',
      quantity: 25,
      price: 18.99,
      category: 'Diabetes',
      description: 'First-line medication for type 2 diabetes',
      sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
      inStock: true,
      requiresPrescription: true,
      manufacturer: 'Bristol-Myers Squibb',
      expiryDate: '2025-03-15',
      rating: 4.6,
      reviews: 1789,
    },
    {
      id: '6',
      name: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      dosage: '20mg',
      form: 'Tablets',
      strength: '20mg',
      quantity: 15,
      price: 45.99,
      category: 'Cholesterol',
      description: 'Statin medication used to lower cholesterol levels',
      sideEffects: ['Muscle pain', 'Headache', 'Nausea'],
      inStock: true,
      requiresPrescription: true,
      manufacturer: 'Pfizer',
      expiryDate: '2026-09-30',
      rating: 4.4,
      reviews: 456,
    },
    {
      id: '7',
      name: 'Omeprazole',
      genericName: 'Omeprazole Magnesium',
      dosage: '20mg',
      form: 'Delayed-Release Capsules',
      strength: '20mg',
      quantity: 40,
      price: 14.99,
      category: 'Stomach',
      description: 'Proton pump inhibitor used to treat GERD and stomach ulcers',
      sideEffects: ['Headache', 'Diarrhea', 'Nausea'],
      inStock: true,
      requiresPrescription: true,
      manufacturer: 'AstraZeneca',
      expiryDate: '2025-11-30',
      rating: 4.2,
      reviews: 1234,
    },
    {
      id: '8',
      name: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      dosage: '81mg',
      form: 'Enteric-Coated Tablets',
      strength: '81mg',
      quantity: 100,
      price: 4.99,
      category: 'Pain Relief',
      description:
        'Salicylate drug used for pain relief, fever reduction, and blood thinning',
      sideEffects: ['Stomach irritation', 'Bleeding', 'Tinnitus'],
      inStock: true,
      requiresPrescription: false,
      manufacturer: 'Bayer',
      expiryDate: '2026-01-31',
      rating: 4.1,
      reviews: 3456,
    },
  ]);

  const categories = ['all', ...Array.from(new Set(medications.map((med) => med.category)))];
  const sortOptions = ['name', 'price-low', 'price-high', 'rating', 'reviews'];

  const filteredMedications = medications
    .filter((medication) => {
      const matchesSearch =
        medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || medication.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

  const addToCart = (medication: Medication) => {
    const existingItem = cart.find((item) => item.medication.id === medication.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.medication.id === medication.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { medication, quantity: 1 }]);
    }
  };

  const updateQuantity = (medicationId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.medication.id !== medicationId));
    } else {
      setCart(
        cart.map((item) =>
          item.medication.id === medicationId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (medicationId: string) => {
    setCart(cart.filter((item) => item.medication.id !== medicationId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.medication.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSort('name');
  };

  const isInStock = (medication: Medication) => {
    const today = new Date();
    const expiryDate = new Date(medication.expiryDate);
    return expiryDate > today && medication.inStock;
  };

  const formatSortLabel = (option: string) => {
    return option
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Online Pharmacy</h1>
              <p className="text-gray-600">
                Order medications and health products with fast delivery
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowCheckout(!showCheckout)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center hover:bg-blue-700"
              >
                <Package className="h-4 w-4 mr-2" />
                {showCheckout ? 'Continue Shopping' : 'View Cart'} ({getTotalItems()})
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Cart Sidebar */}
        {showCheckout && cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.medication.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.medication.name}</h3>
                    <p className="text-sm text-gray-500">{item.medication.dosage}</p>
                    <p className="text-sm font-medium text-blue-600">
                      ${item.medication.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.medication.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.medication.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.medication.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full py-2 mt-2 text-gray-600 hover:text-gray-900"
              >
                Clear Cart
              </button>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Medications
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, generic, or condition..."
                  className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatSortLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-3 px-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                    viewMode === 'grid'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  </div>
                  <span className="ml-2 text-sm">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-3 px-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                    viewMode === 'list'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-1 w-4">
                    <div className="w-full h-0.5 bg-current rounded-sm"></div>
                    <div className="w-full h-0.5 bg-current rounded-sm"></div>
                    <div className="w-full h-0.5 bg-current rounded-sm"></div>
                  </div>
                  <span className="ml-2 text-sm">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center px-4 py-3 bg-white rounded-xl shadow">
            <Package className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <div className="text-lg font-bold text-gray-900">
                {filteredMedications.length}
              </div>
              <div className="text-sm text-gray-600">Products Available</div>
            </div>
          </div>
          <div className="flex items-center px-4 py-3 bg-white rounded-xl shadow">
            <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
            <div>
              <div className="text-lg font-bold text-gray-900">
                {medications.filter((med) => med.requiresPrescription).length}
              </div>
              <div className="text-sm text-gray-600">Prescription Required</div>
            </div>
          </div>
          <div className="flex items-center px-4 py-3 bg-white rounded-xl shadow">
            <Truck className="h-5 w-5 text-amber-600 mr-3" />
            <div>
              <div className="text-lg font-bold text-gray-900">Free</div>
              <div className="text-sm text-gray-600">Delivery Over $50</div>
            </div>
          </div>
        </div>

        {/* Medications Display */}
        {filteredMedications.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={
              viewMode === 'grid'
                ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredMedications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-300 group">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {medication.requiresPrescription && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          Rx Required
                        </span>
                      )}
                      {!isInStock(medication) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Out of Stock
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {medication.category}
                      </span>
                    </div>

                    {/* Title and Price */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {medication.name}
                        </h3>
                        <p className="text-sm text-gray-500">{medication.genericName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ${medication.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {medication.dosage} • {medication.form}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {medication.description}
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Form</p>
                        <p className="text-sm font-medium text-gray-900">{medication.form}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Strength</p>
                        <p className="text-sm font-medium text-gray-900">{medication.strength}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p
                          className={`text-sm font-medium ${
                            isInStock(medication) ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {isInStock(medication)
                            ? `${medication.quantity} units`
                            : 'Out of Stock'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expires</p>
                        <p className="text-sm font-medium text-gray-900">
                          {medication.expiryDate}
                        </p>
                      </div>
                    </div>

                    {/* Rating and Manufacturer */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {medication.rating}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({medication.reviews})
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Shield className="h-4 w-4 text-blue-600 mr-1" />
                        {medication.manufacturer}
                      </div>
                    </div>

                    {/* Side Effects */}
                    {medication.sideEffects.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Common Side Effects</p>
                        <div className="flex flex-wrap gap-1">
                          {medication.sideEffects.slice(0, 3).map((effect, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {effect}
                            </span>
                          ))}
                          {medication.sideEffects.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{medication.sideEffects.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <button
                        onClick={() => addToCart(medication)}
                        disabled={!isInStock(medication)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                          isInStock(medication)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isInStock(medication) ? (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Cart
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Out of Stock
                          </>
                        )}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {medication.requiresPrescription && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              Rx Required
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {medication.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{medication.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">{medication.genericName}</p>
                        <p className="text-sm text-gray-600">{medication.description}</p>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-6 md:gap-8">
                        <div>
                          <p className="text-xs text-gray-500">Dosage</p>
                          <p className="text-sm font-medium text-gray-900">
                            {medication.dosage}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${medication.price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rating</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                            <span className="ml-1 text-sm font-medium">{medication.rating}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Stock</p>
                          <p
                            className={`text-sm font-medium ${
                              isInStock(medication) ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {isInStock(medication) ? 'In Stock' : 'Out of Stock'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(medication)}
                          disabled={!isInStock(medication)}
                          className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center ${
                            isInStock(medication)
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isInStock(medication) ? (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </>
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Heart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Medications Found</h3>
              <p className="text-gray-600 mb-8">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No medications available in this category.'}
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            {
              icon: Package,
              label: 'Total Products',
              value: medications.length,
              bgColor: 'bg-blue-100',
              iconColor: 'text-blue-600',
            },
            {
              icon: Pill,
              label: 'Prescription Items',
              value: medications.filter((med) => med.requiresPrescription).length,
              bgColor: 'bg-green-100',
              iconColor: 'text-green-600',
            },
            {
              icon: Zap,
              label: 'Fast Delivery',
              value: 'Same Day',
              bgColor: 'bg-amber-100',
              iconColor: 'text-amber-600',
            },
            {
              icon: Shield,
              label: 'In Stock',
              value: medications.filter((med) => isInStock(med)).length,
              bgColor: 'bg-purple-100',
              iconColor: 'text-purple-600',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="bg-white rounded-xl shadow p-6 text-center"
            >
              <div
                className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PharmacyPage;
