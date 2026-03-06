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
} from '@mui/material';
import { adminAPI } from '@/lib/api';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await adminAPI.getAllRoutes();
      setRoutes(response.data.routes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Routes Management
      </Typography>

      {/* Routes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Route ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Route Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Start → End</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Distance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Active Buses</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Stops</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.route_id} hover>
                <TableCell sx={{ fontWeight: '500' }}>{route.route_id}</TableCell>
                <TableCell>{route.route_name}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {route.start_stop}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ↓
                  </Typography>
                  <Typography variant="body2">
                    {route.end_stop}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${route.distance_km} km`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={route.active_buses || 0}
                    color={route.active_buses > 0 ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={route.total_stops || 0}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {routes.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="textSecondary">No routes found</Typography>
        </Box>
      )}
    </Box>
  );
}
