const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const User = require('./models/User');
const { indexEntry } = require('./utils/ragService');

const sampleEntries = [
  {
    title: "Gym Journey",
    content: "Had an amazing workout today at the gym. Started with a 5km warm-up run on the treadmill, then hit the weights hard - did 3 sets of deadlifts and bench press. My body felt strong and energized. Finished with 10 minutes of stretching. Feeling proud of my consistency this month!",
    mood: "happy",
    tags: ["gym", "fitness", "strength", "workout"]
  },
  {
    title: "Quality Time with Friends",
    content: "Met up with Priya and Arjun at our favorite coffee spot today. We talked for hours about life, dreams, and shared so many laughs. It felt good to connect with people who truly understand me. These simple moments of genuine friendship mean everything.",
    mood: "happy",
    tags: ["friends", "connection", "social"]
  },
  {
    title: "Meditation & Peace",
    content: "Took time for myself today. Did a 20-minute meditation session by the window, watched the sunset, and just breathed. The world felt quiet and calm. I realized how much I need these moments to reset and find inner peace. My mind feels clear now.",
    mood: "calm",
    tags: ["meditation", "peace", "mindfulness", "self-care"]
  },
  {
    title: "Learning Achievement",
    content: "Finally completed that online course on machine learning! I've been studying for weeks and it paid off. Learned so much about neural networks and data processing. Excited to apply these skills in my next project. Growth mindset is real!",
    mood: "excited",
    tags: ["learning", "goals", "achievement", "coding"]
  },
  {
    title: "Beach Escape",
    content: "Spent the whole day at the beach with a few close friends. We swam, played beach volleyball, and watched the sunset together. Even though I had some worries about work earlier, being near the ocean and with good people reminded me what really matters.",
    mood: "happy",
    tags: ["beach", "friends", "nature", "fun"]
  },
  {
    title: "Creative Expression",
    content: "Wrote poetry today for the first time in months. It was therapeutic to put my feelings into words. The verses flowed naturally - about love, loss, and hope. Realizing that creative outlets help me process emotions better than I thought.",
    mood: "calm",
    tags: ["creativity", "writing", "emotions", "self-expression"]
  },
  {
    title: "Family Moment",
    content: "Had dinner with my family today. Mom made her famous biryani and we all gathered around the table. My siblings made us all laugh with silly jokes. These everyday moments with family are precious. Feeling grateful and loved.",
    mood: "happy",
    tags: ["family", "food", "togetherness", "gratitude"]
  },
  {
    title: "Challenging Day",
    content: "Today was tough. Faced some anxiety at work during the presentation. My heart was racing and palms were sweating. But I pushed through and delivered. Afterward, I felt a sense of accomplishment. Conquering fears makes you stronger.",
    mood: "anxious",
    tags: ["work", "anxiety", "challenge", "achievement"]
  },
  {
    title: "Personal Reflection",
    content: "Spent the evening journaling about my goals for the next year. I want to travel more, read 30 books, get stronger, and build deeper relationships. Writing these down feels powerful. I'm ready to make real changes and invest in myself.",
    mood: "excited",
    tags: ["goals", "reflection", "planning", "growth"]
  },
  {
    title: "Nature Walk",
    content: "Went for a solo nature walk in the nearby forest. The fresh air, green trees, and sounds of birds were so refreshing. Felt alone but not lonely - more like a peaceful solitude. Realized that sometimes we just need to disconnect and reconnect with nature.",
    mood: "calm",
    tags: ["nature", "peace", "solitude", "reflection"]
  }
];

async function addEntries() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mindsync');
    console.log('✓ Connected to MongoDB\n');

    // Get the brindha user
    const user = await User.findOne({ username: 'brindha' });
    if (!user) {
      console.log('❌ User brindha not found');
      await mongoose.disconnect();
      return;
    }
    
    const userId = user._id;
    console.log(`Adding entries for user: brindha (${userId})\n`);

    let addedCount = 0;
    
    for (let i = 0; i < sampleEntries.length; i++) {
      const entryData = sampleEntries[i];
      
      try {
        // Create entry
        const entry = new Entry({
          userId,
          title: entryData.title,
          content: entryData.content,
          mood: entryData.mood,
          tags: entryData.tags
        });
        
        await entry.save();
        
        // Index in RAG system
        await indexEntry(userId, entry._id, entryData.content, {
          mood: entryData.mood,
          tags: entryData.tags
        });
        
        console.log(`✓ ${i + 1}. "${entryData.title}" - Added & Indexed`);
        addedCount++;
      } catch (error) {
        console.log(`❌ ${i + 1}. "${entryData.title}" - Error: ${error.message}`);
      }
    }
    
    console.log(`\n✓ Successfully added ${addedCount}/${sampleEntries.length} entries`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addEntries();
