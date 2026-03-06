'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import { adminAPI } from '@/lib/api';
import { connectSocket, onBusLocationUpdate, disconnectSocket } from '@/lib/socket';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBuses: 0,
    runningBuses: 0,
    totalRoutes: 0,
    activeBuses: 0,
  });
  const [analytics, setAnalytics] = useState({
    fleetStatus: [],
    crowdStats: [],
    busiestRoutes: [],
    avg_eta_minutes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    // Connect to Socket.io for real-time updates
    const socket = connectSocket();

    // Listen for bus updates
    onBusLocationUpdate(() => {
      loadDashboardData();
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [busesRes, routesRes, analyticsRes] = await Promise.all([
        adminAPI.getAllBuses(),
        adminAPI.getAllRoutes(),
        adminAPI.getAnalytics(),
      ]);

      const buses = busesRes.data.buses;
      const routes = routesRes.data.routes;
      const analyticsData = analyticsRes.data;

      setStats({
        totalBuses: buses.length,
        runningBuses: buses.filter((b) => b.status === 'running' || b.status === 'Running').length,
        totalRoutes: routes.length,
        activeBuses: routes.reduce((sum, r) => sum + (r.active_buses || 0), 0),
      });

      setAnalytics({
        fleetStatus: analyticsData.fleetStatus || [],
        crowdStats: analyticsData.crowdStats || [],
        busiestRoutes: analyticsData.busiestRoutes || [],
        avg_eta_minutes: analyticsData.avg_eta_minutes || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 30, color: 'white' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography variant="h6">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Buses"
            value={stats.totalBuses}
            icon={DirectionsBusIcon}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Running Buses"
            value={stats.runningBuses}
            icon={TrendingUpIcon}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Routes"
            value={stats.totalRoutes}
            icon={RouteIcon}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active on Routes"
            value={stats.activeBuses}
            icon={PeopleIcon}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Analytics Section */}
      {analytics && (
        <>
          {/* Fleet Status */}
          {analytics.fleetStatus && analytics.fleetStatus.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Fleet Status
              </Typography>
              <Grid container spacing={2}>
                {analytics.fleetStatus.map((status, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                        {status.count}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                        {status.status}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Crowd Statistics */}
          {analytics.crowdStats && analytics.crowdStats.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Crowd Statistics
              </Typography>
              <Grid container spacing={2}>
                {analytics.crowdStats.map((crowd, index) => (
                  <Grid item xs={4} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 'bold',
                          color:
                            crowd.crowd_level === 'Low'
                              ? '#4CAF50'
                              : crowd.crowd_level === 'Medium'
                              ? '#FF9800'
                              : '#F44336',
                        }}
                      >
                        {crowd.count}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {crowd.crowd_level} Crowd
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Busiest Routes */}
          {analytics.busiestRoutes && analytics.busiestRoutes.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Busiest Routes
              </Typography>
              {analytics.busiestRoutes.map((route, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: index < analytics.busiestRoutes.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: '500' }}>
                      {route.route_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Route ID: {route.route_id}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                      {route.bus_count}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Buses
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
