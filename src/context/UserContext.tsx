
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  setPoints: React.Dispatch<React.SetStateAction<number>>;
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
  setPoints: () => {},
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have user in Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('name', name)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.error("Error fetching user:", userError);
          toast.error("Error fetching user data");
          setIsLoading(false);
          return;
        }
        
        // If user doesn't exist, create a new one
        if (!userData) {
          const { error: createError } = await supabase
            .from('users')
            .insert([
              { 
                name,
                streak,
                points,
                rank,
                current_challenge: currentChallenge,
                completed_challenges: completedChallenges
              }
            ]);
            
          if (createError) {
            console.error("Error creating user:", createError);
            toast.error("Error creating user");
          } else {
            console.log("New user created in Supabase");
          }
        } else {
          // Update local state with Supabase data
          setStreak(userData.streak || streak);
          setPoints(userData.points || points);
          setRank(userData.rank || rank);
          setCurrentChallenge(userData.current_challenge || currentChallenge);
          setCompletedChallenges(userData.completed_challenges || completedChallenges);
        }
        
        // Fetch logs
        const { data: logsData, error: logsError } = await supabase
          .from('logs')
          .select('*')
          .eq('user_name', name)
          .order('date', { ascending: false });
          
        if (logsError) {
          console.error("Error fetching logs:", logsError);
          toast.error("Error fetching logs");
        } else if (logsData && logsData.length > 0) {
          // Transform logs to match our format
          const transformedLogs: LogEntryType[] = logsData.map((log: any) => ({
            date: log.date,
            meds: log.meds,
            junk: log.junk,
            sleep: log.sleep,
            midnightSleep: log.midnight_sleep,
            move: log.move,
            bp: log.bp ? { systolic: log.bp.systolic, diastolic: log.bp.diastolic } : undefined,
            points: log.points
          }));
          
          setLogs(transformedLogs);
          
          // Set today's log if it exists
          const today = getTodayFormatted();
          const todayLogFromDB = transformedLogs.find(log => log.date === today);
          if (todayLogFromDB) {
            setTodayLog(todayLogFromDB);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        toast.error("Error connecting to backend");
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [name]);

  // Sync data to Supabase when it changes
  useEffect(() => {
    const syncUserData = async () => {
      if (isLoading) return;
      
      try {
        // Update user data
        const { error: updateError } = await supabase
          .from('users')
          .update({
            streak,
            points,
            rank,
            current_challenge: currentChallenge,
            completed_challenges: completedChallenges,
            updated_at: new Date().toISOString()
          })
          .eq('name', name);
          
        if (updateError) {
          console.error("Error updating user:", updateError);
          // Don't show toast on every update to avoid spam
        }
      } catch (error) {
        console.error("Error in syncUserData:", error);
      }
    };
    
    syncUserData();
  }, [streak, points, rank, currentChallenge, completedChallenges, isLoading, name]);

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
    
    // Also check if challenge is completed based on current points
    if (currentChallenge) {
      const progress = calculateProgressPercentage();
      if (progress >= 100) {
        // Challenge completed!
        completeChallenge(currentChallenge);
      }
    }
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
  const logDaily = async (entry: Omit<LogEntryType, "date" | "points">) => {
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
    
    // Update local state
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
    
    // Save to Supabase
    try {
      // Format for Supabase
      const logEntry = {
        user_name: name,
        date: today,
        meds: entry.meds,
        junk: entry.junk,
        sleep: entry.sleep,
        midnight_sleep: entry.midnightSleep,
        move: entry.move,
        bp: entry.bp,
        points: pointsEarned
      };
      
      // Upsert log entry
      const { error } = await supabase
        .from('logs')
        .upsert([logEntry], { onConflict: 'user_name,date' });
        
      if (error) {
        console.error("Error saving log:", error);
        toast.error("Failed to save daily log to server");
      } else {
        toast.success("Daily log saved to server");
      }
    } catch (error) {
      console.error("Error in logDaily:", error);
      toast.error("Error connecting to server");
    }
  };

  // Start a challenge
  const startChallenge = async (challenge: ChallengeType) => {
    if (!challenge) return;
    
    // Only start if not already in a challenge
    if (!currentChallenge) {
      setCurrentChallenge(challenge);
      
      // Update in Supabase
      try {
        const { error } = await supabase
          .from('users')
          .update({ current_challenge: challenge })
          .eq('name', name);
          
        if (error) {
          console.error("Error starting challenge:", error);
          toast.error("Failed to start challenge on server");
        }
      } catch (error) {
        console.error("Error in startChallenge:", error);
      }
    }
  };

  // Complete a challenge
  const completeChallenge = async (challenge: ChallengeType) => {
    if (!challenge) return;
    
    // Add to completed challenges if not already there
    if (!completedChallenges.includes(challenge)) {
      const updatedChallenges = [...completedChallenges, challenge];
      setCompletedChallenges(updatedChallenges);
      
      // Update in Supabase
      try {
        const { error } = await supabase
          .from('users')
          .update({ 
            completed_challenges: updatedChallenges,
            current_challenge: null 
          })
          .eq('name', name);
          
        if (error) {
          console.error("Error completing challenge:", error);
          toast.error("Failed to complete challenge on server");
        } else {
          toast.success(`Challenge ${challenge} completed!`);
        }
      } catch (error) {
        console.error("Error in completeChallenge:", error);
      }
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

  return (
    <UserContext.Provider value={value}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kidney-blue"></div>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

// Hook to use the context
export const useUser = () => useContext(UserContext);
