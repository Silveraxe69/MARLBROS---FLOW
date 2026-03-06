const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { pool } = require('./db');

// Helper function to read CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function seedDatabase() {
  console.log('🌱 Seeding database with CSV data...');

  try {
    const dataDir = path.join(__dirname, '../../../data');

    // 1. Seed Routes
    console.log('📍 Seeding routes...');
    const routes = await readCSV(path.join(dataDir, 'routes.csv'));
    for (const route of routes) {
      await pool.query(
        `INSERT INTO routes (route_id, route_name, start_stop, end_stop, distance_km)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (route_id) DO NOTHING`,
        [route.route_id, route.route_name, route.start_stop, route.end_stop, parseFloat(route.distance_km)]
      );
    }
    console.log(`✅ Inserted ${routes.length} routes`);

    // 2. Seed Bus Stops
    console.log('🚏 Seeding bus stops...');
    const stops = await readCSV(path.join(dataDir, 'bus_stops.csv'));
    for (const stop of stops) {
      await pool.query(
        `INSERT INTO bus_stops (stop_id, stop_name, city, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (stop_id) DO NOTHING`,
        [stop.stop_id, stop.stop_name, stop.city, parseFloat(stop.latitude), parseFloat(stop.longitude)]
      );
    }
    console.log(`✅ Inserted ${stops.length} bus stops`);

    // 3. Seed Buses
    console.log('🚌 Seeding buses...');
    const buses = await readCSV(path.join(dataDir, 'buses.csv'));
    for (const bus of buses) {
      await pool.query(
        `INSERT INTO buses (bus_id, route_id, bus_color, service_type, women_bus, accessible, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (bus_id) DO NOTHING`,
        [
          bus.bus_id,
          bus.route_id,
          bus.bus_color,
          bus.service_type,
          bus.women_bus === 'true' || bus.women_bus === '1',
          bus.accessible === 'true' || bus.accessible === '1',
          bus.status || 'running'
        ]
      );
    }
    console.log(`✅ Inserted ${buses.length} buses`);

    // 4. Seed Bus Stop Sequence
    console.log('🔢 Seeding bus stop sequences...');
    const sequences = await readCSV(path.join(dataDir, 'bus_stop_sequence.csv'));
    for (const seq of sequences) {
      await pool.query(
        `INSERT INTO bus_stop_sequence (route_id, stop_id, stop_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (route_id, stop_order) DO NOTHING`,
        [seq.route_id, seq.stop_id, parseInt(seq.stop_order)]
      );
    }
    console.log(`✅ Inserted ${sequences.length} bus stop sequences`);

    // 5. Seed Live Bus Locations
    console.log('📍 Seeding live bus locations...');
    const locations = await readCSV(path.join(dataDir, 'live_bus_location.csv'));
    for (const loc of locations) {
      await pool.query(
        `INSERT INTO bus_location (bus_id, latitude, longitude, speed, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [loc.bus_id, parseFloat(loc.latitude), parseFloat(loc.longitude), parseFloat(loc.speed || 0)]
      );
    }
    console.log(`✅ Inserted ${locations.length} bus locations`);

    // 6. Seed Bus ETA
    console.log('⏱️ Seeding bus ETA data...');
    const etas = await readCSV(path.join(dataDir, 'bus_eta.csv'));
    for (const eta of etas) {
      await pool.query(
        `INSERT INTO bus_eta (bus_id, stop_id, eta_minutes, distance_km)
         VALUES ($1, $2, $3, $4)`,
        [eta.bus_id, eta.stop_id, parseInt(eta.eta_minutes), parseFloat(eta.distance_km || 0)]
      );
    }
    console.log(`✅ Inserted ${etas.length} ETA records`);

    // 7. Seed Crowd Status
    console.log('👥 Seeding crowd status...');
    const crowdData = await readCSV(path.join(dataDir, 'crowd_status.csv'));
    for (const crowd of crowdData) {
      await pool.query(
        `INSERT INTO crowd_status (bus_id, stop_id, crowd_level, timestamp)
         VALUES ($1, $2, $3, NOW())`,
        [crowd.bus_id, crowd.stop_id, crowd.crowd_level]
      );
    }
    console.log(`✅ Inserted ${crowdData.length} crowd status records`);

    // 8. Seed Users (if CSV exists)
    console.log('👤 Seeding users...');
    const usersPath = path.join(dataDir, 'users.csv');
    if (fs.existsSync(usersPath)) {
      const users = await readCSV(usersPath);
      for (const user of users) {
        await pool.query(
          `INSERT INTO users (email, password_hash, name, phone, role)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING`,
          [user.email, user.password_hash, user.name, user.phone || null, user.role || 'passenger']
        );
      }
      console.log(`✅ Inserted ${users.length} users`);
    } else {
      console.log('⚠️ users.csv not found, skipping...');
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
