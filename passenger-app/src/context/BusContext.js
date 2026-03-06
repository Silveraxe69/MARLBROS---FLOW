import React, { createContext, useState, useEffect, useContext } from 'react';
import { busAPI, stopAPI } from '../services/api';
import socketService from '../services/socketService';

const BusContext = createContext();

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within BusProvider');
  }
  return context;
};

export const BusProvider = ({ children }) => {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Connect socket
    socketService.connect();

    // Listen for real-time updates
    socketService.onBusLocationUpdate(handleBusLocationUpdate);
    socketService.onBusETAUpdate(handleBusETAUpdate);
    socketService.onCrowdUpdate(handleCrowdUpdate);

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const handleBusLocationUpdate = (data) => {
    setBuses((prev) =>
      prev.map((bus) =>
        bus.bus_id === data.bus_id
          ? {
              ...bus,
              latitude: data.latitude,
              longitude: data.longitude,
              speed: data.speed,
            }
          : bus
      )
    );
  };

  const handleBusETAUpdate = (data) => {
    // Update ETA for the bus
    if (selectedBus?.bus_id === data.bus_id) {
      setSelectedBus((prev) => ({
        ...prev,
        eta: data,
      }));
    }
  };

  const handleCrowdUpdate = (data) => {
    setBuses((prev) =>
      prev.map((bus) =>
        bus.bus_id === data.bus_id
          ? { ...bus, crowd_level: data.crowd_level }
          : bus
      )
    );
  };

  const fetchBuses = async (params = {}) => {
    setLoading(true);
    try {
      const response = await busAPI.getAllBuses(params);
      setBuses(response.data.buses);
      return { success: true, data: response.data.buses };
    } catch (error) {
      console.error('Error fetching buses:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchStops = async (params = {}) => {
    setLoading(true);
    try {
      const response = await stopAPI.getAllStops(params);
      setStops(response.data.stops);
      return { success: true, data: response.data.stops };
    } catch (error) {
      console.error('Error fetching stops:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchBusDetails = async (busId) => {
    try {
      const [busResponse, locationResponse, etaResponse] = await Promise.all([
        busAPI.getBusById(busId),
        busAPI.getBusLocation(busId),
        busAPI.getBusETA(busId),
      ]);

      const busDetails = {
        ...busResponse.data.bus,
        location: locationResponse.data.location,
        eta: etaResponse.data.eta,
      };

      setSelectedBus(busDetails);
      socketService.joinBus(busId);

      return { success: true, data: busDetails };
    } catch (error) {
      console.error('Error fetching bus details:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchStopArrivals = async (stopId) => {
    try {
      const response = await stopAPI.getStopArrivals(stopId);
      return { success: true, data: response.data.arrivals };
    } catch (error) {
      console.error('Error fetching stop arrivals:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    buses,
    stops,
    selectedBus,
    selectedStop,
    loading,
    fetchBuses,
    fetchStops,
    fetchBusDetails,
    fetchStopArrivals,
    setSelectedBus,
    setSelectedStop,
  };

  return <BusContext.Provider value={value}>{children}</BusContext.Provider>;
};
