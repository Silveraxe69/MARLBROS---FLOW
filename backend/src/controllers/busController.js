const { Bus, BusLocation, BusETA, Route, BusStopSequence, BusStop } = require('../models');

const busController = {
  // GET /api/buses - Get all buses with optional filters
  async getAllBuses(req, res) {
    try {
      const { route_id, status, service_type, bus_color, women_bus, accessible } = req.query;
      
      const filter = {};
      if (route_id) filter.route_id = route_id;
      if (status) filter.status = status;
      if (service_type) filter.service_type = service_type;
      if (bus_color) filter.bus_color = bus_color;
      if (women_bus !== undefined) filter.women_bus = women_bus === 'true' || women_bus === 'Yes';
      if (accessible !== undefined) filter.accessible = accessible === 'true' || accessible === 'Yes';

      const buses = await Bus.find(filter).lean();

      // Get latest location for each bus
      const busesWithLocation = await Promise.all(
        buses.map(async (bus) => {
          const location = await BusLocation.findOne({ bus_id: bus.bus_id })
            .sort({ timestamp: -1 })
            .lean();
          
          return {
            ...bus,
            current_location: location || null,
          };
        })
      );

      res.json({
        count: busesWithLocation.length,
        buses: busesWithLocation,
      });
    } catch (error) {
      console.error('Get all buses error:', error);
      res.status(500).json({ error: 'Failed to fetch buses' });
    }
  },

  // GET /api/buses/:bus_id - Get specific bus details
  async getBusById(req, res) {
    try {
      const { bus_id } = req.params;

      const bus = await Bus.findOne({ bus_id }).lean();

      if (!bus) {
        return res.status(404).json({ error: 'Bus not found' });
      }

      // Get latest location
      const location = await BusLocation.findOne({ bus_id })
        .sort({ timestamp: -1 })
        .lean();

      // Get route info
      const route = await Route.findOne({ route_id: bus.route_id }).lean();

      res.json({
        ...bus,
        current_location: location,
        route: route,
      });
    } catch (error) {
      console.error('Get bus by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch bus details' });
    }
  },

  // GET /api/buses/:bus_id/location - Get current location
  async getBusLocation(req, res) {
    try {
      const { bus_id } = req.params;

      const location = await BusLocation.findOne({ bus_id })
        .sort({ timestamp: -1 })
        .lean();

      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }

      res.json(location);
    } catch (error) {
      console.error('Get bus location error:', error);
      res.status(500).json({ error: 'Failed to fetch bus location' });
    }
  },

  // GET /api/buses/:bus_id/eta - Get ETA for upcoming stops
  async getBusETA(req, res) {
    try {
      const { bus_id } = req.params;

      const etas = await BusETA.find({ bus_id })
        .sort({ eta_minutes: 1 })
        .lean();

      // Get stop details for each ETA
      const etasWithStops = await Promise.all(
        etas.map(async (eta) => {
          const stop = await BusStop.findOne({ stop_id: eta.stop_id }).lean();
          return {
            ...eta,
            stop: stop,
          };
        })
      );

      res.json({
        bus_id,
        upcoming_stops: etasWithStops,
      });
    } catch (error) {
      console.error('Get bus ETA error:', error);
      res.status(500).json({ error: 'Failed to fetch bus ETA' });
    }
  },
};

module.exports = busController;
