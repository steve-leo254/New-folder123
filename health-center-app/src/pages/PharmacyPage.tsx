import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Package,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  Star,
  Pill,
  X,
  Zap,
  Minus,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMedications } from '../services/useMedication';
import { formatCurrency } from '../services/formatCurrency';
import { useShoppingCart } from '../services/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import WishlistButton from '../components/ui/WishlistButton';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  strength: string;
  quantity: number;
  stock: number;
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

export const PharmacyPage = ({ patientId: _patientId }: PharmacyPageProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Use CartContext instead of local cart state
  const { 
    addToCart: contextAddToCart, 
    increaseCartQuantity, 
    decreaseCartQuantity, 
    removeFromCart: contextRemoveFromCart, 
    clearCart: contextClearCart,
    getItemQuantity,
    cartItems,
    cartQuantity,
    subtotal,
    deliveryFee,
    total
  } = useShoppingCart();

  // Fetch real medication data from backend
  const { 
    medications: backendMedications, 
    isLoading, 
    fetchMedications, 
    error: medicationsError 
  } = useMedications();

  // Load medications on component mount
  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Helper function to determine form from dosage
  const determineForm = (dosage: string): string => {
    const lower = dosage.toLowerCase();
    if (lower.includes('tablet')) return 'Tablets';
    if (lower.includes('capsule')) return 'Capsules';
    if (lower.includes('syrup') || lower.includes('liquid')) return 'Syrup';
    if (lower.includes('injection')) return 'Injection';
    if (lower.includes('cream') || lower.includes('ointment')) return 'Topical';
    if (lower.includes('drop')) return 'Drops';
    return 'Tablets'; // default
  };

  // Helper function to safely format price using formatCurrency
  const formatPrice = (price: number | string): string => {
    let numericPrice = 0;
    if (typeof price === 'number') {
      numericPrice = price;
    } else if (typeof price === 'string') {
      // Extract price from string - look for $ followed by numbers
      const priceMatch = price.match(/\$(\d+\.?\d*)/);
      if (priceMatch) {
        numericPrice = parseFloat(priceMatch[1]);
      } else {
        // Try to parse as regular number
        numericPrice = parseFloat(price);
      }
    }
    return formatCurrency(isNaN(numericPrice) ? 0 : numericPrice);
  };

  // Convert backend medications to Medication type format
  const medications: Medication[] = useMemo(
    () =>
      backendMedications.map((med) => {
        // Parse side effects from description or use defaults
        const defaultSideEffects = ['Consult your doctor', 'Read package insert'];
        const sideEffects = med.description?.includes('Side effects:') 
          ? med.description.split('Side effects:')[1]?.split(',').map(s => s.trim()) 
          : defaultSideEffects;

        // Calculate expiry date (default 2 years from now if not provided)
        const expiryDate = med.expiryDate 
          ? new Date(med.expiryDate).toISOString().split('T')[0]
          : new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        return {
          id: med.id.toString(),
          name: med.name || 'Unknown Medication',
          genericName: med.name || 'Generic Name',
          // Extract dosage/strength from malformed data
          dosage: (() => {
            let cleanDosage = med.dosage || 'As directed';
            if (typeof med.dosage === 'string' && med.dosage.includes('$')) {
              // Remove price part from malformed strings
              cleanDosage = med.dosage.replace(/\$[\d.]+/, '').trim() || 'As directed';
            }
            return cleanDosage;
          })(),
          form: (() => {
            const cleanDosage = (() => {
              let dosage = med.dosage || 'As directed';
              if (typeof med.dosage === 'string' && med.dosage.includes('$')) {
                dosage = med.dosage.replace(/\$[\d.]+/, '').trim() || 'As directed';
              }
              return dosage;
            })();
            return determineForm(cleanDosage);
          })(),
          strength: (() => {
            let strength = med.dosage || 'N/A';
            if (typeof med.dosage === 'string') {
              // Extract strength from strings like "Ibuprofen$1200.00500mg"
              const strengthMatch = med.dosage.match(/(\d+\.?\d*)mg/);
              if (strengthMatch) {
                strength = `${strengthMatch[1]}mg`;
              } else if (med.dosage.includes('$')) {
                // Remove price part for malformed strings
                strength = med.dosage.replace(/\$[\d.]+/, '').trim() || 'N/A';
              }
            }
            return strength;
          })(),
          quantity: med.stock || 0,
          stock: med.stock || 0,
          // Handle malformed price data - extract price from strings like "Ibuprofen$1200.00500mg"
          price: (() => {
            let parsedPrice = 0;
            if (med.price && typeof med.price === 'string') {
              // Extract price from string - look for $ followed by numbers
              const priceMatch = med.price.match(/\$(\d+\.?\d*)/);
              if (priceMatch) {
                parsedPrice = parseFloat(priceMatch[1]);
              } else {
                // Try to parse as regular number
                parsedPrice = parseFloat(med.price);
              }
            } else if (med.price && typeof med.price === 'number') {
              parsedPrice = med.price;
            }
            return parsedPrice;
          })(),
          category: med.category || 'Other',
          description: med.description || 'Professional medication',
          sideEffects: sideEffects,
          inStock: med.inStock !== false && med.stock > 0,
          requiresPrescription: med.prescriptionRequired || false,
          manufacturer: med.supplier || 'Certified Manufacturer',
          expiryDate: expiryDate,
          rating: 4.5, // Default rating - can be added to backend
          reviews: Math.floor(Math.random() * 2000) + 100, // Random reviews - can be added to backend
          imageUrl: med.image || undefined,
        };
      }),
    [backendMedications]
  );

  const categories = useMemo(
    () => ['all', ...new Set(medications.map((med) => med.category))],
    [medications]
  );
  
  const sortOptions = ['name', 'price-low', 'price-high', 'rating', 'reviews'];

  const filteredMedications = useMemo(
    () =>
      medications
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
        }),
    [medications, searchTerm, selectedCategory, selectedSort]
  );

  // Enhanced addToCart with notification - using CartContext
  const handleAddToCart = (medication: Medication) => {
    contextAddToCart({
      id: parseInt(medication.id),
      name: medication.name,
      price: medication.price,
      img_url: medication.imageUrl || null
    });
    showNotificationMessage(`${medication.name} added to cart`);
  };

  // Local wishlist functions (legacy - can be removed if not needed)
  // const addToWishlist = (medication: Medication) => {
  //   const isInWishlist = wishlist.some((item) => item.id === medication.id);
  //   if (!isInWishlist) {
  //     setWishlist([...wishlist, medication]);
  //     showNotificationMessage(`${medication.name} added to wishlist`);
  //   } else {
  //     removeFromWishlist(medication.id);
  //     showNotificationMessage(`${medication.name} removed from wishlist`);
  //   }
  // };

  // const removeFromWishlist = (medicationId: string) => {
  //   setWishlist(wishlist.filter((item) => item.id !== medicationId));
  // };

  // const isInWishlist = (medicationId: string) => {
  //   return wishlist.some((item) => item.id === medicationId);
  // };

  // Notification function
  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
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

  // Default placeholder image
  const getImageUrl = (imageUrl?: string) => {
    if (imageUrl) return imageUrl;
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop'; // Pharmacy/pills placeholder
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-12">
          <LoadingSpinner message="Loading pharmacy products..." />
        </Card>
      </div>
    );
  }

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
              <button
                onClick={() => setShowCheckout(!showCheckout)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center hover:bg-blue-700 transition-colors"
              >
                <Package className="h-4 w-4 mr-2" />
                {showCheckout ? 'Continue Shopping' : 'View Cart'} ({cartQuantity})
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {medicationsError && (
          <Card className="p-6 mb-6 bg-red-50 border border-red-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">
                  Unable to load medications
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {medicationsError}. Please try again later.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Toast */}
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <p className="text-sm font-medium">{notificationMessage}</p>
          </motion.div>
        )}

        {/* Cart Sidebar */}
        {showCheckout && cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Cart Item Image */}
                  <img
                    src={getImageUrl(item.img_url || undefined)}
                    alt={item.name}
                    onError={handleImageError}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-sm font-medium text-blue-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseCartQuantity(item.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => increaseCartQuantity(item.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => contextRemoveFromCart(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Delivery:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(total)}
                </span>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={contextClearCart}
                className="w-full py-2 mt-2 text-gray-600 hover:text-gray-900 transition-colors"
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
              <div className="text-sm text-gray-600">Delivery Over Ksh 2500</div>
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
                  <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 group overflow-hidden">
                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={getImageUrl(medication.imageUrl)}
                        alt={medication.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Overlay Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {medication.requiresPrescription && (
                          <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-lg">
                            Rx Required
                          </span>
                        )}
                        {!isInStock(medication) && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-lg">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg">
                          {medication.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      {/* Title and Price */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                            onClick={() => navigate(`/medication/${medication.id}`)}>
                            {medication.name}
                          </h3>
                          {medication.genericName !== medication.name && (
                            <p className="text-sm text-gray-500 line-clamp-1">{medication.genericName}</p>
                          )}
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-xl font-bold text-gray-900">
                            {formatPrice(medication.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {medication.dosage}
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
                            {new Date(medication.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Rating and Manufacturer */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 fill-current" />
                          <span className="ml-1 text-sm font-medium text-gray-900">
                            {medication.rating}
                          </span>
                          <span className="ml-1 text-sm text-gray-500">
                            ({medication.reviews})
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Shield className="h-3 w-3 text-blue-600 mr-1" />
                          <span className="line-clamp-1">{medication.manufacturer}</span>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/medication/${medication.id}`)}
                          className="flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View 
                        </button>
                        {getItemQuantity(parseInt(medication.id)) > 0 ? (
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => decreaseCartQuantity(parseInt(medication.id))}
                              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {getItemQuantity(parseInt(medication.id))}
                            </span>
                            <button
                              onClick={() => increaseCartQuantity(parseInt(medication.id))}
                              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(medication)}
                            disabled={!isInStock(medication)}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                              isInStock(medication)
                                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
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
                        )}
                        <WishlistButton 
                          medication={medication}
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* List View Image */}
                      <div className="md:w-48 h-48 md:h-auto relative bg-gray-100 flex-shrink-0">
                        <img
                          src={getImageUrl(medication.imageUrl)}
                          alt={medication.name}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {medication.requiresPrescription && (
                            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-lg">
                              Rx Required
                            </span>
                          )}
                          {!isInStock(medication) && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-lg">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {medication.category}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatPrice(medication.price)}
                                </div>
                                <div className="text-sm text-gray-500">{medication.dosage}</div>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate(`/medication/${medication.id}`)}>{medication.name}</h3>
                            {medication.genericName !== medication.name && (
                              <p className="text-sm text-gray-500 mb-2">{medication.genericName}</p>
                            )}
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medication.description}</p>

                            {/* Details Row */}
                            <div className="flex flex-wrap gap-4 mb-3">
                              <div className="flex items-center text-sm">
                                <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                                <span className="font-medium">{medication.rating}</span>
                                <span className="text-gray-500 ml-1">({medication.reviews})</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Shield className="h-4 w-4 text-blue-600 mr-1" />
                                <span className="text-gray-600">{medication.manufacturer}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Package className="h-4 w-4 text-gray-400 mr-1" />
                                <span
                                  className={`font-medium ${
                                    isInStock(medication) ? 'text-emerald-600' : 'text-red-600'
                                  }`}
                                >
                                  {isInStock(medication)
                                    ? `${medication.quantity} in stock`
                                    : 'Out of Stock'}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t">
                              <button
                                onClick={() => navigate(`/medication/${medication.id}`)}
                                className="py-2 px-4 rounded-lg font-medium transition-all flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                              {getItemQuantity(parseInt(medication.id)) > 0 ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => decreaseCartQuantity(parseInt(medication.id))}
                                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-8 text-center font-semibold">
                                    {getItemQuantity(parseInt(medication.id))}
                                  </span>
                                  <button
                                    onClick={() => increaseCartQuantity(parseInt(medication.id))}
                                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(medication)}
                                  disabled={!isInStock(medication)}
                                  className={`py-2 px-6 rounded-lg font-medium transition-all flex items-center ${
                                    isInStock(medication)
                                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
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
                              )}
                              <WishlistButton 
                                medication={medication}
                                size="md"
                              />
                            </div>
                          </div>
                        </div>
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
                {medicationsError 
                  ? 'Unable to load medications. Please try again later.' 
                  : searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No medications available in this category.'}
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              className="bg-white rounded-xl shadow p-6 text-center hover:shadow-lg transition-shadow"
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