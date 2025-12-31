import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useMedications } from '../services/useMedication';
import { useShoppingCart } from '../services/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import WishlistButton from '../components/ui/WishlistButton';

// ============================================================================
// Types & Interfaces
// ============================================================================

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
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  imageUrl: string;
}

interface FAQ {
  question: string;
  answer: string;
}

type TabType = 'overview' | 'usage' | 'precautions' | 'reviews';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    date: '2024-01-15',
    verified: true,
    title: 'Very effective medication',
    comment:
      'This medication worked wonderfully. Started feeling better within 48 hours. No significant side effects except mild nausea which went away after eating.',
    helpful: 42,
  },
  {
    id: '2',
    userName: 'Michael Chen',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    date: '2024-01-10',
    verified: true,
    title: 'Good product, minor issues',
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
    comment: 'Great price. Worked quickly. Very satisfied with the results.',
    helpful: 35,
  },
];

const MOCK_FAQS: FAQ[] = [
  {
    question: 'How should I take this medication?',
    answer:
      'Take as directed by your healthcare provider. Follow the instructions on your prescription label carefully.',
  },
  {
    question: 'What should I do if I miss a dose?',
    answer:
      'Take the missed dose as soon as you remember. If it\'s almost time for your next dose, skip the missed dose. Do not double the dose.',
  },
  {
    question: 'Can I drink alcohol while taking this medication?',
    answer:
      'It\'s best to avoid alcohol during treatment. Consult your healthcare provider for specific guidance.',
  },
  {
    question: 'What are the storage requirements?',
    answer:
      'Store at room temperature away from moisture and heat. Keep the container tightly closed when not in use.',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const determineForm = (dosage?: string): string => {
  if (!dosage) return 'Tablets';
  const lower = dosage.toLowerCase();
  if (lower.includes('tablet')) return 'Tablets';
  if (lower.includes('capsule')) return 'Capsules';
  if (lower.includes('syrup') || lower.includes('liquid')) return 'Syrup';
  if (lower.includes('injection')) return 'Injection';
  if (lower.includes('cream') || lower.includes('ointment')) return 'Topical';
  if (lower.includes('drop')) return 'Drops';
  return 'Tablets';
};

const extractPrice = (price: number | string): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const priceMatch = price.match(/\$?(\d+\.?\d*)/);
    return priceMatch ? parseFloat(priceMatch[1]) : 0;
  }
  return 0;
};

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
  return <div className="flex">{stars}</div>;
};

// ============================================================================
// Main Component
// ============================================================================

const MedicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [quantity, setQuantity] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Hooks
  const { medications, isLoading, fetchMedications } = useMedications();
  const { addToCart } = useShoppingCart();

  // Find medication
  const medication = medications.find((med) => med.id.toString() === id);

  // Effects
  useEffect(() => {
    if (!medications.length) {
      fetchMedications();
    }
  }, [fetchMedications, medications.length]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Formatted medication data
  const med = medication
    ? {
        id: medication.id.toString(),
        name: medication.name,
        genericName: medication.name,
        manufacturer: medication.supplier || 'Certified Manufacturer',
        category: medication.category,
        dosage: medication.dosage || 'As directed',
        form: determineForm(medication.dosage),
        strength: medication.dosage || 'N/A',
        packSize: '1 Pack',
        price: extractPrice(medication.price),
        originalPrice: null,
        discount: 0,
        inStock: medication.inStock && medication.stock > 0,
        stockCount: medication.stock,
        requiresPrescription: medication.prescriptionRequired || false,
        rating: 4.5,
        totalReviews: Math.floor(Math.random() * 2000) + 100,
        totalSold: Math.floor(Math.random() * 10000) + 1000,
        expiryDate:
          medication.expiryDate ||
          new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        batchNumber: medication.batchNumber || `BATCH-${medication.id}`,
        images: [
          medication.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800',
          'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
          'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800',
        ],
        description:
          medication.description ||
          'Professional medication for treatment. Please consult your healthcare provider for detailed information.',
        overview: {
          description:
            medication.description ||
            'Professional medication for treatment. Please consult your healthcare provider for detailed information.',
          activeIngredient: medication.name,
          inactiveIngredients: 'Various inactive ingredients as per pharmaceutical standards',
          therapeuticClass: medication.category,
          pharmacologicalClass: 'Therapeutic Agent',
        },
        usage: {
          indications: [
            'As prescribed by healthcare provider',
            'Follow dosage instructions carefully',
            'Complete full course of treatment',
          ],
          dosage: {
            adults: medication.dosage || 'As directed by physician',
            children: 'Consult physician for pediatric dosing',
            elderly: 'Same as adults unless otherwise specified',
          },
          administration: 'Take as directed by healthcare provider. Read package insert carefully.',
          duration: 'As prescribed by healthcare provider',
        },
        precautions: {
          warnings: [
            'Use only as directed by healthcare provider',
            'Keep out of reach of children',
            'Store at room temperature',
          ],
          contraindications: [
            'Known hypersensitivity to ingredients',
            'Consult doctor for contraindications',
          ],
          sideEffects: {
            common: ['Consult package insert', 'Contact pharmacist for details'],
            serious: ['Seek immediate medical attention if severe reactions occur'],
          },
          drugInteractions: [
            'Consult pharmacist for drug interactions',
            'Inform doctor of all medications you are taking',
          ],
          specialPopulations: {
            pregnancy: 'Consult healthcare provider',
            breastfeeding: 'Consult healthcare provider',
            renal: 'Dose adjustment may be required',
            hepatic: 'Use with caution',
          },
        },
        storage: {
          conditions: 'Store at room temperature (20-25°C)',
          humidity: 'Keep container tightly closed',
          light: 'Protect from light',
          disposal: 'Dispose of properly as per local regulations',
        },
      }
    : null;

  // Related products
  const relatedProducts: RelatedProduct[] = medications
    .filter((m) => m.id.toString() !== id && m.inStock && m.stock > 0)
    .slice(0, 3)
    .map((m) => ({
      id: m.id.toString(),
      name: m.name,
      price: extractPrice(m.price),
      rating: 4.0 + Math.random() * 1.5,
      imageUrl: m.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    }));

  // Handlers
  const handleQuantityChange = (delta: number) => {
    if (!med) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= med.stockCount) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!med) return;

    addToCart({
      id: parseInt(med.id),
      name: med.name,
      price: med.price,
      img_url: med.images[0] || null,
    });

    setNotification(`${med.name} added to cart!`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-12">
          <LoadingSpinner message="Loading medication details..." />
        </Card>
      </div>
    );
  }

  // Not found state
  if (!med) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-12 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Medication Not Found</h2>
          <p className="text-gray-600 mb-6">
            The medication you're looking for could not be found or may be out of stock.
          </p>
          <button
            onClick={() => navigate('/medications')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Pharmacy
          </button>
        </Card>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">{notification}</p>
          </div>
        </motion.div>
      )}

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
        <ProductSection
          medication={med}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
          onAddToCart={handleAddToCart}
        />

        {/* Tabs Section */}
        <TabsSection
          medication={med}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reviews={MOCK_REVIEWS}
        />

        {/* FAQ Section */}
        <FAQSection faqs={MOCK_FAQS} expandedFAQ={expandedFAQ} setExpandedFAQ={setExpandedFAQ} />

        {/* Related Products */}
        <RelatedProductsSection products={relatedProducts} navigate={navigate} />
      </div>
    </div>
  );
};

// Sub-Components
// ============================================================================

