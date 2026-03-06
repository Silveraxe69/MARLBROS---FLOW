const mongoose = require('mongoose');

const busStopSequenceSchema = new mongoose.Schema({
  route_id: {
    type: String,
    required: true,
    ref: 'Route',
  },
  stop_id: {
    type: String,
    required: true,
    ref: 'BusStop',
  },
  stop_order: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
busStopSequenceSchema.index({ route_id: 1, stop_order: 1 });

module.exports = mongoose.model('BusStopSequence', busStopSequenceSchema);
