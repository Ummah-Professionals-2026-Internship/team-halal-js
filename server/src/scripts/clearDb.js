const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function clearDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Error: MONGODB_URI is not set in environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    const collections = await mongoose.connection.db.collections();
    console.log(`Found ${collections.length} collection(s). Clearing data...`);

    for (let collection of collections) {
      const collectionName = collection.collectionName;
      await collection.deleteMany({});
      console.log(`- Cleared: ${collectionName}`);
    }

    console.log('\nSuccess! Database has been cleared completely.');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearDatabase();
