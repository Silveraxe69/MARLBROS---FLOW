/**
 * Calculate ETA in minutes based on distance and speed
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} speedKmh - Speed in kilometers per hour
 * @returns {number} ETA in minutes
 */
function calculateETA(distanceKm, speedKmh) {
  if (speedKmh === 0) {
    return 999; // Bus is stopped, return very high ETA
  }

  const timeHours = distanceKm / speedKmh;
  const timeMinutes = Math.round(timeHours * 60);

  return Math.max(1, timeMinutes); // Minimum 1 minute
}

/**
 * Determine if a bus is delayed based on speed
 * @param {number} speedKmh - Current speed in km/h
 * @returns {boolean} True if bus is delayed
 */
function isDelayed(speedKmh) {
  return speedKmh === 0;
}

/**
 * Get status based on speed
 * @param {number} speedKmh - Current speed in km/h
 * @returns {string} Status: 'stopped', 'slow', 'normal'
 */
function getSpeedStatus(speedKmh) {
  if (speedKmh === 0) return 'stopped';
  if (speedKmh < 15) return 'slow';
  return 'normal';
}

module.exports = {
  calculateETA,
  isDelayed,
  getSpeedStatus
};
