// This is a simple script to seed the database
// Run with: node src/db/scripts/runSeed.js

(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/seed');
    const result = await response.json();
    console.log('Seed result:', result);
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
  process.exit(0);
})(); 