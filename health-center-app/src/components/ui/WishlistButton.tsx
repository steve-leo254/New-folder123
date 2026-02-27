import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../services/useWishlist';
import { useAuth } from '../../services/AuthContext';

interface WishlistButtonProps {
  medication: {
    id: string | number;
    name: string;
    category: string;
    dosage?: string;
    price: number | string;
    stock: number;
    inStock: boolean;
    prescriptionRequired?: boolean;
    image?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  medication,
  className = '',
  size = 'md',
  showText = false
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading } = useWishlist();
  const { token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isWishlisted = isInWishlist(medication.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing || isLoading) return;

    console.log('Wishlist button clicked:', { medicationId: medication.id, isWishlisted, token: !!token });
    
    setIsProcessing(true);
    try {
      if (isWishlisted) {
        // Find the wishlist item by medication ID and remove it
        // Note: This would need the actual wishlist item ID, for now we'll use medication ID
        console.log('Removing from wishlist:', medication.id);
        await removeFromWishlist(medication.id);
      } else {
        console.log('Adding to wishlist:', {
          medication_id: medication.id,
          medication: {
            name: medication.name,
            dosage: medication.dosage,
            price: medication.price,
            category: medication.category,
            image: medication.image,
            stock: medication.stock,
            inStock: medication.inStock,
            prescriptionRequired: medication.prescriptionRequired,
          }
        });
        await addToWishlist({ 
          medication_id: medication.id,
          medication: {
            name: medication.name,
            dosage: medication.dosage,
            price: medication.price,
            category: medication.category,
            image: medication.image,
            stock: medication.stock,
            inStock: medication.inStock,
            prescriptionRequired: medication.prescriptionRequired,
          }
        });
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      // Don't log 404 and 400 errors since they're expected (404 = backend not running, 400 = duplicate item)
      const axiosError = error as any;
      if (axiosError?.response?.status !== 404 && axiosError?.response?.status !== 400) {
        console.error('Failed to toggle wishlist:', error);
      }
      // Don't show error to user since localStorage fallback should handle it
      // The user will see the wishlist state update even if backend fails
    } finally {
      setIsProcessing(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const buttonClasses = `
    ${sizeClasses[size]}
    rounded-full transition-all duration-200 flex items-center gap-2
    ${isWishlisted 
      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }
    ${(isProcessing || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isProcessing || isLoading}
      className={buttonClasses}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={`${iconSizes[size]} ${isWishlisted ? 'fill-current' : ''}`}
      />
      {showText && (
        <span className="text-xs font-medium">
          {isWishlisted ? 'Remove' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
