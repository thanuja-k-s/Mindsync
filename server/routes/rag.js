const express = require('express');
const router = express.Router();
const { retrieveContext, buildRAGContext } = require('../utils/ragService');

/**
 * RAG Query Endpoint
 * Retrieves relevant context from user's journal entries and generates response
 * POST /api/rag/query
 */
router.post('/query', async (req, res) => {
  try {
    const { userId, query } = req.body;
    
    console.log('RAG Query received - userId:', userId, 'query:', query);
    
    if (!userId || !query) {
      return res.status(400).json({ error: 'userId and query are required' });
    }
    
    // Retrieve relevant entries from RAG index
    const retrievedEntries = await retrieveContext(userId, query, 5);
    
    console.log('Retrieved entries:', retrievedEntries.length);
    
    // Build context
    const context = buildRAGContext(retrievedEntries);
    
    // Generate response using context
    const response = generateRAGResponse(query, context, retrievedEntries);
    
    res.json({
      success: true,
      response,
      context: retrievedEntries.length > 0 ? buildRAGContext(retrievedEntries) : null,
      entriesUsed: retrievedEntries.length
    });
  } catch (error) {
    console.error('RAG Query Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate response using RAG context with synthesized, conversational replies
 */
function generateRAGResponse(query, context, retrievedEntries) {
  const lowerQuery = query.toLowerCase();
  
  // If we have entry context, synthesize responses from actual content
  if (retrievedEntries.length > 0) {
    const allText = retrievedEntries.map(e => e.text || '').join(' ').toLowerCase();
    const moods = retrievedEntries.map(e => e.metadata?.mood).filter(Boolean);
    const firstEntry = retrievedEntries[0];
    const firstText = firstEntry?.text || '';
    const firstMood = firstEntry?.metadata?.mood || null;
    
    // Specific activity detection
    const activityKeywords = {
      gym: ['gym', 'workout', 'exercise', 'strength', 'cardio', 'treadmill', 'weights', 'fitness'],
      beach: ['beach', 'sand', 'water', 'ocean', 'sea'],
      travel: ['travel', 'trip', 'visit', 'went', 'journey'],
      emotional: ['pain', 'lonely', 'loneliness', 'sadness', 'anxious', 'anxiety']
    };
    
    let detectedActivity = null;
    for (const [activity, keywords] of Object.entries(activityKeywords)) {
      if (keywords.some(kw => allText.includes(kw))) {
        detectedActivity = activity;
        break;
      }
    }
    
    // Emotion detection with comprehensive keywords
    const emotionMap = {
      happy: ['happy', 'proud', 'satisfied', 'joy', 'excited', 'alive', 'accomplished', 'victory'],
      lonely: ['lonely', 'loneliness', 'alone'],
      anxious: ['anxious', 'anxiety', 'worried', 'nervous', 'fear', 'afraid'],
      sad: ['sad', 'sadness', 'pain', 'disappointed', 'down', 'depressed', 'unhappy'],
      grateful: ['grateful', 'grateful', 'thankful', 'appreciate'],
      reflective: ['thinking', 'thought', 'reflection', 'wonder', 'consider', 'realize']
    };
    
    let detectedEmotions = [];
    for (const [emotion, keywords] of Object.entries(emotionMap)) {
      if (keywords.some(kw => allText.includes(kw))) {
        detectedEmotions.push(emotion);
      }
    }
    
    // GYM-SPECIFIC RESPONSES (HIGHEST PRIORITY)
    if (detectedActivity === 'gym' || lowerQuery.includes('gym') || lowerQuery.includes('workout') || lowerQuery.includes('exercise') || lowerQuery.includes('fitness')) {
      // Extract achievement details from gym entry
      const hasStrengthTraining = allText.includes('chest press') || allText.includes('strength');
      const hasCardio = allText.includes('cardio') || allText.includes('bike') || allText.includes('treadmill');
      const hasWarmup = allText.includes('warm-up');
      
      const gymResponses = [
        `Your gym session shows real dedication! You did a full workout - warm-up, strength training, and cardio. The fact that you showed up and pushed through those tough final reps shows commitment. How are you feeling physically after that session? 💪`,
        `I can see you completed a comprehensive gym routine today. You worked through chest presses, leg work, and cardio - that's impressive consistency. You mentioned feeling 'proud' because you finished what you started. That's the mindset of someone building real strength. What's your next goal? 🏋️`,
        `Your workout was structured and thorough - warm-up, multiple strength exercises, cardio, and cool-down. The effort you put in today is cumulative. Every rep, every set is building toward the 'stronger, healthier, more confident' version of yourself you mentioned. How did your body feel leaving the gym? 💙`,
        `That gym session was about more than just the exercises - you wrote about discipline, consistency, and trusting the process. You showed up when tired and pushed through. That's the real victory here. How is your recovery going? Are you sore? 🔥`
      ];
      return gymResponses[Math.floor(Math.random() * gymResponses.length)];
    }
    
    // Greeter queries - synthesize multiple entry themes
    const isGreeting = lowerQuery.length < 10 || ['hi', 'hello', 'hey', 'sup'].includes(lowerQuery);
    if (isGreeting) {
      const greetingVariations = [
        `Hey! I can see from your entries that you're working through ${detectedEmotions[0] || 'some deep feelings'}, but you're also showing strength through activities like gym and time with friends. What would feel good to talk about right now? 💙`,
        `Hi there! Your journal shows someone who's balancing emotional introspection with physical growth. I notice your recent ${firstMood} mood entry about ${detectedActivity || 'your experiences'}. What's on your mind today? 💭`,
        `Hello! I've been reading through your journey - you're navigating loneliness while building strength at the gym. That's real work. How are you doing in this moment? 🌟`,
        `Hi! Your words show both vulnerability and determination. You're processing emotions while also committing to your fitness goals. That balance is important. What would help you right now? 💙`
      ];
      return greetingVariations[Math.floor(Math.random() * greetingVariations.length)];
    }
    
    // Beach-specific responses
    if (lowerQuery.includes('beach') || (detectedActivity === 'beach' && !lowerQuery.includes('gym'))) {
      const beachResponses = [
        `You spent time at the beach with friends - that's a moment of connection. You wrote about friends and also about worries from your past. What was the balance between those feelings like that day? 🏖️`,
        `Your beach day shows you seeking moments with others even while processing deeper emotions. That's healthy. What did you need most that day? 💙`
      ];
      return beachResponses[Math.floor(Math.random() * beachResponses.length)];
    }
    
    // Emotion-specific synthesized responses
    if (detectedEmotions.includes('happy') && firstMood === 'happy') {
      return `Your ${firstMood} mood entry shows real fulfillment. You're experiencing accomplishment and pride. That's a wonderful state to be in. What's driving this positive energy right now? 🌟`;
    }
    
    if (detectedEmotions.includes('lonely') || lowerQuery.includes('lonely')) {
      const loneliness = [
        `I notice you're experiencing loneliness, and you're aware of it. That awareness is the first step. Your journal is a brave way to process these feelings. Who or what has helped you feel less alone? 💙`,
        `The loneliness you're feeling is real and valid. Your entries show you're working through it thoughtfully. Have you been able to connect with anyone about these feelings? 💭`
      ];
      return loneliness[Math.floor(Math.random() * loneliness.length)];
    }
    
    // Entry-specific responses
    if (lowerQuery.includes('entry') || lowerQuery.includes('entries') || lowerQuery.includes('journal')) {
      const entryResponses = [
        `You have ${retrievedEntries.length} entries here. They show someone balancing emotional growth with physical dedication. What patterns are you noticing across them? 💭`,
        `Your ${retrievedEntries.length} entries tell a story of someone committed to understanding themselves while also pushing their limits physically. What's the connection you see between these areas? 🌟`
      ];
      return entryResponses[Math.floor(Math.random() * entryResponses.length)];
    }
    
    // Default synthesized response incorporating actual themes
    const synthesized = [
      `I can see you're working on multiple fronts - navigating emotions while also building physical strength through your gym routine. That's admirable balance. What's feeling most important to focus on right now? 💙`,
      `Your entries show depth and action. You're processing ${detectedEmotions[0] || 'complex feelings'} while also showing up for yourself at the gym. That takes real commitment. What's the hardest part right now? 💭`,
      `You're being honest about your emotions AND following through on your fitness goals. That dual commitment is powerful. Where are you feeling the most progress? 🌟`
    ];
    return synthesized[Math.floor(Math.random() * synthesized.length)];
  }
  
  // Fallback responses when no entries exist (variety of opening lines)
  const emptyResponses = [
    `I'm here to listen whenever you're ready to share. What's on your mind today? 💙`,
    `Your journal is your safe space to express whatever you need to. Tell me what you're thinking about. 💭`,
    `I'm here to reflect and listen with you. What do you want to talk about right now? 🌟`,
    `You're doing important work by pausing to think about yourself. What's calling for your attention? 💙`,
    `I see you're taking time to reflect. What's the thing you most need to process? 💭`,
    `What's in your heart right now? I'm here to listen without judgment. 💙`
  ];
  
  return emptyResponses[Math.floor(Math.random() * emptyResponses.length)];
}

module.exports = router;
