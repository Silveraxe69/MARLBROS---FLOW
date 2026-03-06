const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema({
  stop_id: {
    type: String,
    required: true,
    unique: true,
  },
  stop_name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for geospatial queries
busStopSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('BusStop', busStopSchema);