const ProductSection = ({
  medication,
  selectedImage,
  setSelectedImage,
  quantity,
  onQuantityChange,
  onAddToCart,
}: any) => (
  <div className="grid lg:grid-cols-2 gap-8 mb-12">
    {/* Images */}
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Single Product Image */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={medication.image || medication.images?.[0] || '/api/placeholder/400/300'}
            alt={medication.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </motion.div>

    {/* Product Info */}
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
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
          {renderStars(medication.rating)}
          <span className="ml-2 text-lg font-semibold text-gray-900">{medication.rating}</span>
          <span className="text-gray-600">({medication.totalReviews} reviews)</span>
          <span className="text-gray-600">• {medication.totalSold} sold</span>
        </div>
      </div>

      {/* Price */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl font-bold text-gray-900">KSH {medication.price.toFixed(2).toLocaleString()}</span>
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

      {/* Product Details Grid */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl">
        <DetailItem label="Manufacturer" value={medication.manufacturer} />
        <DetailItem label="Dosage" value={medication.dosage} />
        <DetailItem label="Form" value={medication.form} />
        <DetailItem label="Pack Size" value={medication.packSize} />
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-300 rounded-lg">
            <button
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
              className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-6 py-2 font-semibold text-lg border-x-2 border-gray-300">{quantity}</span>
            <button
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= medication.stockCount}
              className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-gray-600">
            Subtotal:{' '}
            <span className="font-bold text-gray-900">KSH {(medication.price * quantity).toFixed(2).toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onAddToCart}
          disabled={!medication.inStock}
          className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center hover:shadow-lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </button>
        <WishlistButton 
          medication={{
            id: parseInt(medication.id),
            name: medication.name,
            price: medication.price,
            category: medication.category,
            dosage: medication.dosage,
            inStock: medication.inStock,
            stock: medication.stockCount,
            prescriptionRequired: medication.requiresPrescription,
            image: medication.images[0]
          }} 
          size="lg"
        />
        <button className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
          <Share2 className="h-6 w-6" />
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t">
        <FeatureItem icon={Truck} title="Free Delivery" subtitle="On orders ksh2500+" color="blue" />
        <FeatureItem icon={Shield} title="Secure Payment" subtitle="100% Protected" color="emerald" />
        <FeatureItem icon={Package} title="Quality" subtitle="Guaranteed" color="amber" />
      </div>
    </motion.div>
  </div>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

const FeatureItem = ({
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  icon: any;
  title: string;
  subtitle: string;
  color: string;
}) => (
  <div className="text-center">
    <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
      <Icon className={`h-6 w-6 text-${color}-600`} />
    </div>
    <p className="text-xs text-gray-600">{title}</p>
    <p className="text-sm font-medium text-gray-900">{subtitle}</p>
  </div>
);

const TabsSection = ({ medication, activeTab, setActiveTab, reviews }: any) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
    {/* Tab Navigation */}
    <div className="border-b">
      <div className="flex overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Info },
          { id: 'usage', label: 'How to Use', icon: Pill },
          { id: 'precautions', label: 'Precautions', icon: AlertTriangle },
          { id: 'reviews', label: 'Reviews', icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
      {activeTab === 'overview' && <OverviewTab medication={medication} />}
      {activeTab === 'usage' && <UsageTab medication={medication} />}
      {activeTab === 'precautions' && <PrecautionsTab medication={medication} />}
      {activeTab === 'reviews' && <ReviewsTab medication={medication} reviews={reviews} />}
    </div>
  </div>
);

const OverviewTab = ({ medication }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Inactive Ingredients</h4>
        <p className="text-gray-700">{medication.overview.inactiveIngredients}</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Therapeutic Class</h4>
        <p className="text-gray-700">{medication.overview.therapeuticClass}</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Pharmacological Class</h4>
        <p className="text-gray-700">{medication.overview.pharmacologicalClass}</p>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl">
      <div className="flex items-start">
        <Info className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">Important Product Information</h4>
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
);

const UsageTab = ({ medication }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Indications</h3>
      <p className="text-gray-700 mb-4">This medication is used to treat:</p>
      <ul className="space-y-2">
        {medication.usage.indications.map((indication: string, index: number) => (
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
);

const PrecautionsTab = ({ medication }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl">
      <div className="flex items-start">
        <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xl font-bold text-red-900 mb-4">Important Warnings</h3>
          <ul className="space-y-3">
            {medication.precautions.warnings.map((warning: string, index: number) => (
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
        {medication.precautions.contraindications.map((item: string, index: number) => (
          <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
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
            {medication.precautions.sideEffects.common.map((effect: string, index: number) => (
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
            {medication.precautions.sideEffects.serious.map((effect: string, index: number) => (
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
        <p className="text-amber-900 mb-4">This medication may interact with the following drugs:</p>
        <ul className="space-y-2">
          {medication.precautions.drugInteractions.map((interaction: string, index: number) => (
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
        {Object.entries(medication.precautions.specialPopulations).map(([key, value]) => (
          <div key={key} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2 capitalize">{key}</h4>
            <p className="text-sm text-purple-800">{value as string}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const ReviewsTab = ({ medication, reviews }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
    {/* Rating Summary */}
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 text-center">
        <div className="text-6xl font-bold text-gray-900 mb-2">{medication.rating}</div>
        {renderStars(medication.rating)}
        <p className="text-gray-700 font-medium mt-3">Based on {medication.totalReviews} reviews</p>
      </div>

      <div className="md:col-span-2 space-y-3">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = Math.floor(Math.random() * 500);
          const percentage = (count / medication.totalReviews) * 100;
          return (
            <div key={stars} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-12">{stars} star</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-16 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Reviews List */}
    <div className="space-y-6">
      {reviews.map((review: Review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>

    <div className="text-center">
      <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium">
        Load More Reviews
      </button>
    </div>
  </motion.div>
);

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{review.userName}</h4>
            {review.verified && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {renderStars(review.rating)}
            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
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
);

const FAQSection = ({ faqs, expandedFAQ, setExpandedFAQ }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <FileText className="h-7 w-7 text-blue-600 mr-3" />
      Frequently Asked Questions
    </h3>
    <div className="space-y-4">
      {faqs.map((faq: FAQ, index: number) => (
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
);

const RelatedProductsSection = ({ products, navigate }: any) => (
  <div className="mb-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
    <div className="grid md:grid-cols-3 gap-6">
      {products.map((product: RelatedProduct) => (
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
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">KSH {product.price.toFixed(2).toLocaleString()}</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-amber-500 fill-current" />
                <span className="ml-1 text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default MedicationDetailPage;