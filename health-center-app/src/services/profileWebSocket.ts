/**
 * WebSocket Service for Real-time Doctor Profile Updates
 * Handles real-time synchronization of profile data across multiple sessions
 */

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { DoctorProfile, DoctorEducation, DoctorContactInfo, DoctorAvailability, DoctorSettings } from './doctorProfileService';

export interface ProfileUpdateEvent {
  type: 'education' | 'contact' | 'availability' | 'settings';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export interface EducationUpdateEvent {
  id: number;
  action: 'create' | 'update' | 'delete';
}

class ProfileWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private webSocketEnabled = false; // Temporarily disabled

  constructor() {
    // WebSocket temporarily disabled to prevent connection errors
    console.log('WebSocket service temporarily disabled');
    // this.connect();
  }

  private connect() {
    if (!this.webSocketEnabled) {
      console.log('WebSocket service is disabled');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found for WebSocket connection');
      return;
    }

    // If we've already exceeded max reconnection attempts, don't try again
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('WebSocket disabled due to previous connection failures');
      return;
    }

    this.socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:8000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 5000, // Add timeout to prevent hanging
      forceNew: true // Force new connection on each attempt
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected for profile updates');
      this.reconnectAttempts = 0;
      
      // Join doctor profile room
      this.socket?.emit('join_profile_room');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Profile update events
    this.socket.on('profile_update', (event: ProfileUpdateEvent) => {
      this.notifyListeners(event.type, event);
    });

    this.socket.on('education_update', (data: DoctorEducation) => {
      this.notifyListeners('education', { type: 'education', action: 'update', data });
    });

    this.socket.on('contact_update', (data: DoctorContactInfo) => {
      this.notifyListeners('contact', { type: 'contact', action: 'update', data });
    });

    this.socket.on('availability_update', (data: DoctorAvailability[]) => {
      this.notifyListeners('availability', { type: 'availability', action: 'update', data });
    });

    this.socket.on('settings_update', (data: DoctorSettings) => {
      this.notifyListeners('settings', { type: 'settings', action: 'update', data });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        // Only try to reconnect if we haven't exceeded max attempts
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
          this.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached - WebSocket disabled');
      // Clear socket to prevent further connection attempts
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      // Start polling fallback
      this.startPollingFallback();
    }
  }

  private startPollingFallback() {
    console.log('Starting polling fallback for profile updates');
    setInterval(() => {
      this.checkForUpdates();
    }, 30000); // Poll every 30 seconds
  }

  private async checkForUpdates() {
    // This would make API calls to check for updates
    // Implementation depends on your API structure
    try {
      // Example: const response = await api.get('/api/doctor/profile/updates');
      // if (response.data.hasUpdates) {
      //   this.notifyListeners('all', response.data.updates);
      // }
    } catch (error) {
      console.error('Error checking for profile updates:', error);
    }
  }

  // Event listener management
  public onUpdate(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  private notifyListeners(type: string, data: any) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
    
    // Also notify general 'profile' listeners
    const generalListeners = this.listeners.get('profile');
    if (generalListeners) {
      generalListeners.forEach(callback => callback(data));
    }
  }

  // Manual emit functions (for when you make changes locally)
  public emitEducationUpdate(data: EducationUpdateEvent | DoctorEducation) {
    this.socket?.emit('education_update', data);
  }

  public emitContactUpdate(data: DoctorContactInfo) {
    this.socket?.emit('contact_update', data);
  }

  public emitAvailabilityUpdate(data: DoctorAvailability[]) {
    this.socket?.emit('availability_update', data);
  }

  public emitSettingsUpdate(data: DoctorSettings) {
    this.socket?.emit('settings_update', data);
  }

  // Disconnect
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Connection status
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Convenience methods for specific event types
  public onAppointmentUpdate(callback: (data: any) => void): () => void {
    return this.onUpdate('appointment_update', callback);
  }

  public onProfileUpdate(callback: (data: any) => void): () => void {
    return this.onUpdate('profile_update', callback);
  }

  public onEducationUpdate(callback: (data: any) => void): () => void {
    return this.onUpdate('education_update', callback);
  }

  public onContactUpdate(callback: (data: any) => void): () => void {
    return this.onUpdate('contact_update', callback);
  }
}

// Singleton instance
export const profileWebSocket = new ProfileWebSocketService();

// Hook for React components
export const useProfileWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = profileWebSocket.onUpdate('profile', () => {
      setIsConnected(profileWebSocket.isConnected());
    });

    setIsConnected(profileWebSocket.isConnected());

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    onUpdate: profileWebSocket.onUpdate.bind(profileWebSocket),
    emitEducationUpdate: profileWebSocket.emitEducationUpdate.bind(profileWebSocket),
    emitContactUpdate: profileWebSocket.emitContactUpdate.bind(profileWebSocket),
    emitAvailabilityUpdate: profileWebSocket.emitAvailabilityUpdate.bind(profileWebSocket),
    emitSettingsUpdate: profileWebSocket.emitSettingsUpdate.bind(profileWebSocket)
  };
};
