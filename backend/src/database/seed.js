const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('./db');
const {
  Route,
  BusStop,
  Bus,
  BusStopSequence,
  BusLocation,
  BusETA,
  CrowdStatus,
  User,
  SearchHistory,
} = require('../models');

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
  console.log('🌱 Seeding MongoDB database with CSV data...\n');

  try {
    // Connect to MongoDB
    await connectDB();

    const dataDir = path.join(__dirname, '../../../data');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      Route.deleteMany({}),
      BusStop.deleteMany({}),
      Bus.deleteMany({}),
      BusStopSequence.deleteMany({}),
      BusLocation.deleteMany({}),
      BusETA.deleteMany({}),
      CrowdStatus.deleteMany({}),
      User.deleteMany({}),
      SearchHistory.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared\n');

    // 1. Seed Routes
    console.log('📍 Seeding routes...');
    const routesData = await readCSV(path.join(dataDir, 'routes.csv'));
    const routes = routesData.map(route => ({
      route_id: route.route_id,
      route_name: route.route_name || `${route.start_stop} - ${route.end_stop}`,
      start_stop: route.start_stop,
      end_stop: route.end_stop,
      distance_km: parseFloat(route.distance_km),
    }));
    await Route.insertMany(routes);
    console.log(`✅ Inserted ${routes.length} routes\n`);

    // 2. Seed Bus Stops
    console.log('🚏 Seeding bus stops...');
    const stopsData = await readCSV(path.join(dataDir, 'bus_stops.csv'));
    const stops = stopsData.map(stop => ({
      stop_id: stop.stop_id,
      stop_name: stop.stop_name,
      city: stop.city,
      latitude: parseFloat(stop.latitude),
      longitude: parseFloat(stop.longitude),
    }));
    await BusStop.insertMany(stops);
    console.log(`✅ Inserted ${stops.length} bus stops\n`);

    // 3. Seed Buses
    console.log('🚌 Seeding buses...');
    const busesData = await readCSV(path.join(dataDir, 'buses.csv'));
    const buses = busesData.map(bus => ({
      bus_id: bus.bus_id,
      route_id: bus.route_id,
      bus_color: bus.bus_color,
      service_type: bus.service_type,
      women_bus: bus.women_bus === 'Yes' || bus.women_bus === 'true' || bus.women_bus === '1',
      accessible: bus.accessible === 'Yes' || bus.accessible === 'true' || bus.accessible === '1',
      status: bus.status || 'Running',
    }));
    await Bus.insertMany(buses);
    console.log(`✅ Inserted ${buses.length} buses\n`);

    // 4. Seed Bus Stop Sequence
    console.log('🔢 Seeding bus stop sequences...');
    const sequencesData = await readCSV(path.join(dataDir, 'bus_stop_sequence.csv'));
    const sequences = sequencesData.map(seq => ({
      route_id: seq.route_id,
      stop_id: seq.stop_id,
      stop_order: parseInt(seq.stop_order),
    }));
    await BusStopSequence.insertMany(sequences);
    console.log(`✅ Inserted ${sequences.length} bus stop sequences\n`);

    // 5. Seed Live Bus Locations
    console.log('📍 Seeding live bus locations...');
    const locationsData = await readCSV(path.join(dataDir, 'live_bus_location.csv'));
    const locations = locationsData.map(loc => ({
      bus_id: loc.bus_id,
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      speed: parseFloat(loc.speed || 0),
      timestamp: loc.timestamp ? new Date() : new Date(),
    }));
    await BusLocation.insertMany(locations);
    console.log(`✅ Inserted ${locations.length} bus locations\n`);

    // 6. Seed Bus ETA
    console.log('⏱️ Seeding bus ETA data...');
    const etasData = await readCSV(path.join(dataDir, 'bus_eta.csv'));
    const etas = etasData.map(eta => ({
      bus_id: eta.bus_id,
      stop_id: eta.stop_id,
      eta_minutes: parseInt(eta.eta_minutes),
      distance_km: eta.distance_km ? parseFloat(eta.distance_km) : undefined,
      status: eta.status || 'On Time',
      updated_at: new Date(),
    }));
    await BusETA.insertMany(etas);
    console.log(`✅ Inserted ${etas.length} ETA records\n`);

    // 7. Seed Crowd Status
    console.log('👥 Seeding crowd status data...');
    const crowdData = await readCSV(path.join(dataDir, 'crowd_status.csv'));
    const crowdStatuses = crowdData.map(crowd => ({
      bus_id: crowd.bus_id,
      stop_id: crowd.stop_id || null,
      crowd_level: crowd.crowd_level,
      user_id: crowd.user_id || null,
      timestamp: crowd.timestamp ? new Date() : new Date(),
    }));
    await CrowdStatus.insertMany(crowdStatuses);
    console.log(`✅ Inserted ${crowdStatuses.length} crowd status records\n`);

    // 8. Seed Users
    console.log('👤 Seeding users...');
    const usersData = await readCSV(path.join(dataDir, 'users.csv'));
    const bcrypt = require('bcryptjs');
    const users = await Promise.all(
      usersData.map(async (user) => {
        // Generate proper password hashes based on role
        let password_hash;
        if (user.email === 'admin@smartbus.com') {
          password_hash = await bcrypt.hash('admin123', 10);
        } else if (user.email === 'passenger@test.com') {
          password_hash = await bcrypt.hash('password123', 10);
        } else {
          // For other users, use a default password
          password_hash = await bcrypt.hash('password123', 10);
        }
        
        return {
          user_id: user.user_id || undefined,
          email: user.email,
          password_hash,
          name: user.name,
          phone: user.phone_number || user.phone,
          role: user.role || 'passenger',
        };
      })
    );
    await User.insertMany(users);
    console.log(`✅ Inserted ${users.length} users\n`);

    // 9. Seed Passenger Search History
    console.log('🔍 Seeding passenger search history...');
    const searchHistoryFile = path.join(dataDir, 'passenger_search_history.csv');
    if (fs.existsSync(searchHistoryFile)) {
      const searchData = await readCSV(searchHistoryFile);
      const searches = searchData.map(search => ({
        search_id: search.search_id,
        user_id: search.user_id,
        from_stop: search.from_stop,
        to_stop: search.to_stop,
        timestamp: search.timestamp,
      }));
      await SearchHistory.insertMany(searches);
      console.log(`✅ Inserted ${searches.length} search history records\n`);
    } else {
      console.log('⚠️ Passenger search history file not found, skipping...\n');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Admin:     admin@smartbus.com / admin123');
    console.log('  Passenger: passenger@test.com / password123\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await disconnectDB();
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
