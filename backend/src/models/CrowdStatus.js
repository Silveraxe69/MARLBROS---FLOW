const mongoose = require('mongoose');

const crowdStatusSchema = new mongoose.Schema({
  bus_id: {
    type: String,
    required: true,
    ref: 'Bus',
  },
  stop_id: {
    type: String,
    ref: 'BusStop',
  },
  crowd_level: {
    type: String,
    enum: ['Low', 'Medium', 'Full'],
    required: true,
  },
  user_id: {
    type: String,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
crowdStatusSchema.index({ bus_id: 1, timestamp: -1 });
crowdStatusSchema.index({ timestamp: -1 });

module.exports = mongoose.model('CrowdStatus', crowdStatusSchema);
