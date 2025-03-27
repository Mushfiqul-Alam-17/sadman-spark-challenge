
import { LogEntryType } from "@/context/UserContext";

// Function to analyze user's health patterns
export const analyzeHealthTrend = async (logs: LogEntryType[]): Promise<string> => {
  if (logs.length < 3) {
    return "Keep logging daily to get personalized AI insights!";
  }

  // Calculate trends
  const medsTrend = calculateTrend(logs.map(log => log.meds ? 1 : 0));
  const junkTrend = calculateTrend(logs.map(log => log.junk));
  const sleepTrend = calculateTrend(logs.map(log => log.sleep));
  const moveTrend = calculateTrend(logs.map(log => log.move ? 1 : 0));

  // Get the most improved area
  const trends = [
    { area: 'medications', value: medsTrend },
    { area: 'diet', value: junkTrend },
    { area: 'sleep', value: sleepTrend },
    { area: 'movement', value: moveTrend }
  ];

  const mostImproved = trends.reduce((best, current) => 
    current.value > best.value ? current : best, trends[0]);
  
  const mostNeeded = trends.reduce((worst, current) => 
    current.value < worst.value ? current : worst, trends[0]);

  // Generate personalized message
  if (mostImproved.value > 0.2) {
    return `Yo Sadman! Your ${mostImproved.area} game is leveling up! Keep crushing it. Next focus: boost your ${mostNeeded.area} to unlock more gains.`;
  } else if (mostImproved.value > 0) {
    return `Seeing some improvement in your ${mostImproved.area}. That's a start! Push harder on ${mostNeeded.area} to see real progress.`;
  } else {
    return `Time to level up, Sadman! Focus on your ${mostNeeded.area} first - small wins lead to big victories.`;
  }
};

// Helper function to calculate trend (positive = improving, negative = declining)
const calculateTrend = (values: number[]): number => {
  if (values.length < 3) return 0;
  
  // Simple linear regression slope calculation
  const n = values.length;
  const indices = Array.from({length: n}, (_, i) => i + 1);
  
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
  
  // Calculate slope
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  return slope;
};

// Function to get AI recommendation based on current stats
export const getAIRecommendation = (
  meds: boolean, 
  junk: number, 
  sleep: number, 
  midnightSleep: boolean,
  move: boolean
): string => {
  let focusAreas = [];
  
  if (!meds) focusAreas.push("taking your meds");
  if (junk < 5) focusAreas.push("eating cleaner");
  if (sleep < 6 || midnightSleep) focusAreas.push("fixing your sleep schedule");
  if (!move) focusAreas.push("moving your body");
  
  if (focusAreas.length === 0) {
    return "You're crushing it today! Perfect execution on all fronts. 🔥";
  } else if (focusAreas.length === 1) {
    return `Just one thing to fix: ${focusAreas[0]}. The rest is on point!`;
  } else {
    const areas = focusAreas.slice(0, 2).join(" and ");
    return `Focus on ${areas} first. Small steps, big results!`;
  }
};
