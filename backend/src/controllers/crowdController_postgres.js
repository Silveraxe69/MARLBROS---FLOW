const db = require('../database/db');

const crowdController = {
  // POST /api/crowd/update
  async updateCrowdStatus(req, res) {
    try {
      const { bus_id, stop_id, crowd_level, user_id } = req.body;

      // Validate input
      if (!bus_id || !crowd_level) {
        return res.status(400).json({ error: 'bus_id and crowd_level are required' });
      }

      if (!['Low', 'Medium', 'Full'].includes(crowd_level)) {
        return res.status(400).json({ error: 'Invalid crowd_level. Must be Low, Medium, or Full' });
      }

      // Insert crowd status
      const result = await db.query(
        `INSERT INTO crowd_status (bus_id, stop_id, crowd_level, user_id, timestamp)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [bus_id, stop_id || null, crowd_level, user_id || null]
      );

      // Emit real-time update via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.emit('crowd_update', {
          bus_id,
          stop_id,
          crowd_level,
          timestamp: result.rows[0].timestamp
        });
      }

      res.status(201).json({
        message: 'Crowd status updated successfully',
        crowdStatus: result.rows[0]
      });
    } catch (error) {
      console.error('Update crowd status error:', error);
      res.status(500).json({ error: 'Failed to update crowd status' });
    }
  },

  // GET /api/crowd/:bus_id
  async getCrowdStatus(req, res) {
    try {
      const { bus_id } = req.params;

      const result = await db.query(
        `SELECT * FROM crowd_status 
         WHERE bus_id = $1 
         ORDER BY timestamp DESC 
         LIMIT 1`,
        [bus_id]
      );

      if (result.rows.length === 0) {
        return res.json({ crowdStatus: { crowd_level: 'Low' } });
      }

      res.json({ crowdStatus: result.rows[0] });
    } catch (error) {
      console.error('Get crowd status error:', error);
      res.status(500).json({ error: 'Failed to fetch crowd status' });
    }
  }
};

module.exports = crowdController;
