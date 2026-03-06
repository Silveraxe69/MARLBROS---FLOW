const { Bus, BusLocation, BusETA, BusStopSequence, BusStop } = require('../models');
const { emitBusLocationUpdate, emitBusETAUpdate } = require('./socketService');
const { calculateETA } = require('../utils/etaCalculator');
const { calculateDistance } = require('../utils/geoUtils');

let simulationInterval = null;
let busSimulationData = new Map();

// Initialize bus simulation data
async function initializeSimulation() {
  try {
    // Get all running buses
    const buses = await Bus.find({ status: 'running' }).lean();

    const busData = {};

    for (const bus of buses) {
      // Get latest location
      const location = await BusLocation.findOne({ bus_id: bus.bus_id })
        .sort({ timestamp: -1 })
        .lean();

      // Get route stops
      const sequences = await BusStopSequence.find({ route_id: bus.route_id })
        .sort({ stop_order: 1 })
        .lean();

      const stops = await Promise.all(
        sequences.map(async (seq) => {
          const stop = await BusStop.findOne({ stop_id: seq.stop_id }).lean();
          return {
            stop_id: seq.stop_id,
            stop_order: seq.stop_order,
            latitude: stop?.latitude || 0,
            longitude: stop?.longitude || 0,
          };
        })
      );

      busData[bus.bus_id] = {
        bus_id: bus.bus_id,
        route_id: bus.route_id,
        current_lat: location?.latitude || stops[0]?.latitude || 19.0760,
        current_lng: location?.longitude || stops[0]?.longitude || 72.8777,
        current_speed: location?.speed || 30,
        stops: stops.filter(s => s.latitude && s.longitude),
        current_stop_index: 0,
      };
    }

    busSimulationData = new Map(Object.entries(busData));
    console.log(`✅ Initialized simulation for ${busSimulationData.size} buses`);
  } catch (error) {
    console.error('❌ Error initializing simulation:', error);
  }
}

// Simulate bus movement
function simulateBusMovement(bus) {
  if (!bus.stops || bus.stops.length === 0) return;

  const currentStop = bus.stops[bus.current_stop_index % bus.stops.length];
  const targetLat = currentStop.latitude;
  const targetLng = currentStop.longitude;

  const distance = calculateDistance(
    bus.current_lat,
    bus.current_lng,
    targetLat,
    targetLng
  );

  // If close to stop (within 100m), move to next stop
  if (distance < 0.1) {
    bus.current_stop_index = (bus.current_stop_index + 1) % bus.stops.length;
    bus.current_speed = Math.random() * 20 + 20; // Random speed 20-40 km/h
    return;
  }

  // Calculate movement step (moving at current speed)
  const speedKmPerSec = bus.current_speed / 3600; // Convert km/h to km/s
  const stepDistance = speedKmPerSec * 5; // 5 second intervals

  // Calculate new position
  const ratio = Math.min(stepDistance / distance, 1);
  bus.current_lat += (targetLat - bus.current_lat) * ratio;
  bus.current_lng += (targetLng - bus.current_lng) * ratio;

  // Add some randomness to speed
  bus.current_speed = Math.max(10, Math.min(50, bus.current_speed + (Math.random() - 0.5) * 5));
}

// Update bus location in database
async function updateBusLocation(bus) {
  try {
    await BusLocation.create({
      bus_id: bus.bus_id,
      latitude: bus.current_lat,
      longitude: bus.current_lng,
      speed: bus.current_speed,
      timestamp: new Date(),
    });

    // Emit real-time update
    emitBusLocationUpdate(bus.bus_id, {
      latitude: bus.current_lat,
      longitude: bus.current_lng,
      speed: bus.current_speed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error updating location for bus ${bus.bus_id}:`, error.message);
  }
}

// Update ETA for all stops
async function updateBusETA(bus) {
  try {
    // Delete old ETA records
    await BusETA.deleteMany({ bus_id: bus.bus_id });

    const etaUpdates = [];

    // Calculate ETA for each remaining stop
    for (let i = 0; i < bus.stops.length; i++) {
      const stopIndex = (bus.current_stop_index + i) % bus.stops.length;
      const stop = bus.stops[stopIndex];

      const distance = calculateDistance(
        bus.current_lat,
        bus.current_lng,
        stop.latitude,
        stop.longitude
      );

      const eta = calculateETA(distance, bus.current_speed);

      await BusETA.create({
        bus_id: bus.bus_id,
        stop_id: stop.stop_id,
        eta_minutes: eta,
        distance_km: distance,
        status: 'On Time',
        updated_at: new Date(),
      });

      etaUpdates.push({
        stop_id: stop.stop_id,
        eta_minutes: eta,
        distance_km: distance,
      });
    }

    // Emit real-time ETA update
    emitBusETAUpdate(bus.bus_id, etaUpdates);
  } catch (error) {
    console.error(`Error updating ETA for bus ${bus.bus_id}:`, error.message);
  }
}

// Main simulation loop
async function runSimulationLoop() {
  for (const [busId, bus] of busSimulationData) {
    simulateBusMovement(bus);
    await updateBusLocation(bus);
  }

  // Update ETAs every 30 seconds
  if (Date.now() % 30000 < 5000) {
    for (const [busId, bus] of busSimulationData) {
      await updateBusETA(bus);
    }
  }
}

// Start bus simulation
async function startBusSimulation(io) {
  console.log('🚌 Starting bus simulation...');

  await initializeSimulation();

  if (busSimulationData.size === 0) {
    console.log('⚠️  No buses found for simulation');
    return;
  }

  // Run simulation every 5 seconds
  simulationInterval = setInterval(runSimulationLoop, 5000);

  console.log(`✅ Bus simulation started for ${busSimulationData.size} buses`);
}

// Stop bus simulation
function stopBusSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('🛑 Bus simulation stopped');
  }
}

module.exports = {
  startBusSimulation,
  stopBusSimulation,
};
