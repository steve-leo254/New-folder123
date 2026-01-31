/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Converts a relative image URL from the backend to a full URL
 * @param imageUrl - The relative URL from the backend (e.g., "/uploads/image.png")
 * @returns The full URL (e.g., "http://localhost:8000/uploads/image.png")
 */
export const getFullImageUrl = (imageUrl?: string): string | undefined => {
  if (!imageUrl) {
    return undefined;
  }
  
  // Clean up any malformed URLs with extra quotes
  const cleanImageUrl = imageUrl.replace(/"/g, '');
  
  // If it's a base64 data URL, return as is
  if (cleanImageUrl.startsWith('data:')) {
    return cleanImageUrl;
  }
  
  // If it's already a full URL (starts with http), return as is
  if (cleanImageUrl.startsWith('http')) {
    return cleanImageUrl;
  }
  
  // If it's a relative URL, prepend the API base URL
  return `${API_BASE_URL}${cleanImageUrl}`;
};

/**
 * Gets the default profile image URL
 * @returns The default profile image URL
 */
export const getDefaultProfileImage = (): string => {
  return '/images/doctor-default.jpg';
};
