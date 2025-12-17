import { useState, useCallback, useEffect } from 'react';
import type { AxiosError } from 'axios';
import { apiService } from './api';
import { useAuth } from './AuthContext';

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
}

const normalizeWishlistItem = (item: any): WishlistItem => {
  return {
    id: item.id,
    medicationId: item.medication_id || item.medicationId,
    name: item.name,
    genericName: item.generic_name || item.genericName,
    dosage: item.dosage,
    price: item.price,
    originalPrice: item.original_price || item.originalPrice,
    category: String(item.category || 'uncategorized'),
    imageUrl: item.image_url || item.imageUrl,
    inStock: item.in_stock !== undefined ? Boolean(item.in_stock) : item.stock_count > 0,
    requiresPrescription: item.requires_prescription || item.requiresPrescription,
    rating: item.rating,
    reviews: item.reviews,
    addedDate: item.added_date || item.addedDate,
    availability: item.availability,
    stockCount: item.stock_count || item.stockCount,
  };
};

const toArrayResponse = (response: any): WishlistItem[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response.map(normalizeWishlistItem);
  if (response.items && Array.isArray(response.items)) {
    return response.items.map(normalizeWishlistItem);
  }
  return [normalizeWishlistItem(response)];
};

export const useWishlist = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchWishlist = useCallback(
    async (params?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getWishlist(params);
        const normalized = toArrayResponse(response);
        setWishlistItems(normalized);
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to fetch wishlist';
        setError(errorMessage);
        console.error('Error fetching wishlist:', axiosError);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Auto-fetch wishlist when user is authenticated
  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token, fetchWishlist]);

  const addToWishlist = useCallback(
    async (medicationData: WishlistCreateRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.addToWishlist(medicationData);
        const normalized = normalizeWishlistItem(response);
        setWishlistItems((prev) => {
          // Check if item already exists
          const exists = prev.some(item => item.medicationId === normalized.medicationId);
          if (!exists) {
            return [normalized, ...prev];
          }
          return prev;
        });
        return normalized;
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to add to wishlist';
        setError(errorMessage);
        console.error('Error adding to wishlist:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeFromWishlist = useCallback(
    async (wishlistItemId: string | number) => {
      setIsLoading(true);
      setError(null);
      try {
        await apiService.removeFromWishlist(wishlistItemId);
        setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistItemId));
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to remove from wishlist';
        setError(errorMessage);
        console.error('Error removing from wishlist:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearWishlist = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);
      try {
        await apiService.clearWishlist();
        setWishlistItems([]);
      } catch (err) {
        const axiosError = err as AxiosError<{ detail?: string }>;
        const errorMessage = axiosError.response?.data?.detail || 'Failed to clear wishlist';
        setError(errorMessage);
        console.error('Error clearing wishlist:', axiosError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const isInWishlist = useCallback(
    (medicationId: string | number) => {
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
