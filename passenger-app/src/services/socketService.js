import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Use localhost for web platform, network IP for mobile
const getSocketURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  return Constants.expoConfig?.extra?.socketUrl || 'http://localhost:5000';
};

const SOCKET_URL = getSocketURL();

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'], // Try polling first (more reliable)
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000, // Increased timeout to 20 seconds
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        this.reconnectAttempts++;
        this.isConnecting = false;
        
        // Only log on first attempt and max attempts to reduce noise
        if (this.reconnectAttempts === 1) {
          console.warn('⚠️  Socket connection error:', error.message || 'timeout');
          console.log('🔄 Retrying connection...');
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('❌ Max reconnection attempts reached. Socket will retry later.');
        }
      });

      this.socket.on('error', (error) => {
        console.warn('⚠️  Socket error:', error.message);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to bus updates
  joinBus(busId) {
    if (this.socket) {
      this.socket.emit('join_bus', busId);
    }
  }

  // Subscribe to stop updates
  joinStop(stopId) {
    if (this.socket) {
      this.socket.emit('join_stop', stopId);
    }
  }

  // Subscribe to route updates
  joinRoute(routeId) {
    if (this.socket) {
      this.socket.emit('join_route', routeId);
    }
  }

  // Listen for bus location updates
  onBusLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('bus_location_update', callback);
    }
  }

  // Listen for bus ETA updates
  onBusETAUpdate(callback) {
    if (this.socket) {
      this.socket.on('bus_eta_update', callback);
    }
  }

  // Listen for crowd updates
  onCrowdUpdate(callback) {
    if (this.socket) {
      this.socket.on('crowd_update', callback);
    }
  }

  // Listen for bus arrivals
  onBusArrival(callback) {
    if (this.socket) {
      this.socket.on('bus_arrival', callback);
    }
  }

  // Remove specific listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
