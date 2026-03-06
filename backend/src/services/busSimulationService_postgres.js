const db = require('../database/db');
const { emitBusLocationUpdate, emitBusETAUpdate } = require('./socketService');
const { calculateETA } = require('../utils/etaCalculator');
const { calculateDistance } = require('../utils/geoUtils');

let simulationInterval = null;
let busSimulationData = new Map();

// Initialize bus simulation data
async function initializeSimulation() {
  try {
    const result = await db.query(`
      SELECT 
        b.bus_id,
        b.route_id,
        l.latitude,
        l.longitude,
        l.speed,
        seq.stop_id,
        seq.stop_order,
        s.latitude as stop_lat,
        s.longitude as stop_lng
      FROM buses b
      LEFT JOIN LATERAL (
        SELECT latitude, longitude, speed
        FROM bus_location
        WHERE bus_id = b.bus_id
        ORDER BY timestamp DESC
        LIMIT 1
      ) l ON true
      LEFT JOIN bus_stop_sequence seq ON b.route_id = seq.route_id
      LEFT JOIN bus_stops s ON seq.stop_id = s.stop_id
      WHERE b.status = 'running'
    `);

    // Group by bus_id
    const busData = {};
    result.rows.forEach(row => {
      if (!busData[row.bus_id]) {
        busData[row.bus_id] = {
          bus_id: row.bus_id,
          route_id: row.route_id,
          current_lat: parseFloat(row.latitude) || 0,
          current_lng: parseFloat(row.longitude) || 0,
          current_speed: parseFloat(row.speed) || 30,
          stops: [],
          current_stop_index: 0
        };
      }

      if (row.stop_id) {
        busData[row.bus_id].stops.push({
          stop_id: row.stop_id,
          stop_order: row.stop_order,
          latitude: parseFloat(row.stop_lat),
          longitude: parseFloat(row.stop_lng)
        });
      }
    });

    // Sort stops by order
    Object.values(busData).forEach(bus => {
      bus.stops.sort((a, b) => a.stop_order - b.stop_order);
    });

    busSimulationData = new Map(Object.entries(busData));
    console.log(`Initialized simulation for ${busSimulationData.size} buses`);
  } catch (error) {
    console.error('Error initializing simulation:', error);
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
    await db.query(
      `INSERT INTO bus_location (bus_id, latitude, longitude, speed, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [bus.bus_id, bus.current_lat, bus.current_lng, bus.current_speed]
    );

    // Emit real-time update
    emitBusLocationUpdate(bus.bus_id, {
      latitude: bus.current_lat,
      longitude: bus.current_lng,
      speed: bus.current_speed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating location for bus ${bus.bus_id}:`, error);
  }
}

// Update ETA for all stops
async function updateBusETA(bus) {
  try {
    // Delete old ETA records
    await db.query('DELETE FROM bus_eta WHERE bus_id = $1', [bus.bus_id]);

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

      await db.query(
        `INSERT INTO bus_eta (bus_id, stop_id, eta_minutes, distance_km)
         VALUES ($1, $2, $3, $4)`,
        [bus.bus_id, stop.stop_id, eta, distance]
      );

      etaUpdates.push({
        stop_id: stop.stop_id,
        eta_minutes: eta,
        distance_km: distance
      });
    }

    // Emit real-time ETA update
    emitBusETAUpdate(bus.bus_id, etaUpdates);
  } catch (error) {
    console.error(`Error updating ETA for bus ${bus.bus_id}:`, error);
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
    console.log('⚠️ No buses found for simulation');
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
  stopBusSimulation
};
