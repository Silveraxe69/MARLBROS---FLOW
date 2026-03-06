const db = require('../database/db');

const stopController = {
  // GET /api/stops
  async getAllStops(req, res) {
    try {
      const { city, route_id } = req.query;

      let query = 'SELECT * FROM bus_stops WHERE 1=1';
      const params = [];

      if (city) {
        params.push(city);
        query += ` AND city = $${params.length}`;
      }

      if (route_id) {
        query = `
          SELECT DISTINCT s.* 
          FROM bus_stops s
          JOIN bus_stop_sequence seq ON s.stop_id = seq.stop_id
          WHERE seq.route_id = $1
          ORDER BY seq.stop_order
        `;
        params.length = 0;
        params.push(route_id);
      } else {
        query += ' ORDER BY stop_name';
      }

      const result = await db.query(query, params);
      res.json({ stops: result.rows });
    } catch (error) {
      console.error('Get all stops error:', error);
      res.status(500).json({ error: 'Failed to fetch stops' });
    }
  },

  // GET /api/stops/:stop_id
  async getStopById(req, res) {
    try {
      const { stop_id } = req.params;

      const result = await db.query(
        'SELECT * FROM bus_stops WHERE stop_id = $1',
        [stop_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Stop not found' });
      }

      res.json({ stop: result.rows[0] });
    } catch (error) {
      console.error('Get stop by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch stop' });
    }
  },

  // GET /api/stops/:stop_id/arrivals
  async getStopArrivals(req, res) {
    try {
      const { stop_id } = req.params;

      const result = await db.query(
        `SELECT 
          e.bus_id,
          e.eta_minutes,
          b.bus_color,
          b.service_type,
          b.women_bus,
          b.accessible,
          r.route_name,
          r.start_stop,
          r.end_stop,
          c.crowd_level
         FROM bus_eta e
         JOIN buses b ON e.bus_id = b.bus_id
         JOIN routes r ON b.route_id = r.route_id
         LEFT JOIN LATERAL (
           SELECT crowd_level 
           FROM crowd_status 
           WHERE bus_id = e.bus_id 
           ORDER BY timestamp DESC 
           LIMIT 1
         ) c ON true
         WHERE e.stop_id = $1 AND b.status = 'running'
         ORDER BY e.eta_minutes ASC
         LIMIT 10`,
        [stop_id]
      );

      res.json({ arrivals: result.rows });
    } catch (error) {
      console.error('Get stop arrivals error:', error);
      res.status(500).json({ error: 'Failed to fetch stop arrivals' });
    }
  }
};

module.exports = stopController;
