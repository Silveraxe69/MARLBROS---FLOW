const { Bus, Route, BusLocation, BusETA, BusStopSequence, CrowdStatus } = require('../models');

const adminController = {
  // GET /api/admin/buses - Get all buses with detailed info
  async getAllBuses(req, res) {
    try {
      const buses = await Bus.find({}).lean();

      const busesWithDetails = await Promise.all(
        buses.map(async (bus) => {
          const location = await BusLocation.findOne({ bus_id: bus.bus_id })
            .sort({ timestamp: -1 })
            .lean();
          
          const crowd = await CrowdStatus.findOne({ bus_id: bus.bus_id })
            .sort({ timestamp: -1 })
            .lean();

          const route = await Route.findOne({ route_id: bus.route_id }).lean();

          return {
            ...bus,
            current_location: location,
            crowd_level: crowd?.crowd_level || 'Unknown',
            route_name: route?.route_name || 'Unknown',
          };
        })
      );

      res.json({
        count: busesWithDetails.length,
        buses: busesWithDetails,
      });
    } catch (error) {
      console.error('Admin get all buses error:', error);
      res.status(500).json({ error: 'Failed to fetch buses' });
    }
  },

  // GET /api/admin/routes - Get all routes with statistics
  async getAllRoutes(req, res) {
    try {
      const routes = await Route.find({}).lean();

      const routesWithStats = await Promise.all(
        routes.map(async (route) => {
          const activeBuses = await Bus.countDocuments({
            route_id: route.route_id,
            status: 'running',
          });

          const totalStops = await BusStopSequence.countDocuments({
            route_id: route.route_id,
          });

          return {
            ...route,
            active_buses: activeBuses,
            total_stops: totalStops,
          };
        })
      );

      res.json({
        count: routesWithStats.length,
        routes: routesWithStats,
      });
    } catch (error) {
      console.error('Admin get all routes error:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  },

  // GET /api/admin/analytics - Get system analytics
  async getAnalytics(req, res) {
    try {
      const totalBuses = await Bus.countDocuments({});
      const runningBuses = await Bus.countDocuments({ status: 'running' });
      const totalRoutes = await Route.countDocuments({});

      // Get average ETA delay (simplified)
      const avgETA = await BusETA.aggregate([
        {
          $group: {
            _id: null,
            avg_eta: { $avg: '$eta_minutes' },
          },
        },
      ]);

      // Get crowd distribution
      const crowdDistribution = await CrowdStatus.aggregate([
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: '$bus_id',
            latest_crowd: { $first: '$crowd_level' },
          },
        },
        {
          $group: {
            _id: '$latest_crowd',
            count: { $sum: 1 },
          },
        },
      ]);

      // Get fleet status by bus status
      const fleetStatusData = await Bus.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const fleetStatus = fleetStatusData.map(item => ({
        status: item._id,
        count: item.count,
      }));

      // Get busiest routes
      const busiestRoutesData = await Bus.aggregate([
        {
          $group: {
            _id: '$route_id',
            bus_count: { $sum: 1 },
          },
        },
        {
          $sort: { bus_count: -1 },
        },
        {
          $limit: 5,
        },
      ]);

      const busiestRoutes = await Promise.all(
        busiestRoutesData.map(async (item) => {
          const route = await Route.findOne({ route_id: item._id }).lean();
          return {
            route_id: item._id,
            route_name: route?.route_name || `${route?.start_stop} - ${route?.end_stop}` || 'Unknown',
            bus_count: item.bus_count,
          };
        })
      );

      res.json({
        total_buses: totalBuses,
        running_buses: runningBuses,
        total_routes: totalRoutes,
        avg_eta_minutes: avgETA[0]?.avg_eta || 0,
        crowd_distribution: crowdDistribution,
        fleetStatus: fleetStatus,
        crowdStats: crowdDistribution.map(item => ({
          crowd_level: item._id,
          count: item.count,
        })),
        busiestRoutes: busiestRoutes,
      });
    } catch (error) {
      console.error('Admin get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  // GET /api/admin/fleet-status - Get real-time fleet status
  async getFleetStatus(req, res) {
    try {
      const buses = await Bus.find({}).lean();

      const fleetStatus = await Promise.all(
        buses.map(async (bus) => {
          const location = await BusLocation.findOne({ bus_id: bus.bus_id })
            .sort({ timestamp: -1 })
            .lean();

          return {
            bus_id: bus.bus_id,
            route_id: bus.route_id,
            status: bus.status,
            last_updated: location?.timestamp || null,
            speed: location?.speed || 0,
            position: location ? {
              latitude: location.latitude,
              longitude: location.longitude,
            } : null,
          };
        })
      );

      res.json({
        timestamp: new Date(),
        fleet: fleetStatus,
      });
    } catch (error) {
      console.error('Admin get fleet status error:', error);
      res.status(500).json({ error: 'Failed to fetch fleet status' });
    }
  },
};

module.exports = adminController;
