import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  StarHalf,
  Shield,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Pill,
  Calendar,
  Info,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Tag,
} from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  helpful: number;
  images?: string[];
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  imageUrl: string;
}

const MedicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'precautions' | 'reviews'>('overview');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock medication data
  const medication = {
    id: id || '1',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin Trihydrate',
    manufacturer: 'Pfizer Pharmaceuticals',
    category: 'Antibiotics',
    dosage: '500mg',
    form: 'Capsules',
    strength: '500mg',
    packSize: '20 Capsules',
    price: 12.99,
    originalPrice: 15.99,
    discount: 19,
    inStock: true,
    stockCount: 45,
    requiresPrescription: true,
    rating: 4.5,
    totalReviews: 1247,
    totalSold: 15420,
    expiryDate: '2025-12-31',
    batchNumber: 'AMX-2024-001',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800',
    ],
    overview: {
      description:
        'Amoxicillin is a penicillin-type antibiotic used to treat a wide variety of bacterial infections. It works by stopping the growth of bacteria. This antibiotic treats only bacterial infections and will not work for viral infections (such as common cold, flu).',
      activeIngredient: 'Amoxicillin Trihydrate (500mg per capsule)',
      inactiveIngredients:
        'Magnesium Stearate, Sodium Starch Glycolate, Microcrystalline Cellulose',
      therapeuticClass: 'Penicillin Antibiotics',
      pharmacologicalClass: 'Beta-lactam Antibacterial',
    },
    usage: {
      indications: [
        'Bacterial infections of the ear, nose, and throat',
        'Infections of the genitourinary tract',
        'Infections of the skin and skin structure',
        'Infections of the lower respiratory tract',
        'Helicobacter pylori infection and duodenal ulcer',
      ],
      dosage: {
        adults: 'Take 500mg every 8 hours or 875mg every 12 hours',
        children: 'Dosage based on body weight - consult physician',
        elderly: 'Same as adults unless renal impairment present',
      },
      administration:
        'Take with or without food. Swallow capsules whole with a full glass of water. Complete the full course of treatment even if symptoms improve.',
      duration: 'Typical treatment duration: 7-14 days depending on infection severity',
    },
    precautions: {
      warnings: [
        'Serious and occasionally fatal hypersensitivity reactions have been reported',
        'Clostridium difficile associated diarrhea has been reported',
        'May reduce effectiveness of oral contraceptives',
        'Not effective against viral infections',
      ],
      contraindications: [
        'Known allergy to penicillin or cephalosporin antibiotics',
        'History of cholestatic jaundice/hepatic dysfunction with amoxicillin',
        'Infectious mononucleosis',
      ],
      sideEffects: {
        common: ['Nausea', 'Vomiting', 'Diarrhea', 'Rash', 'Vaginal yeast infection'],
        serious: [
          'Severe allergic reactions (anaphylaxis)',
          'Severe skin reactions',
          'Liver problems',
          'Blood disorders',
        ],
      },
      drugInteractions: [
        'Probenecid - increases amoxicillin blood levels',
        'Allopurinol - increases risk of skin rash',
        'Anticoagulants - may increase bleeding risk',
        'Oral contraceptives - may reduce effectiveness',
      ],
      specialPopulations: {
        pregnancy: 'Category B - Use only if clearly needed',
        breastfeeding: 'Use with caution - small amounts pass into breast milk',
        renal: 'Dose adjustment required in severe renal impairment',
        hepatic: 'Use with caution - monitor liver function',
      },
    },
    storage: {
      conditions: 'Store at room temperature (20-25°C / 68-77°F)',
      humidity: 'Keep container tightly closed. Protect from moisture.',
      light: 'Protect from light',
      disposal:
        'Dispose of unused medication properly. Do not flush down toilet or pour into drain.',
    },
  };

  // Mock reviews
  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      date: '2024-01-15',
      verified: true,
      title: 'Very effective for sinus infection',
      comment:
        'This medication worked wonderfully for my sinus infection. Started feeling better within 48 hours. No significant side effects except mild nausea which went away after eating.',
      helpful: 42,
    },
    {
      id: '2',
      userName: 'Michael Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      rating: 4,
      date: '2024-01-10',
      verified: true,
      title: 'Good antibiotic, minor stomach upset',
      comment:
        'Cleared up my infection effectively. Had some stomach discomfort but taking it with food helped. Would recommend.',
      helpful: 28,
    },
    {
      id: '3',
      userName: 'Emily Rodriguez',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      date: '2024-01-05',
      verified: true,
      title: 'Fast acting and affordable',
      comment:
        'Great price compared to other pharmacies. Worked quickly for my ear infection. Very satisfied with the results.',
      helpful: 35,
    },
  ];

  // Mock related products
  const relatedProducts: RelatedProduct[] = [
    {
      id: '2',
      name: 'Azithromycin 250mg',
      price: 18.99,
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    },
    {
      id: '3',
      name: 'Ciprofloxacin 500mg',
      price: 22.99,
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    },
    {
      id: '4',
      name: 'Doxycycline 100mg',
      price: 15.99,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    },
  ];

  // Mock FAQs
  const faqs = [
    {
      question: 'How long does it take for Amoxicillin to work?',
      answer:
        'Most people start feeling better within 48-72 hours of starting treatment. However, it is crucial to complete the entire prescribed course even if you feel better to prevent antibiotic resistance.',
    },
    {
      question: 'Can I drink alcohol while taking Amoxicillin?',
      answer:
        'While moderate alcohol consumption is generally considered safe with Amoxicillin, it may increase side effects like nausea and stomach upset. It\'s best to avoid alcohol during treatment.',
    },
    {
      question: 'What should I do if I miss a dose?',
      answer:
        'Take the missed dose as soon as you remember. If it\'s almost time for your next dose, skip the missed dose and continue with your regular schedule. Do not double the dose to catch up.',
    },
    {
      question: 'Can I take Amoxicillin if I\'m allergic to penicillin?',
      answer:
        'No. Amoxicillin is a penicillin-type antibiotic. If you have a known allergy to penicillin, you should not take Amoxicillin. Inform your doctor about your allergy so they can prescribe an alternative.',
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-5 w-5 text-amber-500 fill-current" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 text-amber-500 fill-current" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
    }
    return stars;
  };

  const incrementQuantity = () => {
    if (quantity < medication.stockCount) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96 bg-gray-100">
                <img
                  src={medication.images[selectedImage]}
                  alt={medication.name}
                  className="w-full h-full object-cover"
                />
                {medication.discount > 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white font-bold rounded-full">
                    {medication.discount}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {medication.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-blue-600 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {medication.category}
                </span>
                {medication.requiresPrescription && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Rx Required
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{medication.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{medication.genericName}</p>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {renderStars(medication.rating)}
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    {medication.rating}
                  </span>
                </div>
                <span className="text-gray-600">({medication.totalReviews} reviews)</span>
                <span className="text-gray-600">• {medication.totalSold} sold</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">${medication.price}</span>
                {medication.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ${medication.originalPrice}
                  </span>
                )}
                {medication.discount > 0 && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    Save {medication.discount}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">Price per {medication.packSize}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4">
              {medication.inStock ? (
                <>
                  <div className="flex items-center text-emerald-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">In Stock</span>
                  </div>
                  <span className="text-gray-600">({medication.stockCount} units available)</span>
                </>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl">
              <div>
                <p className="text-sm text-gray-600">Manufacturer</p>
                <p className="font-medium text-gray-900">{medication.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dosage</p>
                <p className="font-medium text-gray-900">{medication.dosage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Form</p>
                <p className="font-medium text-gray-900">{medication.form}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pack Size</p>
                <p className="font-medium text-gray-900">{medication.packSize}</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-2 font-semibold text-lg border-x-2 border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= medication.stockCount}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-gray-600">
                  Subtotal: <span className="font-bold text-gray-900">${(medication.price * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                disabled={!medication.inStock}
                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`px-6 py-4 rounded-xl border-2 transition-all ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : 'border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`}
                />
              </button>
              <button className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                <Share2 className="h-6 w-6" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Free Delivery</p>
                <p className="text-sm font-medium text-gray-900">On orders $50+</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-600">Secure Payment</p>
                <p className="text-sm font-medium text-gray-900">100% Protected</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <p className="text-xs text-gray-600">Quality</p>
                <p className="text-sm font-medium text-gray-900">Guaranteed</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'usage', label: 'How to Use', icon: Pill },
                { id: 'precautions', label: 'Precautions & Warnings', icon: AlertTriangle },
                { id: 'reviews', label: 'Reviews', icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{medication.overview.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Active Ingredient</h4>
                    <p className="text-gray-700">{medication.overview.activeIngredient}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Inactive Ingredients
                    </h4>
                    <p className="text-gray-700">{medication.overview.inactiveIngredients}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Therapeutic Class
                    </h4>
                    <p className="text-gray-700">{medication.overview.therapeuticClass}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Pharmacological Class
                    </h4>
                    <p className="text-gray-700">{medication.overview.pharmacologicalClass}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl">
                  <div className="flex items-start">
                    <Info className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Important Product Information
                      </h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          Batch Number: {medication.batchNumber}
                        </li>
                        <li className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          Expiry Date: {new Date(medication.expiryDate).toLocaleDateString()}
                        </li>
                        <li className="flex items-center">
                          <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                          Manufacturer: {medication.manufacturer}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Storage Conditions</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Temperature</p>
                      <p className="text-sm text-gray-700">{medication.storage.conditions}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Humidity</p>
                      <p className="text-sm text-gray-700">{medication.storage.humidity}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Light</p>
                      <p className="text-sm text-gray-700">{medication.storage.light}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Disposal</p>
                      <p className="text-sm text-gray-700">{medication.storage.disposal}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'usage' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Indications</h3>
                  <p className="text-gray-700 mb-4">This medication is used to treat:</p>
                  <ul className="space-y-2">
                    {medication.usage.indications.map((indication, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{indication}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Dosage Guidelines</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex items-center mb-3">
                        <Users className="h-6 w-6 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Adults</h4>
                      </div>
                      <p className="text-sm text-gray-700">{medication.usage.dosage.adults}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <div className="flex items-center mb-3">
                        <Users className="h-6 w-6 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Children</h4>
                      </div>
                      <p className="text-sm text-gray-700">{medication.usage.dosage.children}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                      <div className="flex items-center mb-3">
                        <Users className="h-6 w-6 text-amber-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Elderly</h4>
                      </div>
                      <p className="text-sm text-gray-700">{medication.usage.dosage.elderly}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-600 p-6 rounded-r-xl">
                  <div className="flex items-start">
                    <Pill className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-2">Administration</h4>
                      <p className="text-emerald-800">{medication.usage.administration}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 rounded-r-xl">
                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Treatment Duration</h4>
                      <p className="text-blue-800">{medication.usage.duration}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'precautions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl">
                  <div className="flex items-start">
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xl font-bold text-red-900 mb-4">Warnings</h3>
                      <ul className="space-y-3">
                        {medication.precautions.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-red-800">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Contraindications</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {medication.precautions.contraindications.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start">
                          <div className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Side Effects</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Info className="h-5 w-5 text-blue-600 mr-2" />
                        Common Side Effects
                      </h4>
                      <ul className="space-y-2">
                        {medication.precautions.sideEffects.common.map((effect, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{effect}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                        Serious Side Effects
                      </h4>
                      <ul className="space-y-2">
                        {medication.precautions.sideEffects.serious.map((effect, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{effect}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Drug Interactions</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <p className="text-amber-900 mb-4">
                      This medication may interact with the following drugs:
                    </p>
                    <ul className="space-y-2">
                      {medication.precautions.drugInteractions.map((interaction, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-amber-800">{interaction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Special Populations</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(medication.precautions.specialPopulations).map(
                      ([key, value]) => (
                        <div key={key} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2 capitalize">{key}</h4>
                          <p className="text-sm text-purple-800">{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Rating Summary */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 text-center">
                    <div className="text-6xl font-bold text-gray-900 mb-2">
                      {medication.rating}
                    </div>
                    <div className="flex items-center justify-center mb-3">
                      {renderStars(medication.rating)}
                    </div>
                    <p className="text-gray-700 font-medium">
                      Based on {medication.totalReviews} reviews
                    </p>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = Math.floor(Math.random() * 500);
                      const percentage = (count / medication.totalReviews) * 100;
                      return (
                        <div key={stars} className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-700 w-12">
                            {stars} star
                          </span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full mr-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                              {review.verified && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful ({review.helpful})
                        </button>
                        <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Not Helpful
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium">
                    Load More Reviews
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="h-7 w-7 text-blue-600 mr-3" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 py-4 bg-white">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                onClick={() => navigate(`/medication/${product.id}`)}
              >
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">${product.price}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="ml-1 text-sm font-medium">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationDetailPage;