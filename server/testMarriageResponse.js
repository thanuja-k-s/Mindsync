const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const RAGIndex = require('./models/RAGIndex');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MindSync');
    
    // Find the ram marriage entry
    const userId = '696f16c00150793863f1ceeb';
    const entries = await Entry.find({
      userId,
      content: { $regex: 'ram.*marriage|marriage.*ram', $options: 'i' }
    });
    
    if (entries.length > 0) {
      console.log('=== FOUND ENTRY ===');
      console.log('Full content:', entries[0].content);
      console.log('\n=== CHECKING WHAT DETAILS SHOULD BE EXTRACTED ===');
      const text = entries[0].content.toLowerCase();
      console.log('Contains "kavya":', text.includes('kavya'));
      console.log('Contains "ram":', text.includes('ram'));
      console.log('Contains "non veg":', text.includes('non veg'));
      console.log('Contains "enjoyed":', text.includes('enjoyed'));
      
      // Now simulate what the response function will extract
      console.log('\n=== SIMULATED RESPONSE GENERATION ===');
      let personalDetails = [];
      if (text.includes('kavya')) personalDetails.push('your friend Kavya');
      if (text.includes('ram')) personalDetails.push('Ram');
      
      let foodDetails = '';
      if (text.includes('non veg')) foodDetails = 'a non-veg meal';
      else if (text.includes('meal')) foodDetails = 'a meal';
      else if (text.includes('food')) foodDetails = 'food';
      
      let sentiment = '';
      if (text.includes('enjoyed')) sentiment = ' and you really enjoyed it';
      else if (text.includes('good') || text.includes('great')) sentiment = ' and it was wonderful';
      
      console.log('Extracted people:', personalDetails);
      console.log('Food details:', foodDetails);
      console.log('Sentiment:', sentiment);
      
      if (personalDetails.length > 0 && foodDetails) {
        const response = `You went to the marriage with ${personalDetails.join(' and ')} and had ${foodDetails}${sentiment}. Those moments of celebration with close friends create real memories. The fact that you took time to enjoy the meal and company shows you appreciate these special occasions. How did that day feel overall? 💍`;
        console.log('\n=== FINAL RESPONSE ===');
        console.log(response);
      }
    } else {
      console.log('No entries found with ram and marriage');
      // Show all entries for this user
      const allEntries = await Entry.find({ userId }).select('content').limit(5);
      console.log('\nFirst 5 entries for user:');
      allEntries.forEach((e, i) => {
        console.log(`${i+1}. ${e.content.substring(0, 80)}...`);
      });
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
