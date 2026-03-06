const mongoose = require('mongoose');
const { Bus, BusStop, Route, SearchHistory } = require('./src/models');

async function verifyData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smart_bus_db');
    console.log('✓ Connected to MongoDB\n');
    
    console.log('=== BUSES (showing Tamil Nadu bus colors) ===');
    const buses = await Bus.find().limit(5).lean();
    buses.forEach(b => {
      const women = b.women_bus ? ' (Women Bus)' : '';
      console.log(`${b.bus_id}: ${b.bus_color} - ${b.service_type}${women} - ${b.status}`);
    });
    
    console.log('\n=== ROUTES (Tamil Nadu) ===');
    const routes = await Route.find().lean();
    routes.forEach(r => {
      console.log(`${r.route_id}: ${r.start_stop} → ${r.end_stop} (${r.distance_km}km)`);
    });
    
    console.log('\n=== BUS STOPS (Tamil Nadu Cities) ===');
    const stops = await BusStop.find().limit(8).lean();
    stops.forEach(s => {
      console.log(`${s.stop_id}: ${s.stop_name}, ${s.city}`);
    });
    
    console.log('\n=== PASSENGER SEARCH HISTORY ===');
    const searches = await SearchHistory.find().limit(5).lean();
    searches.forEach(s => {
      console.log(`${s.search_id}: ${s.from_stop} → ${s.to_stop} (${s.timestamp})`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Data verification complete!');
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

verifyData();
