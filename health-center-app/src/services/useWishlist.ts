import { useState, useCallback, useEffect, useRef } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

// LocalStorage fallback for wishlist when backend is not available
const LOCAL_STORAGE_KEY = 'health_center_wishlist';

export interface WishlistItem {
  id: string | number;
  medicationId: string | number;
  name: string;
  genericName: string;
  dosage: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  requiresPrescription: boolean;
  rating: number;
  reviews: number;
  addedDate: string;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockCount: number;
}

export interface WishlistCreateRequest {
  medication_id: string | number;
  medication?: {
    name?: string;
    genericName?: string;
    dosage?: string;
    price?: number | string;
    category?: string;
    image?: string;
    stock?: number;
    inStock?: boolean;
    prescriptionRequired?: boolean;
    rating?: number;
    reviews?: number;
  };
}

// Better type for API response
interface ApiWishlistItem {
  id: string | number;
  medication_id?: string | number;
  medicationId?: string | number;
  name: string;
  generic_name?: string;
  genericName?: string;
  dosage: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  category?: string | number;
  image_url?: string;
  imageUrl?: string;
  in_stock?: boolean;
  stock_count?: number;
  stockCount?: number;
  requires_prescription?: boolean;
  requiresPrescription?: boolean;
  rating: number;
  reviews: number;
  added_date?: string;
  addedDate?: string;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop';

const getImageUrl = (imageUrl?: string): string => {
  if (imageUrl && imageUrl.trim() !== '') return imageUrl;
  return DEFAULT_IMAGE;
};

const normalizeWishlistItem = (item: ApiWishlistItem): WishlistItem => {
  const stockCount = item.stock_count ?? item.stockCount ?? 0;
  
  return {
    id: item.id,
    medicationId: item.medication_id ?? item.medicationId ?? item.id,
    name: item.name,
    genericName: item.generic_name ?? item.genericName ?? '',
    dosage: item.dosage,
    price: item.price,
    originalPrice: item.original_price ?? item.originalPrice,
    category: String(item.category || 'uncategorized'),
    imageUrl: getImageUrl(item.image_url ?? item.imageUrl),
    inStock: item.in_stock !== undefined ? Boolean(item.in_stock) : stockCount > 0,
    requiresPrescription: item.requires_prescription ?? item.requiresPrescription ?? false,
    rating: item.rating,
    reviews: item.reviews,
    addedDate: item.added_date ?? item.addedDate ?? new Date().toISOString(),
    availability: item.availability,
    stockCount,
  };
};

const toArrayResponse = (response: unknown): WishlistItem[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response.map(normalizeWishlistItem);
  if (typeof response === 'object' && response !== null) {
    const responseObj = response as { items?: unknown[] };
    if (responseObj.items && Array.isArray(responseObj.items)) {
      return responseObj.items.map(item => normalizeWishlistItem(item as ApiWishlistItem));
    }
    return [normalizeWishlistItem(response as ApiWishlistItem)];
  }
  return [];
};

interface UseWishlistReturn {
  isLoading: boolean;
  wishlistItems: WishlistItem[];
  error: string | null;
  fetchWishlist: (params?: Record<string, unknown>) => Promise<void>;
  addToWishlist: (medicationData: WishlistCreateRequest) => Promise<WishlistItem>;
  removeFromWishlist: (wishlistItemId: string | number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (medicationId: string | number) => boolean;
}

export const useWishlist = (): UseWishlistReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  
  // Use useLocalStorage for automatic localStorage synchronization
  const [wishlistItems, setWishlistItems] = useLocalStorage<WishlistItem[]>(LOCAL_STORAGE_KEY, []);
  
  // Use ref to track mounted state and prevent memory leaks
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetError = useCallback((value: string | null) => {
    if (isMountedRef.current) {
      setError(value);
    }
  }, []);

  const safeSetLoading = useCallback((value: boolean) => {
    if (isMountedRef.current) {
      setIsLoading(value);
    }
  }, []);

  const safeSetWishlistItems = useCallback((value: WishlistItem[] | ((prev: WishlistItem[]) => WishlistItem[])) => {
    if (isMountedRef.current) {
      setWishlistItems(value);
    }
  }, []);

