
import { LogEntryType } from "../context/UserContext";

export const calculatePoints = (entry: Omit<LogEntryType, "date" | "points">): number => {
  let points = 0;
  
  // Meds: +20 points
  if (entry.meds) points += 20;
  
  // Junk food score (0-10, where 10 is no junk): +5 per point, max 50
  points += entry.junk * 5;
  
  // Sleep: 6+ hours and no midnight +15 points
  if (entry.sleep >= 6 && !entry.midnightSleep) points += 15;
  
  // Movement: +10 points
  if (entry.move) points += 10;
  
  // BP: good +10, bad -10
  if (entry.bp) {
    if (entry.bp.systolic < 130 && entry.bp.diastolic < 80) {
      points += 10;
    } else {
      points -= 10;
    }
  }
  
  // Perfect day bonus: +25 points
  if (
    entry.meds &&
    entry.junk >= 8 &&
    entry.sleep >= 6 &&
    !entry.midnightSleep &&
    entry.move &&
    entry.bp &&
    entry.bp.systolic < 130 &&
    entry.bp.diastolic < 80
  ) {
    points += 25;
  }
  
  return points;
};

export const getMaxPossiblePoints = (): number => {
  // Meds: 20 + Junk: 50 + Sleep: 15 + Move: 10 + BP: 10 + Perfect Day: 25
  return 130;
};

export const getPointsBreakdown = (entry: Omit<LogEntryType, "date" | "points">) => {
  return {
    meds: entry.meds ? 20 : 0,
    junk: entry.junk * 5,
    sleep: entry.sleep >= 6 && !entry.midnightSleep ? 15 : 0,
    move: entry.move ? 10 : 0,
    bp: entry.bp 
      ? (entry.bp.systolic < 130 && entry.bp.diastolic < 80 ? 10 : -10) 
      : 0,
    perfectDay: (
      entry.meds &&
      entry.junk >= 8 &&
      entry.sleep >= 6 &&
      !entry.midnightSleep &&
      entry.move &&
      entry.bp &&
      entry.bp.systolic < 130 &&
      entry.bp.diastolic < 80
    ) ? 25 : 0
  };
};
