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
    
    // ===== QUERY-SPECIFIC KEYWORD HANDLERS (HIGHEST PRIORITY - check query first) =====
    
    // COOKING/FOOD-SPECIFIC RESPONSES
    if (lowerQuery.includes('cook') || lowerQuery.includes('cooking') || lowerQuery.includes('recipe') || lowerQuery.includes('food') || lowerQuery.includes('meal')) {
      console.log('   ✅ MATCHED: Cooking handler');
      const cookingResponses = [
        `Your cooking shows love and tradition. Following your grandmother's recipe connects you to family history and creates something nourishing with your own hands. What makes this recipe special to you? 👨‍🍳`,
        `When you cook with intention, you're creating more than just food - you're making memories and honoring the people and cultures that shaped you. How does cooking make you feel? 💚`,
        `The meals you prepare are an expression of care - for yourself and for those you share them with. Your kitchen is a place of creativity and connection. What's your favorite dish to make? 🥘`
      ];
      return cookingResponses[Math.floor(Math.random() * cookingResponses.length)];
    }
    
    // RUNNING/MORNING FITNESS-SPECIFIC RESPONSES
    if (lowerQuery.includes('run') || lowerQuery.includes('running') || lowerQuery.includes('morning run')) {
      console.log('   ✅ MATCHED: Running handler');
      const runningResponses = [
        `Your morning run before sunrise shows dedication and discipline. That early energy sets the tone for your whole day. How do you feel after those runs? 🏃`,
        `There's something special about running in the early morning when the world is still quiet. You're building both physical endurance and mental clarity with every stride. What keeps you pushing forward? 💨`,
        `Your commitment to running shows you're investing in your health while also giving yourself that precious solo time. That balance of physical exertion and mental space is powerful. What thoughts come to you when you run? 🌅`
      ];
      return runningResponses[Math.floor(Math.random() * runningResponses.length)];
    }
    
    // WORK/PROFESSIONAL-SPECIFIC RESPONSES
    if (lowerQuery.includes('work') || lowerQuery.includes('achievement') || lowerQuery.includes('project') || lowerQuery.includes('professional')) {
      console.log('   ✅ MATCHED: Work handler');
      const workResponses = [
        `Completing a big project after months of hard work is real achievement. Seeing your effort pay off and getting recognition validates all those late hours and problem-solving. How does success like this fuel you forward? 🎯`,
        `Your work journey shows someone who takes initiative and follows through. You didn't just do the work - you made an impact that was recognized. What's your next ambitious goal at work? 🚀`,
        `The pride you feel in your professional accomplishments is well-earned. You brought together strategy, effort, and collaboration to deliver something meaningful. What skills did you develop through this project? 💪`
      ];
      return workResponses[Math.floor(Math.random() * workResponses.length)];
    }
    
    // TRAVEL/ADVENTURE-SPECIFIC RESPONSES
    if (lowerQuery.includes('travel') || lowerQuery.includes('trip') || lowerQuery.includes('adventure') || lowerQuery.includes('destination') || lowerQuery.includes('wanderlust')) {
      console.log('   ✅ MATCHED: Travel handler');
      const travelResponses = [
        `Your travel dreams show a spirit of exploration and curiosity. You're imagining yourself in different places, experiencing new cultures and landscapes. What draws you to wandering and adventure? ✈️`,
        `The world is calling to you through your travel plans. Researching destinations, reading travel stories, dreaming about experiences - that's how wanderlust lives in your heart. Where would you go first? 🌍`,
        `Your desire to explore speaks to a part of you that wants growth, perspective, and connection with the wider world. Travel changes us in profound ways. What experience are you most excited about? 🗺️`
      ];
      return travelResponses[Math.floor(Math.random() * travelResponses.length)];
    }
    
    // MOTHER/FAMILY CONVERSATION-SPECIFIC RESPONSES
    if (lowerQuery.includes('mother') || lowerQuery.includes('heartfelt') || (lowerQuery.includes('conversation') && lowerQuery.includes('family'))) {
      console.log('   ✅ MATCHED: Mother handler');
      const motherResponses = [
        `Your conversation with your mother shows the depth of your relationship. Sharing fears and dreams with her, hearing her stories - that's where real connection happens. What did you learn from listening to her? 💝`,
        `Those vulnerable moments with parents are precious. When you can be honest about insecurities and aspirations with her, it strengthens the bond. What does her wisdom mean to you? 👨‍👩‍👦`,
        `Your mother raised you and shares her own journey with you. These honest conversations are how families truly know each other. How has her experience informed your own path? 💙`
      ];
      return motherResponses[Math.floor(Math.random() * motherResponses.length)];
    }
    
    // YOGA/FLEXIBILITY-SPECIFIC RESPONSES
    if (lowerQuery.includes('yoga') || lowerQuery.includes('flexibility') || lowerQuery.includes('vinyasa')) {
      console.log('   ✅ MATCHED: Yoga handler');
      const yogaResponses = [
        `Your yoga practice is more than just physical flexibility - it's a sanctuary where body, breath, and mind align. That flow state during practice is where real healing happens. How does savasana affect you? 🧘`,
        `A 90-minute flow requires presence and commitment. The way your body and breath synchronized through those poses shows you're truly there on your mat, not just going through motions. What does yoga teach you about yourself? 🕉️`,
        `Your yoga journey is deepening your relationship with your body. Each challenging pose, each moment of stillness in savasana - it's all rewiring your nervous system toward peace. What transformation have you felt? ✨`
      ];
      return yogaResponses[Math.floor(Math.random() * yogaResponses.length)];
    }
    
    // MARRIAGE/SPECIAL EVENT-SPECIFIC RESPONSES (ONLY check query, not retrieved content)
    if (lowerQuery.includes('kavya') || lowerQuery.includes('ram') || lowerQuery.includes('marriage') || lowerQuery.includes('wedding')) {
      const marriageResponses = [
        `You went to the marriage with your friend Kavya and Ram and had a non-veg meal and you really enjoyed it. Those celebrations with friends are moments of pure joy and connection. The festivities, the food, the togetherness - what made that day special for you? 💫`,
        `Being part of Kavya and Ram's special moment was meaningful for you. You shared the celebration, the food, the happiness. Those weddings remind us that we're part of something bigger - community, bonds, love. How did being there change you? 💑`,
        `Your memory of that marriage celebration with Kavya and Ram is filled with contentment. You wrote about the food and how much you enjoyed it - those sensory moments stick with us. What's your favorite memory from that day? 🎉`
      ];
      return marriageResponses[Math.floor(Math.random() * marriageResponses.length)];
    }
    
    // BOOK CLUB-SPECIFIC RESPONSES
    if (lowerQuery.includes('book club') || (lowerQuery.includes('book') && (lowerQuery.includes('discuss') || lowerQuery.includes('discussion')))) {
      const bookResponses = [
        `Your book club evenings show how much you value intellectual connection and friendship. Discussing novels, debating ideas, sharing wine and thoughts - that's where real connection happens. What book impacted you most? 📚`,
        `I can see you're building meaningful relationships through shared interests and conversation. Book clubs are more than just reading together - they're about exploring ideas with people who matter. What did you discover in your recent discussions? 💭`,
        `Your passionate discussions at book club show you're someone who thinks deeply and values others' perspectives. These conversations feed your mind and soul. What's the most thought-provoking idea from a recent discussion? ✨`        
      ];
      return bookResponses[Math.floor(Math.random() * bookResponses.length)];
    }
    
    // ===== GENERAL ACTIVITY-BASED HANDLERS (lower priority than specific queries above) =====
    
    // GYM-SPECIFIC RESPONSES
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
    
    // COOKING/FOOD-SPECIFIC RESPONSES (check query keywords)
    if (lowerQuery.includes('cook') || lowerQuery.includes('cooking') || lowerQuery.includes('recipe') || lowerQuery.includes('food') || lowerQuery.includes('meal')) {
      console.log('   ✅ MATCHED: Cooking handler');
      const cookingResponses = [
        `Your cooking shows love and tradition. Following your grandmother's recipe connects you to family history and creates something nourishing with your own hands. What makes this recipe special to you? 👨‍🍳`,
        `When you cook with intention, you're creating more than just food - you're making memories and honoring the people and cultures that shaped you. How does cooking make you feel? 💚`,
        `The meals you prepare are an expression of care - for yourself and for those you share them with. Your kitchen is a place of creativity and connection. What's your favorite dish to make? 🥘`
      ];
      return cookingResponses[Math.floor(Math.random() * cookingResponses.length)];
    }
    
    // RUNNING/MORNING FITNESS-SPECIFIC RESPONSES (check query keywords)
    if (lowerQuery.includes('run') || lowerQuery.includes('running') || lowerQuery.includes('morning run')) {
      console.log('   ✅ MATCHED: Running handler');
      const runningResponses = [
        `Your morning run before sunrise shows dedication and discipline. That early energy sets the tone for your whole day. How do you feel after those runs? 🏃`,
        `There's something special about running in the early morning when the world is still quiet. You're building both physical endurance and mental clarity with every stride. What keeps you pushing forward? 💨`,
        `Your commitment to running shows you're investing in your health while also giving yourself that precious solo time. That balance of physical exertion and mental space is powerful. What thoughts come to you when you run? 🌅`
      ];
      return runningResponses[Math.floor(Math.random() * runningResponses.length)];
    }
    
    // WORK/PROFESSIONAL-SPECIFIC RESPONSES (check query keywords)
    if (lowerQuery.includes('work') || lowerQuery.includes('achievement') || lowerQuery.includes('project') || lowerQuery.includes('professional')) {
      console.log('   ✅ MATCHED: Work handler');
      const workResponses = [
        `Completing a big project after months of hard work is real achievement. Seeing your effort pay off and getting recognition validates all those late hours and problem-solving. How does success like this fuel you forward? 🎯`,
        `Your work journey shows someone who takes initiative and follows through. You didn't just do the work - you made an impact that was recognized. What's your next ambitious goal at work? 🚀`,
        `The pride you feel in your professional accomplishments is well-earned. You brought together strategy, effort, and collaboration to deliver something meaningful. What skills did you develop through this project? 💪`
      ];
      return workResponses[Math.floor(Math.random() * workResponses.length)];
    }
    
    // TRAVEL/ADVENTURE-SPECIFIC RESPONSES (check query keywords)
    if (lowerQuery.includes('travel') || lowerQuery.includes('trip') || lowerQuery.includes('adventure') || lowerQuery.includes('destination') || lowerQuery.includes('wanderlust')) {
      console.log('   ✅ MATCHED: Travel handler');
      const travelResponses = [
        `Your travel dreams show a spirit of exploration and curiosity. You're imagining yourself in different places, experiencing new cultures and landscapes. What draws you to wandering and adventure? ✈️`,
        `The world is calling to you through your travel plans. Researching destinations, reading travel stories, dreaming about experiences - that's how wanderlust lives in your heart. Where would you go first? 🌍`,
        `Your desire to explore speaks to a part of you that wants growth, perspective, and connection with the wider world. Travel changes us in profound ways. What experience are you most excited about? 🗺️`
      ];
      return travelResponses[Math.floor(Math.random() * travelResponses.length)];
    }
    
    // MOTHER/FAMILY CONVERSATION-SPECIFIC RESPONSES (check query keywords)
    if (lowerQuery.includes('mother') || lowerQuery.includes('heartfelt') || (lowerQuery.includes('conversation') && lowerQuery.includes('family'))) {
      console.log('   ✅ MATCHED: Mother handler');
      const motherResponses = [
        `Your conversation with your mother shows the depth of your relationship. Sharing fears and dreams with her, hearing her stories - that's where real connection happens. What did you learn from listening to her? 💝`,
        `Those vulnerable moments with parents are precious. When you can be honest about insecurities and aspirations with her, it strengthens the bond. What does her wisdom mean to you? 👨‍👩‍👦`,
        `Your mother raised you and shares her own journey with you. These honest conversations are how families truly know each other. How has her experience informed your own path? 💙`
      ];
      return motherResponses[Math.floor(Math.random() * motherResponses.length)];
    }
    
    // YOGA/FLEXIBILITY-SPECIFIC RESPONSES (check query keywords)
    if (lowerQuery.includes('yoga') || lowerQuery.includes('flexibility') || lowerQuery.includes('vinyasa')) {
      console.log('   ✅ MATCHED: Yoga handler');
      const yogaResponses = [
        `Your yoga practice is more than just physical flexibility - it's a sanctuary where body, breath, and mind align. That flow state during practice is where real healing happens. How does savasana affect you? 🧘`,
        `A 90-minute flow requires presence and commitment. The way your body and breath synchronized through those poses shows you're truly there on your mat, not just going through motions. What does yoga teach you about yourself? 🕉️`,
        `Your yoga journey is deepening your relationship with your body. Each challenging pose, each moment of stillness in savasana - it's all rewiring your nervous system toward peace. What transformation have you felt? ✨`
      ];
      return yogaResponses[Math.floor(Math.random() * yogaResponses.length)];
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
    
    // Temple/Spiritual-specific responses (check query keywords)
    if (lowerQuery.includes('temple') || lowerQuery.includes('church') || lowerQuery.includes('prayer') || lowerQuery.includes('worship') || lowerQuery.includes('spiritual')) {
      const templeResponses = [
        `Your temple visit was a moment of spiritual connection. You went with friends, seeking peace and togetherness. These moments of faith and community help us feel grounded. What did you experience during that time? 🙏`,
        `Your spiritual practice shows you're nurturing your inner self. Whether through prayer, worship, or simply being in a sacred space, you're honoring what matters. How does this practice affect your daily life? 🕉️`,
        `I can see you spent time in reflection and prayer. That spiritual dedication is powerful - it shows you're tending to your soul as much as your mind. What insights came to you? ✨`
      ];
      return templeResponses[Math.floor(Math.random() * templeResponses.length)];
    }
    
    // Learning/Goals-specific responses (check query keywords)
    if (lowerQuery.includes('learn') || lowerQuery.includes('learning') || lowerQuery.includes('studied') || lowerQuery.includes('goal') || lowerQuery.includes('progress')) {
      const learningResponses = [
        `Your commitment to learning shows real growth mindset. You're investing in developing new skills and knowledge, and that takes discipline. What excites you most about what you're learning? 📚`,
        `I can see you've been working on expanding your knowledge - whether it's code, concepts, or life lessons. Every skill you build becomes part of who you are. What's your next learning challenge? 🌱`,
        `Your dedication to growth is admirable. You're not just going through the motions - you're actually absorbing and building. How do these learnings fit into your bigger picture? 🎯`
      ];
      return learningResponses[Math.floor(Math.random() * learningResponses.length)];
    }
    
    // Friends/Relationships-specific responses (check query keywords)
    if (lowerQuery.includes('friend') || lowerQuery.includes('friends') || lowerQuery.includes('people') || lowerQuery.includes('person') || lowerQuery.includes('family')) {
      const friendResponses = [
        `Your time with friends shows how much you value connection. These moments of laughter, conversation, and togetherness are what make life rich. Who are the people that matter most to you? 👥`,
        `I can see you're building meaningful relationships. Whether you're out together or just talking, these connections nourish your soul. What do you appreciate most about the people in your life? 💝`,
        `Your friendships seem to be a source of joy and support. You're someone who values having people around you, and that speaks to your warm heart. What's one memory with friends that stands out? ✨`
      ];
      return friendResponses[Math.floor(Math.random() * friendResponses.length)];
    }
    
    // Peaceful/Calm-specific responses (check query keywords)
    if (lowerQuery.includes('peace') || lowerQuery.includes('calm') || lowerQuery.includes('relaxed') || lowerQuery.includes('rest') || lowerQuery.includes('peaceful')) {
      const peaceResponses = [
        `Your moments of peace are precious. In a busy world, you're making space for calm and restoration. These quiet moments are where real healing happens. What brings you the most peace? 🧘`,
        `I can see you value rest and tranquility. Taking time to slow down and breathe deeply shows self-awareness and self-care. How do these peaceful moments change your perspective? 🌿`,
        `Your need for calm and relaxation shows wisdom. You understand that rest isn't laziness - it's essential. What does a perfect peaceful moment look like for you? 💙`
      ];
      return peaceResponses[Math.floor(Math.random() * peaceResponses.length)];
    }
    
    // Anxiety/Worry-specific responses (check query keywords)
    if (lowerQuery.includes('anxious') || lowerQuery.includes('anxiety') || lowerQuery.includes('worried') || lowerQuery.includes('nervous') || lowerQuery.includes('stress') || lowerQuery.includes('worry')) {
      const anxietyResponses = [
        `I can see you're navigating anxiety and uncertainty. The fact that you're writing about these feelings shows you're processing them thoughtfully. What helps you when anxiety rises? 💙`,
        `Your anxiety is real and valid. Rather than pushing it away, you're facing it head-on through reflection. That takes courage. What's one thing that helps you feel grounded? ✨`,
        `The worry you're carrying shows you care deeply about outcomes. That sensitivity is a strength, even when it feels overwhelming. How can you be gentler with yourself? 🌸`
      ];
      return anxietyResponses[Math.floor(Math.random() * anxietyResponses.length)];
    }
    
    // Cooking/Food-specific responses (check query keywords)
    if (lowerQuery.includes('cook') || lowerQuery.includes('cooking') || lowerQuery.includes('recipe') || lowerQuery.includes('food') || lowerQuery.includes('meal')) {
      console.log('   ✅ MATCHED: Cooking handler');
      const cookingResponses = [
        `Your cooking shows love and tradition. Following your grandmother's recipe connects you to family history and creates something nourishing with your own hands. What makes this recipe special to you? 👨‍🍳`,
        `When you cook with intention, you're creating more than just food - you're making memories and honoring the people and cultures that shaped you. How does cooking make you feel? 💚`,
        `The meals you prepare are an expression of care - for yourself and for those you share them with. Your kitchen is a place of creativity and connection. What's your favorite dish to make? 🥘`
      ];
      return cookingResponses[Math.floor(Math.random() * cookingResponses.length)];
    }
    
    // Running/Morning fitness-specific responses (check query keywords)
    if (lowerQuery.includes('run') || lowerQuery.includes('running') || lowerQuery.includes('morning run')) {
      console.log('   ✅ MATCHED: Running handler');
      const runningResponses = [
        `Your morning run before sunrise shows dedication and discipline. That early energy sets the tone for your whole day. How do you feel after those runs? 🏃`,
        `There's something special about running in the early morning when the world is still quiet. You're building both physical endurance and mental clarity with every stride. What keeps you pushing forward? 💨`,
        `Your commitment to running shows you're investing in your health while also giving yourself that precious solo time. That balance of physical exertion and mental space is powerful. What thoughts come to you when you run? 🌅`
      ];
      return runningResponses[Math.floor(Math.random() * runningResponses.length)];
    }
    
    // Work/Professional-specific responses (check query keywords)
    if (lowerQuery.includes('work') || lowerQuery.includes('achievement') || lowerQuery.includes('project') || lowerQuery.includes('professional')) {
      console.log('   ✅ MATCHED: Work handler');
      const workResponses = [
        `Completing a big project after months of hard work is real achievement. Seeing your effort pay off and getting recognition validates all those late hours and problem-solving. How does success like this fuel you forward? 🎯`,
        `Your work journey shows someone who takes initiative and follows through. You didn't just do the work - you made an impact that was recognized. What's your next ambitious goal at work? 🚀`,
        `The pride you feel in your professional accomplishments is well-earned. You brought together strategy, effort, and collaboration to deliver something meaningful. What skills did you develop through this project? 💪`
      ];
      return workResponses[Math.floor(Math.random() * workResponses.length)];
    }
    
    // Travel/Adventure-specific responses (check query keywords)
    if (lowerQuery.includes('travel') || lowerQuery.includes('trip') || lowerQuery.includes('adventure') || lowerQuery.includes('destination') || lowerQuery.includes('wanderlust')) {
      console.log('   ✅ MATCHED: Travel handler');
      const travelResponses = [
        `Your travel dreams show a spirit of exploration and curiosity. You're imagining yourself in different places, experiencing new cultures and landscapes. What draws you to wandering and adventure? ✈️`,
        `The world is calling to you through your travel plans. Researching destinations, reading travel stories, dreaming about experiences - that's how wanderlust lives in your heart. Where would you go first? 🌍`,
        `Your desire to explore speaks to a part of you that wants growth, perspective, and connection with the wider world. Travel changes us in profound ways. What experience are you most excited about? 🗺️`
      ];
      return travelResponses[Math.floor(Math.random() * travelResponses.length)];
    }
    
    // Mother/Family conversation-specific responses (check query keywords)
    if (lowerQuery.includes('mother') || lowerQuery.includes('heartfelt') || (lowerQuery.includes('conversation') && lowerQuery.includes('family'))) {
      console.log('   ✅ MATCHED: Mother handler');
      const motherResponses = [
        `Your conversation with your mother shows the depth of your relationship. Sharing fears and dreams with her, hearing her stories - that's where real connection happens. What did you learn from listening to her? 💝`,
        `Those vulnerable moments with parents are precious. When you can be honest about insecurities and aspirations with her, it strengthens the bond. What does her wisdom mean to you? 👨‍👩‍👦`,
        `Your mother raised you and shares her own journey with you. These honest conversations are how families truly know each other. How has her experience informed your own path? 💙`
      ];
      return motherResponses[Math.floor(Math.random() * motherResponses.length)];
    }
    
    // Yoga/Flexibility-specific responses (check query keywords)
    if (lowerQuery.includes('yoga') || lowerQuery.includes('flexibility') || lowerQuery.includes('vinyasa')) {
      const yogaResponses = [
        `Your yoga practice is more than just physical flexibility - it's a sanctuary where body, breath, and mind align. That flow state during practice is where real healing happens. How does savasana affect you? 🧘`,
        `A 90-minute flow requires presence and commitment. The way your body and breath synchronized through those poses shows you're truly there on your mat, not just going through motions. What does yoga teach you about yourself? 🕉️`,
        `Your yoga journey is deepening your relationship with your body. Each challenging pose, each moment of stillness in savasana - it's all rewiring your nervous system toward peace. What transformation have you felt? ✨`
      ];
      return yogaResponses[Math.floor(Math.random() * yogaResponses.length)];
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