  const handleLocalFallback = useCallback((
    operation: 'fetch' | 'add' | 'remove' | 'clear',
    data?: WishlistCreateRequest | string | number
  ): WishlistItem | WishlistItem[] | void => {
    console.log(`Backend wishlist endpoint not found, using localStorage fallback for ${operation}`);
    
    switch (operation) {
      case 'fetch': {
        safeSetError(null);
        return wishlistItems;
      }
      case 'add': {
        const medicationData = data as WishlistCreateRequest;
        const exists = wishlistItems.some(item => item.medicationId === medicationData.medication_id);
        
        if (!exists) {
          const med = medicationData.medication;
          const newItem: WishlistItem = {
            id: `local_${medicationData.medication_id}_${Date.now()}`,
            medicationId: medicationData.medication_id,
            name: med?.name || `Medication ID: ${medicationData.medication_id}`,
            genericName: med?.genericName || 'Generic Name',
            dosage: med?.dosage || 'Standard Dosage',
            price: typeof med?.price === 'number' ? med.price : (typeof med?.price === 'string' ? parseFloat(med.price) : 15.99),
            category: med?.category || 'antibiotics',
            imageUrl: getImageUrl(med?.image),
            inStock: med?.inStock ?? true,
            requiresPrescription: med?.prescriptionRequired ?? true,
            rating: med?.rating || 4.5,
            reviews: med?.reviews || 128,
            addedDate: new Date().toISOString(),
            availability: 'in-stock',
            stockCount: med?.stock || 50,
          };
          
          const updated = [newItem, ...wishlistItems];
          safeSetWishlistItems(updated);
          safeSetError(null);
          return newItem;
        }
        
        safeSetError(null);
        return wishlistItems.find(item => item.medicationId === medicationData.medication_id)!;
      }
      case 'remove': {
        const wishlistItemId = data as string | number;
        const updated = wishlistItems.filter((item) => item.id !== wishlistItemId);
        safeSetWishlistItems(updated);
        safeSetError(null);
        return;
      }
      case 'clear': {
        safeSetWishlistItems([]);
        safeSetError(null);
        return;
      }
    }
  }, [wishlistItems, safeSetWishlistItems, safeSetError]);

  const fetchWishlist = useCallback(
    async (params?: Record<string, unknown>): Promise<void> => {
      safeSetLoading(true);
      safeSetError(null);
      
      try {
        const response = await apiService.getWishlist(params);
        const normalized = toArrayResponse(response);
        safeSetWishlistItems(normalized);
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        
        if (axiosError.response?.status === 404) {
          handleLocalFallback('fetch');
        } else {
          const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch wishlist';
          safeSetError(errorMessage);
          console.error('Error fetching wishlist:', axiosError);
          // Fallback to localStorage - useLocalStorage hook already handles this
        }
      } finally {
        safeSetLoading(false);
      }
    },
    [safeSetLoading, safeSetError, safeSetWishlistItems, handleLocalFallback]
  );

