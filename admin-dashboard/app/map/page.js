'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { adminAPI } from '@/lib/api';
import { connectSocket, onBusLocationUpdate, disconnectSocket } from '@/lib/socket';

export default function MapPage() {
  const [buses, setBuses] = useState([]);
  const [busLocations, setBusLocations] = useState({});

  useEffect(() => {
    loadBuses();

    // Connect Socket.io
    connectSocket();

    // Listen for real-time location updates
    onBusLocationUpdate((data) => {
      updateBusLocation(data);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const loadBuses = async () => {
    try {
      const response = await adminAPI.getAllBuses();
      const busData = response.data.buses;
      setBuses(busData);

      // Initialize bus locations
      const locations = {};
      busData.forEach((bus) => {
        if (bus.latitude && bus.longitude) {
          locations[bus.bus_id] = {
            latitude: bus.latitude,
            longitude: bus.longitude,
            speed: bus.speed || 0,
          };
        }
      });
      setBusLocations(locations);
    } catch (error) {
      console.error('Error loading buses:', error);
    }
  };

  const updateBusLocation = (locationData) => {
    setBusLocations((prev) => ({
      ...prev,
      [locationData.bus_id]: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        speed: locationData.speed,
      },
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Live Fleet Map
      </Typography>

      <Paper sx={{ p: 3, height: '70vh', position: 'relative' }}>
        {/* Placeholder for map integration */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="textSecondary" gutterBottom>
              🗺️ Map View
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              Integrate Mapbox or Google Maps here
            </Typography>
            <Chip label={`${buses.length} buses tracked`} color="primary" />
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Real-time tracking active
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {Object.keys(busLocations).length} buses with location data
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Live indicator */}
        <Chip
          label="LIVE"
          color="success"
          size="small"
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.7 },
            },
          }}
        />
      </Paper>

      {/* Instructions */}
      <Paper sx={{ p: 2, mt: 2, backgroundColor: '#e3f2fd' }}>
        <Typography variant="body2">
          <strong>Note:</strong> To enable map view, integrate Mapbox GL JS or Google Maps:
        </Typography>
        <Typography variant="caption" component="pre" sx={{ mt: 1, fontFamily: 'monospace' }}>
          {`npm install react-map-gl mapbox-gl
// Then use <Map /> component with bus markers`}
        </Typography>
      </Paper>
    </Box>
  );
}
