const mongoose = require('mongoose');

const busETASchema = new mongoose.Schema({
  bus_id: {
    type: String,
    required: true,
    ref: 'Bus',
  },
  stop_id: {
    type: String,
    required: true,
    ref: 'BusStop',
  },
  eta_minutes: {
    type: Number,
    required: true,
  },
  distance_km: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    enum: ['On Time', 'Delayed', 'Early'],
    default: 'On Time',
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
busETASchema.index({ bus_id: 1, stop_id: 1 });
busETASchema.index({ stop_id: 1, eta_minutes: 1 });

module.exports = mongoose.model('BusETA', busETASchema);