  // Auto-fetch wishlist when user is authenticated
  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
    // useLocalStorage hook automatically loads from localStorage when not authenticated
  }, [token]);

  const addToWishlist = useCallback(
    async (medicationData: WishlistCreateRequest): Promise<WishlistItem> => {
      safeSetLoading(true);
      safeSetError(null);
      
      try {
        if (!token) {
          // Use local storage when not authenticated
          return handleLocalFallback('add', medicationData) as WishlistItem;
        }
        
        console.log('Adding to wishlist:', medicationData);
        const response = await apiService.addToWishlist(medicationData);
        console.log('Wishlist add response:', response);
        
        const normalized = normalizeWishlistItem(response as ApiWishlistItem);
        
        safeSetWishlistItems((prev) => {
          const exists = prev.some(item => item.medicationId === normalized.medicationId);
          if (!exists) {
            const updated = [normalized, ...prev];
            return updated;
          }
          return prev;
        });
        
        return normalized;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        
        if (axiosError.response?.status === 404) {
          return handleLocalFallback('add', medicationData) as WishlistItem;
        }
        
        const errorMessage = axiosError.response?.data?.detail ||
                           axiosError.message ||
                           'Failed to add to wishlist';
        
        // Handle duplicate items gracefully
        if (axiosError.response?.status === 400 && errorMessage.includes('already in wishlist')) {
          console.log('Item already in wishlist, ensuring it exists in local state');
          const existingItem = wishlistItems.find(
            item => item.medicationId === medicationData.medication_id
          );
          if (existingItem) {
            safeSetError(null);
            return existingItem;
          }
          // If not found in current state, create a fallback item and add it
          const med = medicationData.medication;
          const fallbackItem: WishlistItem = {
            id: `existing_${medicationData.medication_id}`,
            medicationId: medicationData.medication_id,
            name: med?.name || `Medication ID: ${medicationData.medication_id}`,
            genericName: med?.genericName || 'Generic Name',
            dosage: med?.dosage || 'Standard Dosage',
            price: typeof med?.price === 'number' ? med.price : (typeof med?.price === 'string' ? parseFloat(med.price) : 15.99),
            category: med?.category || 'antibiotics',
            imageUrl: getImageUrl(med?.image),
            inStock: med?.inStock ?? true,
            requiresPrescription: med?.prescriptionRequired ?? true,
            rating: med?.rating || 4.5,
            reviews: med?.reviews || 128,
            addedDate: new Date().toISOString(),
            availability: 'in-stock',
            stockCount: med?.stock || 50,
          };
          // Add to state since it wasn't found
          safeSetWishlistItems((prev) => {
            const exists = prev.some(item => item.medicationId === fallbackItem.medicationId);
            if (!exists) {
              return [fallbackItem, ...prev];
            }
            return prev;
          });
          safeSetError(null);
          return fallbackItem;
        }
        
        // For other 400 errors that might be duplicates, check if item already exists
        if (axiosError.response?.status === 400) {
          const existingItem = wishlistItems.find(
            item => item.medicationId === medicationData.medication_id
          );
          if (existingItem) {
            console.log('Item likely already exists, returning existing item');
            safeSetError(null);
            return existingItem;
          }
        }
        
        safeSetError(errorMessage);
        console.error('Error adding to wishlist:', {
          error: axiosError,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        throw err;
      } finally {
        safeSetLoading(false);
      }
    },
    [token, safeSetLoading, safeSetError, safeSetWishlistItems, handleLocalFallback, wishlistItems]
  );

  const removeFromWishlist = useCallback(
    async (wishlistItemId: string | number): Promise<void> => {
      safeSetLoading(true);
      safeSetError(null);
      
      try {
        if (!token) {
          handleLocalFallback('remove', wishlistItemId);
          return;
        }
        
        console.log('Removing from wishlist:', wishlistItemId);
        await apiService.removeFromWishlist(wishlistItemId);
        console.log('Wishlist item removed successfully');
        
        safeSetWishlistItems((prev) => {
          const updated = prev.filter((item) => item.id !== wishlistItemId);
          return updated;
        });
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        
        if (axiosError.response?.status === 404) {
          handleLocalFallback('remove', wishlistItemId);
          return;
        }
        
        const errorMessage = axiosError.response?.data?.detail || 
                           axiosError.message || 
                           'Failed to remove from wishlist';
        safeSetError(errorMessage);
        console.error('Error removing from wishlist:', {
          error: axiosError,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message
        });
        throw err;
      } finally {
        safeSetLoading(false);
      }
    },
    [token, safeSetLoading, safeSetError, safeSetWishlistItems, handleLocalFallback]
  );

  const clearWishlist = useCallback(async (): Promise<void> => {
    safeSetLoading(true);
    safeSetError(null);
    
    try {
      if (!token) {
        handleLocalFallback('clear');
        return;
      }
      
      await apiService.clearWishlist();
      safeSetWishlistItems([]);
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      
      if (axiosError.response?.status === 404) {
        handleLocalFallback('clear');
        return;
      }
      
      const errorMessage = axiosError.response?.data?.detail || 'Failed to clear wishlist';
      safeSetError(errorMessage);
      console.error('Error clearing wishlist:', axiosError);
      // Still clear locally on error
      safeSetWishlistItems([]);
      throw err;
    } finally {
      safeSetLoading(false);
    }
  }, [token, safeSetLoading, safeSetError, safeSetWishlistItems, handleLocalFallback]);

  const isInWishlist = useCallback(
    (medicationId: string | number): boolean => {
      return wishlistItems.some(item => item.medicationId === medicationId);
    },
    [wishlistItems]
  );

  return {
    isLoading,
    wishlistItems,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  };
};