const { BusStop, BusETA, Bus, BusStopSequence, CrowdStatus } = require('../models');

const stopController = {
  // GET /api/stops - Get all stops with optional filters
  async getAllStops(req, res) {
    try {
      const { city, route_id } = req.query;
      
      let stops;

      if (route_id) {
        // Get stops for specific route
        const sequences = await BusStopSequence.find({ route_id })
          .sort({ stop_order: 1 })
          .lean();
        
        const stopIds = sequences.map(seq => seq.stop_id);
        stops = await BusStop.find({ stop_id: { $in: stopIds } }).lean();
        
        // Add stop_order to each stop
        stops = stops.map(stop => {
          const seq = sequences.find(s => s.stop_id === stop.stop_id);
          return { ...stop, stop_order: seq?.stop_order };
        }).sort((a, b) => a.stop_order - b.stop_order);
      } else {
        // Get all stops or filter by city
        const filter = city ? { city } : {};
        stops = await BusStop.find(filter).lean();
      }

      res.json({
        count: stops.length,
        stops,
      });
    } catch (error) {
      console.error('Get all stops error:', error);
      res.status(500).json({ error: 'Failed to fetch stops' });
    }
  },

  // GET /api/stops/:stop_id - Get specific stop details
  async getStopById(req, res) {
    try {
      const { stop_id } = req.params;

      const stop = await BusStop.findOne({ stop_id }).lean();

      if (!stop) {
        return res.status(404).json({ error: 'Stop not found' });
      }

      res.json(stop);
    } catch (error) {
      console.error('Get stop by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch stop details' });
    }
  },

  // GET /api/stops/:stop_id/arrivals - Get arriving buses at stop
  async getStopArrivals(req, res) {
    try {
      const { stop_id } = req.params;

      // Get ETAs for this stop
      const etas = await BusETA.find({ stop_id })
        .sort({ eta_minutes: 1 })
        .lean();

      // Get bus and crowd info for each ETA
      const arrivals = await Promise.all(
        etas.map(async (eta) => {
          const bus = await Bus.findOne({ bus_id: eta.bus_id }).lean();
          const crowd = await CrowdStatus.findOne({ bus_id: eta.bus_id })
            .sort({ timestamp: -1 })
            .lean();

          return {
            ...eta,
            bus,
            crowd_level: crowd?.crowd_level || 'Unknown',
          };
        })
      );

      res.json({
        stop_id,
        upcoming_buses: arrivals,
      });
    } catch (error) {
      console.error('Get stop arrivals error:', error);
      res.status(500).json({ error: 'Failed to fetch stop arrivals' });
    }
  },
};

module.exports = stopController;
