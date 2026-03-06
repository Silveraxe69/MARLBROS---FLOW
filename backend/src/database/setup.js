const { connectDB, disconnectDB } = require('./db');

async function setupDatabase() {
  console.log('🚀 Starting MongoDB database setup...\n');

  try {
    // Connect to MongoDB
    await connectDB();

    console.log('✅ MongoDB database setup complete!');
    console.log('📦 Collections will be created automatically when seeding data');
    console.log('\n📝 Next steps:');
    console.log('  1. Run: npm run db:seed');
    console.log('  2. Start server: npm run dev\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
