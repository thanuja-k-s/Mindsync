const mongoose = require('mongoose');
const Entry = require('./models/Entry');
const User = require('./models/User');
const { indexEntry } = require('./utils/ragService');

const moreEntries = [
  {
    title: "Temple Visit & Spirituality",
    content: "Visited the ancient temple today with deep reverence. The spiritual atmosphere made me feel connected to something greater than myself. I spent time in prayer, lighting incense, and meditating in the sanctum. The bells ringing, the chants echoing - it was truly purifying. Left feeling blessed and centered.",
    mood: "calm",
    tags: ["temple", "spiritual", "worship", "prayer"]
  },
  {
    title: "Cooking with Love",
    content: "Prepared my grandmother's traditional curry recipe today. The aroma of spices filled the kitchen - turmeric, cardamom, cloves blending perfectly. Cooking with intention brought back so many memories of her. Each step felt like a meditation. The final dish tasted like home.",
    mood: "happy",
    tags: ["cooking", "food", "family", "tradition"]
  },
  {
    title: "Morning Run Energy",
    content: "Woke up early for a morning run before sunrise. The cool breeze, empty streets, and golden light appearing on the horizon - pure magic. Did 7km at a good pace, feeling my legs getting stronger. My lungs expanded with fresh energy. This is how I want to start every day.",
    mood: "excited",
    tags: ["running", "fitness", "morning", "energy"]
  },
  {
    title: "Rainy Day Reflection",
    content: "The rain outside has been continuous all day. I sat with a warm cup of tea, watching droplets race down the window. There's something about rainy days that makes introspection easy. Thought about my relationships, my choices, where I'm heading. The rain felt like nature's way of cleansing my mind.",
    mood: "calm",
    tags: ["reflection", "rain", "solitude", "peace"]
  },
  {
    title: "Book Club Evening",
    content: "Our book club met at Priya's place tonight. We discussed the novel passionately - debating characters' motivations, throwing ideas around. The conversation flowed from books to life philosophies. Great wine, good company, amazing discussions. These intellectual connections remind me why I love my circle.",
    mood: "happy",
    tags: ["books", "friends", "discussion", "learning"]
  },
  {
    title: "Work Project Success",
    content: "Completed the big project at work today! Months of hard work, late nights, and problem-solving finally paid off. The client loved the presentation. My boss appreciated the initiative I took. Feeling accomplished and proud of what my team achieved together. This success feels earned.",
    mood: "excited",
    tags: ["work", "achievement", "success", "professional"]
  },
  {
    title: "Heartfelt Conversation",
    content: "Had a deep conversation with my mother today about fears and dreams. She shared stories from her youth, her struggles, her hopes for me. I opened up too about my insecurities and aspirations. The honesty between us was beautiful. These vulnerable moments strengthen our bond.",
    mood: "happy",
    tags: ["family", "mother", "connection", "love"]
  },
  {
    title: "Yoga & Flexibility",
    content: "Attended a 90-minute vinyasa flow class. The instructor guided us through challenging poses with such grace. My body, mind, and breath synchronized beautifully. When we reached savasana, I felt completely at peace - body relaxed, mind quiet. Yoga is my sanctuary.",
    mood: "calm",
    tags: ["yoga", "fitness", "mindfulness", "flexibility"]
  },
  {
    title: "Travel Dreams",
    content: "Spent hours researching travel destinations today. Dreaming of visiting Bali, Tokyo, and the Swiss Alps. Checked flight prices, read travel blogs, looked at tourist photos. The wanderlust is strong. I want to explore the world, experience different cultures, push my boundaries. Adventure is calling.",
    mood: "excited",
    tags: ["travel", "dreams", "adventure", "exploration"]
  },
  {
    title: "Quiet Morning Routine",
    content: "Woke up early before everyone else. Made myself a perfect cup of coffee, sat on the balcony watching the city wake up. Journaled about gratitude - simple things like fresh coffee, warm sunlight, the ability to breathe. These quiet mornings are my reset button. Just me, my thoughts, and the beginning of a new day.",
    mood: "happy",
    tags: ["morning", "gratitude", "routine", "peace"]
  }
];

async function addMoreEntries() {
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
    console.log(`Adding more entries for user: brindha (${userId})\n`);

    let addedCount = 0;
    
    for (let i = 0; i < moreEntries.length; i++) {
      const entryData = moreEntries[i];
      
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
    
    console.log(`\n✓ Successfully added ${addedCount}/${moreEntries.length} new entries`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMoreEntries();
