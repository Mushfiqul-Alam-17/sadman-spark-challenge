// Motivational messages for Sadman based on his actions
export const motivationalMessages = {
  // Messages related to medication
  meds: {
    positive: [
      "Meds down? You're a beast!",
      "Way to crush those meds, Sadman!",
      "Meds on schedule = kidneys thanking you",
      "Med streak going strong! Keep fighting!",
      "Look at you being responsible with those meds!"
    ],
    negative: [
      "Don't forget your meds - they're your power-up!",
      "No meds? Don't let your kidneys down, bro!",
      "Skipping meds is like skipping leg day - don't do it!",
      "Your kidneys need those meds to fight!",
      "Those meds are your kidney shields - use them!"
    ]
  },
  
  // Messages related to junk food
  junk: {
    positive: [
      "Clean eating? Your kidneys are hyped!",
      "Ditching junk? That's power moves!",
      "Less junk = stronger fighter",
      "Your body's leveling up with that clean fuel!",
      "Junk food KO'd! You're winning!"
    ],
    negative: [
      "Junk's trash, ditch it!",
      "Your kidneys hate that junk - do better tomorrow!",
      "Junk food is your kidney's enemy - fight back!",
      "Time to level up your food game!",
      "Junk food's weak - just like it makes you!"
    ]
  },
  
  // Messages related to sleep
  sleep: {
    positive: [
      "Solid sleep = superhero recovery",
      "Good sleep is your secret weapon!",
      "Sleep game strong - kidney fight strong!",
      "Sleeping right makes you unstoppable!",
      "Early to bed = leveling up tomorrow"
    ],
    negative: [
      "Midnight gaming hurts your kidney game!",
      "Sleep is when your body levels up - don't skip it!",
      "Your kidneys need sleep to recharge!",
      "Late nights = weak fights. Get some sleep!",
      "No sleep = no gains for your kidney strength"
    ]
  },
  
  // Messages related to movement
  move: {
    positive: [
      "Moving like a champ! Your body's thanking you!",
      "That movement is pure kidney power!",
      "Keep moving, keep winning!",
      "Move, then chill harder - you earned it!",
      "Movement streak = beast mode activated!"
    ],
    negative: [
      "Your body needs movement - even just a walk!",
      "No moves today? Your kidneys want better!",
      "Get up and move - your kidneys will thank you!",
      "Being still is being stuck - move to level up!",
      "Movement unlocks kidney power - don't skip it!"
    ]
  },
  
  // Messages based on streaks
  streak: {
    short: [
      "Day 1 complete! Now don't break the chain!",
      "2 days straight! The streak begins!",
      "3 days in! You're building momentum!",
      "Keep that streak alive! You're on fire!"
    ],
    medium: [
      "5 day streak! You're becoming unstoppable!",
      "A week straight! Now that's dedication!",
      "8 days and counting! The streak is real!",
      "Your kidneys are feeling the streak power!"
    ],
    long: [
      "10+ days? You're in beast mode now!",
      "Two weeks strong! Nothing can stop you!",
      "This streak is legendary! Keep dominating!",
      "Your streak is scaring other kidney fighters!"
    ]
  },
  
  // Random daily motivation
  daily: [
    "Today's another chance to level up your kidney game!",
    "Your kidneys are counting on you today!",
    "16's your time - own it, Sadman!",
    "Each day you fight makes you stronger!",
    "One day at a time - you got this!",
    "Small wins today = big victory tomorrow!",
    "You're the boss of your body - show it who's in charge!",
    "Future Sadman will thank today's Sadman for fighting!",
    "17's coming, Sadman - rule it!"
  ]
};

// Get a random message from a category
export const getRandomMessage = (category: keyof typeof motivationalMessages, subcategory?: string): string => {
  const messages = subcategory 
    ? motivationalMessages[category][subcategory as keyof typeof motivationalMessages[typeof category]]
    : motivationalMessages[category];
  
  // Check if messages is an array or an object
  if (Array.isArray(messages)) {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  } else {
    // If it's an object and no subcategory was provided, select a random subcategory
    const subcategories = Object.keys(messages) as Array<keyof typeof messages>;
    const randomSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    const messagesArray = messages[randomSubcategory] as string[];
    const randomIndex = Math.floor(Math.random() * messagesArray.length);
    return messagesArray[randomIndex];
  }
};

// Get streak message based on streak length
export const getStreakMessage = (streakDays: number): string => {
  if (streakDays <= 3) {
    return getRandomMessage('streak', 'short');
  } else if (streakDays <= 9) {
    return getRandomMessage('streak', 'medium');
  } else {
    return getRandomMessage('streak', 'long');
  }
};

// Get message based on today's log
export const getLogBasedMessage = (
  meds: boolean, 
  junk: number, 
  sleep: number, 
  midnightSleep: boolean,
  move: boolean
): string => {
  // Pick a category to focus on randomly
  const categories = ['meds', 'junk', 'sleep', 'move'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  switch (randomCategory) {
    case 'meds':
      return getRandomMessage('meds', meds ? 'positive' : 'negative');
    case 'junk':
      return getRandomMessage('junk', junk >= 7 ? 'positive' : 'negative');
    case 'sleep':
      return getRandomMessage('sleep', (sleep >= 6 && !midnightSleep) ? 'positive' : 'negative');
    case 'move':
      return getRandomMessage('move', move ? 'positive' : 'negative');
    default:
      return getRandomMessage('daily');
  }
};
