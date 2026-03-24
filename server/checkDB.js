const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MindSync');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('Collections in MindSync DB:');
    collections.forEach(c => console.log('  - ' + c.name));
    
    // Check for entries in any collection
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} documents`);
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
