// Export all models
const User = require('./User');
const Route = require('./Route');
const BusStop = require('./BusStop');
const Bus = require('./Bus');
const BusStopSequence = require('./BusStopSequence');
const BusLocation = require('./BusLocation');
const BusETA = require('./BusETA');
const CrowdStatus = require('./CrowdStatus');
const SearchHistory = require('./SearchHistory');

module.exports = {
  User,
  Route,
  BusStop,
  Bus,
  BusStopSequence,
  BusLocation,
  BusETA,
  CrowdStatus,
  SearchHistory,
};
