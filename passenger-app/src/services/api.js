import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localhost for web platform, network IP for mobile
const getAPIURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }
  return Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';
};

const API_URL = getAPIURL();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
};

// Bus API
export const busAPI = {
  getAllBuses: (params) => 
    api.get('/buses', { params }),
  
  getBusById: (busId) => 
    api.get(`/buses/${busId}`),
  
  getBusLocation: (busId) => 
    api.get(`/buses/${busId}/location`),
  
  getBusETA: (busId) => 
    api.get(`/buses/${busId}/eta`),
};

// Stop API
export const stopAPI = {
  getAllStops: (params) => 
    api.get('/stops', { params }),
  
  getStopById: (stopId) => 
    api.get(`/stops/${stopId}`),
  
  getStopArrivals: (stopId) => 
    api.get(`/stops/${stopId}/arrivals`),
};

// Crowd API
export const crowdAPI = {
  updateCrowdStatus: (data) => 
    api.post('/crowd/update', data),
  
  getCrowdStatus: (busId) => 
    api.get(`/crowd/${busId}`),
};

export default api;
