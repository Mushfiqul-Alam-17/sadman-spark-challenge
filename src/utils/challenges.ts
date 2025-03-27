
import { ChallengeType } from "../context/UserContext";

export interface Challenge {
  id: ChallengeType;
  name: string;
  description: string;
  duration: number;
  pointsGoal: number;
  tasks: {
    meds: { days: number, description: string };
    junk: { score: number, description: string };
    sleep: { 
      hours: { days: number, description: string },
      noMidnight: { days: number, description: string }
    };
    move: { days: number, description: string };
  };
  messages: {
    start: string;
    middle: string;
    end: string;
  };
  reward: {
    badge: string;
    message: string;
  };
  unlocks?: ChallengeType;
}

export const challenges: Record<ChallengeType, Challenge> = {
  "7day": {
    id: "7day",
    name: "Get Up, Sadman!",
    description: "Your first step to kidney domination. 7 days to prove you're a fighter.",
    duration: 7,
    pointsGoal: 250,
    tasks: {
      meds: { days: 5, description: "Take meds 5 out of 7 days" },
      junk: { score: 5, description: "Keep junk score at 5+ daily (less junk = higher score)" },
      sleep: { 
        hours: { days: 4, description: "Sleep 6+ hours 4 out of 7 days" },
        noMidnight: { days: 3, description: "No past midnight 3 out of 7 days" }
      },
      move: { days: 3, description: "Move your body 3 out of 7 days" }
    },
    messages: {
      start: "Sadman, you're in—don't flop!",
      middle: "Halfway, dude—keep it real!",
      end: "Rookie Killer! 14 days next?"
    },
    reward: {
      badge: "Killer",
      message: "You've earned the Killer badge! Ready to level up?"
    },
    unlocks: "14day"
  },
  "14day": {
    id: "14day",
    name: "Sadman Levels Up!",
    description: "Time to push harder. Show your kidneys who's boss for 14 straight days.",
    duration: 14,
    pointsGoal: 600,
    tasks: {
      meds: { days: 12, description: "Take meds 12 out of 14 days" },
      junk: { score: 7, description: "Keep junk score at 7+ daily (mostly clean eating)" },
      sleep: { 
        hours: { days: 10, description: "Sleep 6+ hours 10 out of 14 days" },
        noMidnight: { days: 8, description: "No past midnight 8 out of 14 days" }
      },
      move: { days: 7, description: "Move your body 7 out of 14 days" }
    },
    messages: {
      start: "Level 2 challenge accepted. Let's go!",
      middle: "Ten down, Sadman's a beast!",
      end: "Killer to King! 30 days up?"
    },
    reward: {
      badge: "King",
      message: "You've earned the King badge! Ready for the ultimate challenge?"
    },
    unlocks: "30day"
  },
  "30day": {
    id: "30day",
    name: "Sadman Rules!",
    description: "The ultimate challenge. 30 days to total kidney domination.",
    duration: 30,
    pointsGoal: 2000,
    tasks: {
      meds: { days: 27, description: "Take meds 27 out of 30 days" },
      junk: { score: 8, description: "Keep junk score at 8+ daily (pro eating)" },
      sleep: { 
        hours: { days: 25, description: "Sleep 6+ hours 25 out of 30 days" },
        noMidnight: { days: 20, description: "No past midnight 20 out of 30 days" }
      },
      move: { days: 20, description: "Move your body 20 out of 30 days" }
    },
    messages: {
      start: "The ultimate challenge begins! You got this, Sadman.",
      middle: "20 days? You're unreal!",
      end: "Sadman Rules! You're the king!"
    },
    reward: {
      badge: "Legend",
      message: "You've conquered the ultimate challenge! You're a Legend, Sadman!"
    }
  }
};

export const getNextChallenge = (completedChallenges: ChallengeType[]): ChallengeType | null => {
  if (!completedChallenges.includes("7day")) {
    return "7day";
  } else if (!completedChallenges.includes("14day")) {
    return "14day";
  } else if (!completedChallenges.includes("30day")) {
    return "30day";
  } else {
    return "30day"; // Can repeat the 30-day challenge
  }
};

export const getChallengeInfo = (challengeId: ChallengeType | null): Challenge | null => {
  if (!challengeId) return null;
  return challenges[challengeId];
};
