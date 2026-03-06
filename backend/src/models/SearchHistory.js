const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  search_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User',
  },
  from_stop: {
    type: String,
    required: true,
  },
  to_stop: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
searchHistorySchema.index({ user_id: 1, created_at: -1 });
searchHistorySchema.index({ from_stop: 1, to_stop: 1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
