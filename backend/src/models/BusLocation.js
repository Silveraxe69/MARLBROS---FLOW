const mongoose = require('mongoose');

const busLocationSchema = new mongoose.Schema({
  bus_id: {
    type: String,
    required: true,
    ref: 'Bus',
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  speed: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
busLocationSchema.index({ bus_id: 1, timestamp: -1 });
busLocationSchema.index({ timestamp: -1 });

module.exports = mongoose.model('BusLocation', busLocationSchema);
