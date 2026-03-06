'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { adminAPI } from '@/lib/api';
import { connectSocket, onBusLocationUpdate, disconnectSocket } from '@/lib/socket';

export default function FleetPage() {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuses();

    // Connect to Socket.io for real-time updates
    connectSocket();

    onBusLocationUpdate((data) => {
      updateBusLocation(data);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    // Filter buses based on search query
    if (searchQuery) {
      const filtered = buses.filter(
        (bus) =>
          bus.bus_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bus.route_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuses(filtered);
    } else {
      setFilteredBuses(buses);
    }
  }, [searchQuery, buses]);

  const loadBuses = async () => {
    try {
      const response = await adminAPI.getAllBuses();
      setBuses(response.data.buses);
      setFilteredBuses(response.data.buses);
    } catch (error) {
      console.error('Error loading buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBusLocation = (locationData) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) =>
        bus.bus_id === locationData.bus_id
          ? {
              ...bus,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              speed: locationData.speed,
              last_updated: locationData.timestamp,
            }
          : bus
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'warning';
      case 'delayed':
        return 'error';
      case 'maintenance':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCrowdColor = (level) => {
    switch (level) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Full':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Fleet Monitoring
        </Typography>
        <IconButton onClick={loadBuses} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by Bus ID or Route..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Fleet Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Bus ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Route</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Speed (km/h)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Crowd Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Service Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBuses.map((bus) => (
              <TableRow key={bus.bus_id} hover>
                <TableCell sx={{ fontWeight: '500' }}>{bus.bus_id}</TableCell>
                <TableCell>
                  <Typography variant="body2">{bus.route_name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {bus.start_stop} → {bus.end_stop}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={bus.status}
                    color={getStatusColor(bus.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  {bus.speed ? bus.speed.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell>
                  {bus.crowd_level ? (
                    <Chip
                      label={bus.crowd_level}
                      color={getCrowdColor(bus.crowd_level)}
                      size="small"
                    />
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip label={bus.service_type} size="small" variant="outlined" />
                    {bus.women_bus && (
                      <Chip label="Women" size="small" color="secondary" />
                    )}
                    {bus.accessible && (
                      <Chip label="♿" size="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {bus.last_updated
                      ? new Date(bus.last_updated).toLocaleTimeString()
                      : 'N/A'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredBuses.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="textSecondary">No buses found</Typography>
        </Box>
      )}
    </Box>
  );
}
