'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import RouteIcon from '@mui/icons-material/Route';
import { adminAPI } from '@/lib/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading analytics...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Analytics & Insights
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Average ETA Delay
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics?.avgDelay?.toFixed(1) || 0} min
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RouteIcon sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Active Routes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics?.busiestRoutes?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#FF9800', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Fleet
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics?.fleetStatus?.reduce((sum, s) => sum + s.count, 0) || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Busiest Routes */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Busiest Routes
        </Typography>
        <Grid container spacing={2}>
          {analytics?.busiestRoutes?.map((route, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {route.route_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Route ID: {route.route_id}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                        {route.bus_count}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Active Buses
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Avg ETA: {route.avg_eta?.toFixed(1) || 'N/A'} minutes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Crowd Statistics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Crowd Level Distribution
        </Typography>
        <Grid container spacing={3}>
          {analytics?.crowdStats?.map((crowd, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card
                sx={{
                  backgroundColor:
                    crowd.crowd_level === 'Low'
                      ? '#e8f5e9'
                      : crowd.crowd_level === 'Medium'
                      ? '#fff3e0'
                      : '#ffebee',
                }}
              >
                <CardContent>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {crowd.count}
                  </Typography>
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: 1 }}>
                    {crowd.crowd_level} Crowd Level
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Fleet Status */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Fleet Status Breakdown
        </Typography>
        <Grid container spacing={2}>
          {analytics?.fleetStatus?.map((status, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                    {status.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize', mt: 1 }}>
                    {status.status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
