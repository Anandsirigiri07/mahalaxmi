const { initDatabase } = require('./db');

async function run() {
  console.log('🔄 Initializing Mahalaxmi Novelties Database Schema and Core Seeds...');
  const success = await initDatabase();
  if (success) {
    console.log('✅ Database initialization completed successfully.');
    process.exit(0);
  } else {
    console.error('❌ Database initialization failed. Check your MySQL configuration in backend/.env.');
    process.exit(1);
  }
}

run();
