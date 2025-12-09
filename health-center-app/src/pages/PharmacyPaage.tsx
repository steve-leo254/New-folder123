import { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  Package, 
  Truck, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Heart,
  Activity,
  Pill,
  FilterX,
  Stethoscope,
  Zap,
  Download
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

interface PharmacyPageProps {
  patientId?: string;
}

export const PharmacyPage = ({ patientId }: PharmacyPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name');
  const [cart, setCart] = useState<Array<{medication: Medication, quantity: number}>>([]);
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
      imageUrl: 'https://images.unsplash.com/photo-1584308582753-4b8c2a6a9f6e9?w=400&h=300&fit=crop'
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
      imageUrl: 'https://images.unsplash.com/photo-1587830148395-4b8c2a6a9f6e9?w=400&h=300&fit=crop'
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
      description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain relief and fever reduction',
      sideEffects: ['Stomach upset', 'Headache', 'Dizziness'],
      inStock: true,
      requiresPrescription: false,
      manufacturer: 'Advil',
      expiryDate: '2025-08-15',
      rating: 4.3,
      reviews: 2341,
      imageUrl: 'https://images.unsplash.com/photo-1584308582753-4b8c2a6a9f6e9?w=400&h=300&fit=crop'
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
      imageUrl: 'https://images.unsplash.com/photo-1606496580722-dd4a291d0949399e4?w=400&h=300&fit=crop'
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
      imageUrl: 'https://images.unsplash.com/photo-1587830148395-4b8c2a6a9f6e9?w=400&h=300&fit=crop'
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
      imageUrl: 'https://images.unsplash.com/photo-1587830148395-4b8c2a6a9f6e9?w=400&h=300&fit=crop'
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
      imageUrl: 'https://images.unsplash.com/photo-1584308582753-4b8c2a6a9f6e9?w=400&h=300&fit=crop'
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
      description: 'Salicylate drug used for pain relief, fever reduction, and blood thinning',
      sideEffects: ['Stomach irritation', 'Bleeding', 'Tinnitus'],
      inStock: true,
      requiresPrescription: false,
      manufacturer: 'Bayer',
      expiryDate: '2026-01-31',
      rating: 4.1,
      reviews: 3456,
      imageUrl: 'https://images.unsplash.com/photo-1584308582753-4b8c2a6a9f6e9?w=400&h=300&fit=crop'
    }
  ]);

  const categories = ['all', ...Array.from(new Set(medications.map(med => med.category)))];
  const sortOptions = ['name', 'price-low', 'price-high', 'rating', 'reviews'];

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || medication.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
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
    const existingItem = cart.find(item => item.medication.id === medication.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.medication.id === medication.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medication, quantity: 1 }]);
    }
  };

  const updateQuantity = (medicationId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.medication.id !== medicationId));
    } else {
      setCart(cart.map(item =>
        item.medication.id === medicationId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (medicationId: string) => {
    setCart(cart.filter(item => item.medication.id !== medicationId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.medication.price * item.quantity), 0);
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

  const activeFiltersCount = [
    searchTerm !== '',
    selectedCategory !== 'all'
  ].filter(Boolean).length;

  const isInStock = (medication: Medication) => {
    const today = new Date();
    const expiryDate = new Date(medication.expiryDate);
    return expiryDate > today;
  };

  return (
    <div className="min-h-screen gradient-medical">
      <div className="container-medical py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="heading-1 text-secondary-900 mb-2">
                Online Pharmacy
              </h1>
              <p className="text-body text-secondary-600">
                Order medications and health products with fast delivery
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowCheckout(!showCheckout)}
                className="btn-primary text-sm flex items-center"
              >
                <Package className="h-4 w-4 mr-2" />
                {showCheckout ? 'Continue Shopping' : 'View Cart'} ({getTotalItems()})
              </button>
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="card-elevated p-6 mb-8">
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Search Medications
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, generic, or condition..."
                  className="input pl-12 pr-4"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    <FilterX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="input appearance-none"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>
                    {option.replace('-', ' ').replace(/\b\w/g, (match) => match.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                View
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1 w-4 h-4">
                      <div className="w-2 h-2 bg-current rounded-sm"></div>
                      <div className="w-2 h-2 bg-current rounded-sm"></div>
                      <div className="w-2 h-2 bg-current rounded-sm"></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                    viewMode === 'list'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="space-y-1 w-4">
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                      <div className="w-full h-0.5 bg-current rounded-sm"></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Stats */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center px-4 py-2 bg-blue-50 rounded-lg">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-lg font-bold text-blue-900">{filteredMedications.length}</div>
              <div className="text-sm text-blue-700">Products Available</div>
            </div>
          </div>
          <div className="flex items-center px-4 py-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
            <div>
              <div className="text-lg font-bold text-emerald-900">
                {medications.filter(med => med.requiresPrescription).length}
              </div>
              <div className="text-sm text-emerald-700">Prescription Required</div>
            </div>
          </div>
          <div className="flex items-center px-4 py-2 bg-amber-50 rounded-lg">
            <Truck className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <div className="text-lg font-bold text-amber-900">
                {medications.filter(med => !isInStock(med)).length}
              </div>
              <div className="text-sm text-amber-700">Out of Stock</div>
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
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredMedications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {viewMode === 'grid' ? (
                  <div className="card-elevated p-6 hover:shadow-large transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {medication.requiresPrescription && (
                            <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full mr-2">
                              Rx Required
                            </div>
                          )}
                          {!isInStock(medication) && (
                            <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full mr-2">
                              Out of Stock
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-secondary-900 mb-1">
                            ${medication.price}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {medication.dosage} • {medication.form}
                          </div>
                        </div>
                      </div>

                      <h3 className="heading-3 text-secondary-900 mb-2 group-hover:text-primary-700 transition-colors">
                        {medication.name}
                      </h3>
                      <p className="text-sm text-secondary-600 mb-1">
                        {medication.genericName}
                      </p>
                      <p className="text-sm text-secondary-600 mb-4">
                        {medication.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">Form</p>
                          <div className="text-sm font-medium text-secondary-900">
                            {medication.form}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500 mb-1">Strength</p>
                          <div className="text-sm font-medium text-secondary-900">
                            {medication.strength}
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-sm text-secondary-500 mb-1">Category</p>
                        <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {medication.category}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-secondary-500 mb-1">Stock</p>
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            isInStock(medication) ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {isInStock(medication) ? `${medication.quantity} units` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                        <span className="ml-1 text-sm font-medium text-secondary-900">
                          {medication.rating} ({medication.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-primary-600 mr-2" />
                        <span className="text-sm text-secondary-500">
                          {medication.manufacturer}
                        </span>
                      </div>
                    </div>

                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-secondary-500 mb-2">Side Effects</p>
                        <div className="flex flex-wrap gap-2">
                          {medication.sideEffects.slice(0, 3).map((effect, idx) => (
                            <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">
                              {effect}
                            </span>
                          ))}
                          {medication.sideEffects.length > 3 && (
                            <span className="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">
                              +{medication.sideEffects.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    )}

                    <div className="border-t pt-4">
                      <p className="text-sm text-secondary-500 mb-2">Expiry Date</p>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-secondary-400 mr-2" />
                        <span className={`font-medium ${
                          new Date(medication.expiryDate) > new Date() 
                            ? 'text-emerald-600' 
                            : 'text-red-600'
                        }`}>
                          {medication.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => addToCart(medication)}
                      disabled={!isInStock(medication)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        isInStock(medication)
                          ? 'btn-primary hover:shadow-medium group'
                          : 'btn-secondary cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isInStock(medication) ? (
                        <>
                          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          Add to Cart
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Out of Stock
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => addToCart(medication)}
                      disabled={!isInStock(medication)}
                      className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-50"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-compact p-6 hover:shadow-medium transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="heading-3 text-secondary-900 mb-2 group-hover:text-primary-700 transition-colors">
                      {medication.name}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-1">
                      {medication.genericName}
                    </p>
                    <p className="text-sm text-secondary-600 mb-4">
                      {medication.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Form & Strength</p>
                        <div className="text-sm font-medium text-secondary-900">
                          {medication.dosage} • {medication.strength}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500 mb-1">Price</p>
                        <div className="text-lg font-bold text-secondary-900">
                          ${medication.price}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-secondary-500 mb-1">Stock Status</p>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isInStock(medication) 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isInStock(medication) ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-secondary-500 mb-1">Rating</p>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                          <span className="font-medium text-secondary-900">
                            {medication.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => addToCart(medication)}
                      disabled={!isInStock(medication)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        isInStock(medication)
                          ? 'btn-primary hover:shadow-medium group'
                          : 'btn-secondary cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isInStock(medication) ? (
                        <>
                          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                          Add to Cart
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Out of Stock
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => addToCart(medication)}
                      disabled={!isInStock(medication)}
                      className="p-2 text-secondary-400 hover:text-secondary-600 disabled:opacity-50"
                    >
                      <Heart className="h-4 w-4" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="heading-2 text-secondary-900 mb-4">
                No Medications Found
              </h3>
              <p className="text-body text-secondary-600 mb-8">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No medications available in this category.'
                }
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {[
            {
              icon: Package,
              label: 'Total Products',
              value: medications.length,
              color: 'blue'
            },
            {
              icon: Pill,
              label: 'Prescription Items',
              value: medications.filter(med => med.requiresPrescription).length,
              color: 'green'
            },
            {
              icon: Zap,
              label: 'Fast Delivery',
              value: medications.filter(med => isInStock(med)).length,
              color: 'emerald'
            },
            {
              icon: Shield,
              label: 'In Stock',
              value: medications.filter(med => isInStock(med)).length,
              color: 'purple'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="text-center"
            >
              <div className={`w-16 h-16 bg-${stat.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
              <div className="text-2xl font-bold text-secondary-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-secondary-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};