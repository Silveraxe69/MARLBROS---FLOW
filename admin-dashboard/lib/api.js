import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API
export const adminAPI = {
  // Fleet Management
  getAllBuses: () => api.get('/admin/buses'),
  
  // Routes Management
  getAllRoutes: () => api.get('/admin/routes'),
  
  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),
  
  // Fleet Status
  getFleetStatus: () => api.get('/admin/fleet-status'),
};

// Bus API
export const busAPI = {
  getAllBuses: (params) => api.get('/buses', { params }),
  getBusById: (busId) => api.get(`/buses/${busId}`),
  getBusLocation: (busId) => api.get(`/buses/${busId}/location`),
  getBusETA: (busId) => api.get(`/buses/${busId}/eta`),
};

// Stop API
export const stopAPI = {
  getAllStops: (params) => api.get('/stops', { params }),
  getStopById: (stopId) => api.get(`/stops/${stopId}`),
  getStopArrivals: (stopId) => api.get(`/stops/${stopId}/arrivals`),
};

export default api;
