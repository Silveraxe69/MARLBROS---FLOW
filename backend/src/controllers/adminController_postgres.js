const db = require('../database/db');

const adminController = {
  // GET /api/admin/buses
  async getAllBuses(req, res) {
    try {
      const result = await db.query(`
        SELECT 
          b.*,
          r.route_name,
          r.start_stop,
          r.end_stop,
          l.latitude,
          l.longitude,
          l.speed,
          l.timestamp as last_updated,
          c.crowd_level
        FROM buses b
        LEFT JOIN routes r ON b.route_id = r.route_id
        LEFT JOIN LATERAL (
          SELECT latitude, longitude, speed, timestamp
          FROM bus_location
          WHERE bus_id = b.bus_id
          ORDER BY timestamp DESC
          LIMIT 1
        ) l ON true
        LEFT JOIN LATERAL (
          SELECT crowd_level
          FROM crowd_status
          WHERE bus_id = b.bus_id
          ORDER BY timestamp DESC
          LIMIT 1
        ) c ON true
        ORDER BY b.bus_id
      `);

      res.json({ buses: result.rows });
    } catch (error) {
      console.error('Admin get all buses error:', error);
      res.status(500).json({ error: 'Failed to fetch buses' });
    }
  },

  // GET /api/admin/routes
  async getAllRoutes(req, res) {
    try {
      const result = await db.query(`
        SELECT 
          r.*,
          COUNT(DISTINCT b.bus_id) as active_buses,
          COUNT(DISTINCT seq.stop_id) as total_stops
        FROM routes r
        LEFT JOIN buses b ON r.route_id = b.route_id AND b.status = 'running'
        LEFT JOIN bus_stop_sequence seq ON r.route_id = seq.route_id
        GROUP BY r.route_id
        ORDER BY r.route_id
      `);

      res.json({ routes: result.rows });
    } catch (error) {
      console.error('Admin get all routes error:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  },

  // GET /api/admin/analytics
  async getAnalytics(req, res) {
    try {
      // Get busiest routes
      const busiestRoutes = await db.query(`
        SELECT 
          r.route_id,
          r.route_name,
          COUNT(DISTINCT b.bus_id) as bus_count,
          AVG(e.eta_minutes) as avg_eta
        FROM routes r
        LEFT JOIN buses b ON r.route_id = b.route_id
        LEFT JOIN bus_eta e ON b.bus_id = e.bus_id
        GROUP BY r.route_id, r.route_name
        ORDER BY bus_count DESC
        LIMIT 5
      `);

      // Get average ETA delay
      const avgDelay = await db.query(`
        SELECT AVG(eta_minutes) as avg_delay_minutes
        FROM bus_eta
      `);

      // Get crowd statistics
      const crowdStats = await db.query(`
        SELECT 
          crowd_level,
          COUNT(*) as count
        FROM crowd_status
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        GROUP BY crowd_level
      `);

      // Get fleet status
      const fleetStatus = await db.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM buses
        GROUP BY status
      `);

      res.json({
        busiestRoutes: busiestRoutes.rows,
        avgDelay: avgDelay.rows[0]?.avg_delay_minutes || 0,
        crowdStats: crowdStats.rows,
        fleetStatus: fleetStatus.rows
      });
    } catch (error) {
      console.error('Admin get analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  // GET /api/admin/fleet-status
  async getFleetStatus(req, res) {
    try {
      const result = await db.query(`
        SELECT 
          b.bus_id,
          b.route_id,
          b.status,
          l.latitude,
          l.longitude,
          l.speed,
          l.timestamp,
          CASE 
            WHEN l.speed = 0 THEN 'stopped'
            WHEN l.speed > 0 AND l.speed < 20 THEN 'slow'
            WHEN l.timestamp < NOW() - INTERVAL '5 minutes' THEN 'delayed'
            ELSE 'running'
          END as real_time_status
        FROM buses b
        LEFT JOIN LATERAL (
          SELECT latitude, longitude, speed, timestamp
          FROM bus_location
          WHERE bus_id = b.bus_id
          ORDER BY timestamp DESC
          LIMIT 1
        ) l ON true
      `);

      res.json({ fleet: result.rows });
    } catch (error) {
      console.error('Admin get fleet status error:', error);
      res.status(500).json({ error: 'Failed to fetch fleet status' });
    }
  }
};

module.exports = adminController;
