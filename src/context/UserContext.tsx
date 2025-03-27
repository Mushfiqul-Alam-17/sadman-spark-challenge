import React, { createContext, useState, useContext, useEffect } from "react";

// Types
export type RankType = "Rookie" | "Killer" | "King";
export type ChallengeType = "7day" | "14day" | "30day" | null;

export interface LogEntryType {
  date: string;
  meds: boolean;
  junk: number; // 0-10 scale
  sleep: number; // hours
  midnightSleep: boolean;
  move: boolean;
  bp?: { systolic: number; diastolic: number };
  points: number;
}

export interface UserContextType {
  name: string;
  streak: number;
  points: number;
  rank: RankType;
  currentChallenge: ChallengeType;
  logs: LogEntryType[];
  todayLog: LogEntryType | null;
  completedChallenges: ChallengeType[];
  // Methods
  logDaily: (entry: Omit<LogEntryType, "date" | "points">) => void;
  startChallenge: (challenge: ChallengeType) => void;
  completeChallenge: (challenge: ChallengeType) => void;
  calculateTodayPoints: (entry: Omit<LogEntryType, "date" | "points">) => number;
  calculateProgressPercentage: () => number;
}

// Default values
const defaultContext: UserContextType = {
  name: "Sadman",
  streak: 0,
  points: 0,
  rank: "Rookie",
  currentChallenge: null,
  logs: [],
  todayLog: null,
  completedChallenges: [],
  logDaily: () => {},
  startChallenge: () => {},
  completeChallenge: () => {},
  calculateTodayPoints: () => 0,
  calculateProgressPercentage: () => 0,
};

// Create context
const UserContext = createContext<UserContextType>(defaultContext);

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Get today's date formatted
const getTodayFormatted = (): string => {
  return formatDate(new Date());
};

// Provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if we have saved user data
  const savedUserData = localStorage.getItem("sadmanUserData");
  const initialState = savedUserData ? JSON.parse(savedUserData) : defaultContext;
  
  // State
  const [name] = useState<string>(initialState.name);
  const [streak, setStreak] = useState<number>(initialState.streak);
  const [points, setPoints] = useState<number>(initialState.points);
  const [rank, setRank] = useState<RankType>(initialState.rank);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeType>(initialState.currentChallenge);
  const [logs, setLogs] = useState<LogEntryType[]>(initialState.logs);
  const [todayLog, setTodayLog] = useState<LogEntryType | null>(
    initialState.logs.find((log: LogEntryType) => log.date === getTodayFormatted()) || null
  );
  const [completedChallenges, setCompletedChallenges] = useState<ChallengeType[]>(
    initialState.completedChallenges || []
  );

  // Calculate rank based on points and challenges
  useEffect(() => {
    if (completedChallenges.includes("30day")) {
      setRank("King");
    } else if (completedChallenges.includes("14day")) {
      setRank("Killer");
    } else {
      // Keep as Rookie or set to Rookie
      setRank("Rookie");
    }
  }, [completedChallenges]);

  // Update streak when logs change
  useEffect(() => {
    // Sort logs by date
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedLogs.length === 0) {
      setStreak(0);
      return;
    }

    // Check if last log is today
    const today = getTodayFormatted();
    const lastLogDate = sortedLogs[0].date;
    
    if (lastLogDate !== today) {
      // Check if last log was yesterday
      const yesterday = formatDate(new Date(Date.now() - 86400000)); // 24 hours ago
      if (lastLogDate === yesterday) {
        // Keep streak
      } else {
        // Reset streak
        setStreak(0);
      }
    }

    // Count consecutive days
    let currentStreak = 1; // Start with today or the last logged day
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const currentDate = new Date(sortedLogs[i].date);
      const nextDate = new Date(sortedLogs[i + 1].date);
      
      // Check if dates are consecutive
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (Math.round(diffDays) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  }, [logs]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const userData = {
      name,
      streak,
      points,
      rank,
      currentChallenge,
      logs,
      completedChallenges,
    };
    
    localStorage.setItem("sadmanUserData", JSON.stringify(userData));
  }, [name, streak, points, rank, currentChallenge, logs, completedChallenges]);

  // Calculate points for an entry
  const calculateTodayPoints = (entry: Omit<LogEntryType, "date" | "points">): number => {
    let entryPoints = 0;
    
    // Meds: +20
    if (entry.meds) entryPoints += 20;
    
    // Junk (0-10, where 10 is no junk): +5 per point, max 50
    entryPoints += entry.junk * 5;
    
    // Sleep 6+ hours and no midnight: +15
    if (entry.sleep >= 6 && !entry.midnightSleep) entryPoints += 15;
    
    // Move: +10
    if (entry.move) entryPoints += 10;
    
    // BP check (simplified, could be expanded)
    if (entry.bp) {
      const { systolic, diastolic } = entry.bp;
      if (systolic < 130 && diastolic < 80) {
        entryPoints += 10; // Good BP
      } else {
        entryPoints -= 10; // Not ideal BP
      }
    }
    
    // Perfect day bonus (+25): All tasks completed with max scores
    if (
      entry.meds &&
      entry.junk === 10 &&
      entry.sleep >= 6 &&
      !entry.midnightSleep &&
      entry.move &&
      entry.bp &&
      entry.bp.systolic < 130 &&
      entry.bp.diastolic < 80
    ) {
      entryPoints += 25;
    }
    
    return entryPoints;
  };

  // Log daily entry
  const logDaily = (entry: Omit<LogEntryType, "date" | "points">) => {
    const today = getTodayFormatted();
    const pointsEarned = calculateTodayPoints(entry);
    
    // Create the complete log entry
    const newEntry: LogEntryType = {
      ...entry,
      date: today,
      points: pointsEarned,
    };
    
    // Check if today already has a log
    const todayLogIndex = logs.findIndex(log => log.date === today);
    
    if (todayLogIndex >= 0) {
      // Update existing log
      const updatedLogs = [...logs];
      updatedLogs[todayLogIndex] = newEntry;
      setLogs(updatedLogs);
    } else {
      // Add new log
      setLogs([...logs, newEntry]);
    }
    
    // Update today's log
    setTodayLog(newEntry);
    
    // Update total points
    setPoints(prevPoints => prevPoints + pointsEarned);
  };

  // Start a challenge
  const startChallenge = (challenge: ChallengeType) => {
    if (!challenge) return;
    
    // Only start if not already in a challenge
    if (!currentChallenge) {
      setCurrentChallenge(challenge);
    }
  };

  // Complete a challenge
  const completeChallenge = (challenge: ChallengeType) => {
    if (!challenge) return;
    
    // Add to completed challenges if not already there
    if (!completedChallenges.includes(challenge)) {
      setCompletedChallenges([...completedChallenges, challenge]);
    }
    
    // Reset current challenge
    setCurrentChallenge(null);
  };

  // Calculate progress percentage for current challenge
  const calculateProgressPercentage = (): number => {
    if (!currentChallenge) return 0;
    
    let targetPoints = 0;
    let duration = 0;
    
    // Set targets based on challenge
    switch (currentChallenge) {
      case "7day":
        targetPoints = 250;
        duration = 7;
        break;
      case "14day":
        targetPoints = 600;
        duration = 14;
        break;
      case "30day":
        targetPoints = 2000;
        duration = 30;
        break;
    }
    
    // Calculate total points for this challenge
    const challengeStartDate = new Date();
    challengeStartDate.setDate(challengeStartDate.getDate() - duration); // Go back to the start date
    
    const challengeLogs = logs.filter(log => 
      new Date(log.date) >= challengeStartDate
    );
    
    const challengePoints = challengeLogs.reduce((sum, log) => sum + log.points, 0);
    
    // Calculate percentage
    const percentage = Math.min((challengePoints / targetPoints) * 100, 100);
    return Math.round(percentage);
  };

  const value = {
    name,
    streak,
    points,
    setPoints,
    rank,
    currentChallenge,
    logs,
    todayLog,
    completedChallenges,
    logDaily,
    startChallenge,
    completeChallenge,
    calculateTodayPoints,
    calculateProgressPercentage,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook to use the context
export const useUser = () => useContext(UserContext);
