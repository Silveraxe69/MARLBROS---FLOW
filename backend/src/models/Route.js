const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  route_id: {
    type: String,
    required: true,
    unique: true,
  },
  route_name: {
    type: String,
    required: false,
  },
  start_stop: {
    type: String,
    required: true,
  },
  end_stop: {
    type: String,
    required: true,
  },
  distance_km: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Route', routeSchema);
