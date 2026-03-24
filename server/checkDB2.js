const mongoose = require('mongoose');

(async () => {
  try {
    console.log('Connecting to mindsync...');
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('Collections in mindsync DB:');
    if (collections.length === 0) {
      console.log('  (empty)');
    } else {
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  ${col.name}: ${count} documents`);
      }
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
