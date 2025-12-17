import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  AlertCircle,
  Star,
  Filter,
  Grid,
  List,
  ChevronRight,
  Calendar,
  Tag,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/services/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { useWishlist, type WishlistItem } from '../services/useWishlist';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  // Use real wishlist service
  const { wishlistItems, isLoading, error, removeFromWishlist, clearWishlist } = useWishlist();

  const categories: string[] = ['all', ...new Set(wishlistItems.map((item: WishlistItem) => item.category))];

  const filteredItems: WishlistItem[] = wishlistItems
    .filter((item: WishlistItem) => selectedCategory === 'all' || item.category === selectedCategory)
    .sort((a: WishlistItem, b: WishlistItem) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const removeFromWishlistHandler = async (id: string | number) => {
    try {
      await removeFromWishlist(id);
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
    }
  };

  const clearWishlistHandler = async () => {
    try {
      await clearWishlist();
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
    }
  };

  const getAvailabilityColor = (availability: string): string => {
    switch (availability) {
      case 'in-stock':
        return 'text-emerald-600 bg-emerald-50';
      case 'low-stock':
        return 'text-amber-600 bg-amber-50';
      case 'out-of-stock':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAvailabilityText = (availability: string, stockCount: number): string => {
    switch (availability) {
      case 'in-stock':
        return `${stockCount} in stock`;
      case 'low-stock':
        return `Only ${stockCount} left!`;
      case 'out-of-stock':
        return 'Out of stock';
      default:
        return 'Unknown';
    }
  };

  const getInStockCount = (): number => {
    return wishlistItems.filter((item: WishlistItem) => item.inStock).length;
  };

  const getTotalValue = (): number => {
    return wishlistItems.reduce((total: number, item: WishlistItem) => total + item.price, 0);
  };

  // Show loading state while fetching wishlist
  if (isLoading && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner message="Loading your wishlist..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Wishlist</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Heart className="h-8 w-8 text-red-500 fill-current mr-3" />
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearWishlistHandler}
                disabled={wishlistItems.length === 0 || isLoading}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Stock</p>
                <p className="text-2xl font-bold text-emerald-600">{getInStockCount()}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalValue())}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Filter className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Recently Added</option>
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center ${viewMode === 'grid'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center ${viewMode === 'list'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              viewMode === 'grid'
                ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  {viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromWishlistHandler(item.id)}
                          disabled={isLoading}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {item.requiresPrescription && (
                            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                              Rx Required
                            </span>
                          )}
                          {item.originalPrice && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                              Sale
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Header */}
                        <div className="mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {item.category}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-1">{item.genericName}</p>

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-gray-900">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${item.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                            <span className="ml-1 text-sm font-medium">{item.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({item.reviews} reviews)</span>
                        </div>

                        {/* Availability */}
                        <div className={`px-3 py-2 rounded-lg text-sm font-medium mb-4 ${getAvailabilityColor(item.availability)}`}>
                          {getAvailabilityText(item.availability, item.stockCount)}
                        </div>

                        {/* Added Date */}
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <Calendar className="h-3 w-3 mr-1" />
                          Added {new Date(item.addedDate).toLocaleDateString()}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/medication/${item.id}`)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                          <button
                            disabled={!item.inStock}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ShoppingCart className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* List View */
                    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-48 h-48 md:h-auto relative bg-gray-100 flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {item.requiresPrescription && (
                              <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                                Rx Required
                              </span>
                            )}
                            {item.originalPrice && (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                Sale
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                {item.category}
                              </span>
                              <h3 className="text-xl font-bold text-gray-900 mt-2 mb-1">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-3">{item.genericName}</p>
                              <p className="text-sm text-gray-600 mb-4">{item.dosage}</p>

                              <div className="flex flex-wrap items-center gap-4 mb-4">
                                {/* Price */}
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-gray-900">
                                    ${item.price}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through">
                                      ${item.originalPrice}
                                    </span>
                                  )}
                                </div>

                                {/* Rating */}
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                                  <span className="ml-1 text-sm font-medium">{item.rating}</span>
                                  <span className="ml-1 text-sm text-gray-500">
                                    ({item.reviews})
                                  </span>
                                </div>

                                {/* Availability */}
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(item.availability)}`}>
                                  {getAvailabilityText(item.availability, item.stockCount)}
                                </div>

                                {/* Date */}
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(item.addedDate).toLocaleDateString()}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3">
                                <button
                                  onClick={() => navigate(`/medication/${item.id}`)}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                  View Details
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                                <button
                                  disabled={!item.inStock}
                                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </button>
                                <button
                                  onClick={() => removeFromWishlistHandler(item.id)}
                                  disabled={isLoading}
                                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Creative Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-12 text-center overflow-hidden"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-200 rounded-full opacity-20 translate-x-24 translate-y-24"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-200 rounded-full opacity-10 -translate-x-12 -translate-y-12"></div>

            {/* Main content */}
            <div className="relative z-10">
              {/* Animated heart icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
              >
                <Heart className="h-16 w-16 text-white fill-current" />
              </motion.div>

              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Your wishlist feels lonely
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {selectedCategory !== 'all'
                  ? 'No items in this category. Try changing the filter to discover more medications.'
                  : 'Start adding medications you love and build your personal health collection!'}
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/medications')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg inline-flex items-center font-semibold"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Browse Medications
                  <ChevronRight className="h-5 w-5 ml-2" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-lg inline-flex items-center font-semibold border border-gray-200"
                >
                  <Package className="h-5 w-5 mr-2" />
                  Explore Dashboard
                </motion.button>
              </div>

              {/* Fun suggestions */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-gray-500">Popular categories:</span>
                {['Antibiotics', 'Pain Relief', 'Vitamins', 'Heart Health'].map((category, index) => (
                  <motion.span
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 shadow-sm border border-gray-100"
                  >
                    {category}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;