const { CrowdStatus, Bus } = require('../models');

const crowdController = {
  // POST /api/crowd/update - Update crowd status
  async updateCrowdStatus(req, res) {
    try {
      const { bus_id, crowd_level, user_id, stop_id } = req.body;

      if (!bus_id || !crowd_level) {
        return res.status(400).json({ error: 'bus_id and crowd_level are required' });
      }

      // Validate crowd_level
      if (!['Low', 'Medium', 'Full'].includes(crowd_level)) {
        return res.status(400).json({ error: 'Invalid crowd_level. Must be Low, Medium, or Full' });
      }

      // Create crowd status record
      const crowdStatus = await CrowdStatus.create({
        bus_id,
        stop_id: stop_id || null,
        crowd_level,
        user_id: user_id || null,
        timestamp: new Date(),
      });

      // Emit socket event if io is available
      const io = req.app.get('io');
      if (io) {
        io.to(`bus_${bus_id}`).emit('crowd_update', {
          bus_id,
          crowd_level,
          timestamp: crowdStatus.timestamp,
        });
      }

      res.status(201).json({
        message: 'Crowd status updated successfully',
        crowd_status: crowdStatus,
      });
    } catch (error) {
      console.error('Update crowd status error:', error);
      res.status(500).json({ error: 'Failed to update crowd status' });
    }
  },

  // GET /api/crowd/:bus_id - Get current crowd status for bus
  async getCrowdStatus(req, res) {
    try {
      const { bus_id } = req.params;

      const crowdStatus = await CrowdStatus.findOne({ bus_id })
        .sort({ timestamp: -1 })
        .lean();

      if (!crowdStatus) {
        return res.json({
          bus_id,
          crowd_level: 'Unknown',
          message: 'No crowd data available',
        });
      }

      res.json(crowdStatus);
    } catch (error) {
      console.error('Get crowd status error:', error);
      res.status(500).json({ error: 'Failed to fetch crowd status' });
    }
  },
};

module.exports = crowdController;
