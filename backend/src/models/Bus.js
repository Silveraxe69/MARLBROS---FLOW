const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  bus_id: {
    type: String,
    required: true,
    unique: true,
  },
  route_id: {
    type: String,
    required: true,
    ref: 'Route',
  },
  bus_color: {
    type: String,
    required: true,
  },
  service_type: {
    type: String,
    enum: ['Intercity', 'Superfast', 'Women_Free', 'Deluxe', 'Sleeper', 'AC', 'Non-AC'],
    required: true,
  },
  women_bus: {
    type: Boolean,
    default: false,
  },
  accessible: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Running', 'Stopped', 'Delayed', 'Maintenance', 'running', 'stopped', 'delayed', 'maintenance'],
    default: 'Stopped',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
busSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Bus', busSchema);
