
import React from "react";
import { useUser, LogEntryType } from "@/context/UserContext";
import ProgressBar from "./ProgressBar";

interface StatsCardProps {
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ className }) => {
  const { logs, rank } = useUser();
  
  const getWeeklyStats = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const weekLogs = logs.filter(log => 
      new Date(log.date) >= weekAgo && new Date(log.date) <= today
    );
    
    // Meds adherence
    const medsAdherence = weekLogs.filter(log => log.meds).length;
    const medsPercentage = weekLogs.length ? (medsAdherence / weekLogs.length) * 100 : 0;
    
    // Average junk score
    const avgJunk = weekLogs.length 
      ? weekLogs.reduce((sum, log) => sum + log.junk, 0) / weekLogs.length 
      : 0;
      
    // Sleep pattern
    const goodSleepDays = weekLogs.filter(log => log.sleep >= 6).length;
    const noMidnightDays = weekLogs.filter(log => !log.midnightSleep).length;
    
    // Movement days
    const movementDays = weekLogs.filter(log => log.move).length;
    
    return {
      medsAdherence: Math.round(medsPercentage),
      avgJunk: Math.round(avgJunk * 10) / 10,
      goodSleepDays,
      noMidnightDays,
      movementDays,
      totalDays: weekLogs.length
    };
  };
  
  const weeklyStats = getWeeklyStats();
  
  return (
    <div className={`glass-card p-5 space-y-4 ${className}`}>
      <div>
        <p className="text-sm font-medium uppercase text-muted-foreground mb-1">
          Weekly Stats
        </p>
        <h3 className="text-xl font-bold">
          Your Progress
          <span className="ml-2 text-sm font-normal bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {rank}
          </span>
        </h3>
      </div>
      
      <div className="grid gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-sm font-medium">Meds Adherence</p>
            <p className="text-sm text-muted-foreground">
              {weeklyStats.medsAdherence}%
            </p>
          </div>
          <ProgressBar 
            value={weeklyStats.medsAdherence} 
            max={100} 
            color={weeklyStats.medsAdherence >= 80 ? "success" : weeklyStats.medsAdherence >= 50 ? "warning" : "danger"} 
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-sm font-medium">Junk Food Score</p>
            <p className="text-sm text-muted-foreground">
              {weeklyStats.avgJunk}/10
            </p>
          </div>
          <ProgressBar 
            value={weeklyStats.avgJunk * 10} 
            max={100} 
            color={weeklyStats.avgJunk >= 7 ? "success" : weeklyStats.avgJunk >= 5 ? "warning" : "danger"} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Good Sleep</p>
            <p className="text-2xl font-bold">
              {weeklyStats.goodSleepDays}
              <span className="text-sm font-normal text-muted-foreground">
                /{weeklyStats.totalDays || 7} days
              </span>
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Before Midnight</p>
            <p className="text-2xl font-bold">
              {weeklyStats.noMidnightDays}
              <span className="text-sm font-normal text-muted-foreground">
                /{weeklyStats.totalDays || 7} days
              </span>
            </p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1">Movement Days</p>
          <p className="text-2xl font-bold">
            {weeklyStats.movementDays}
            <span className="text-sm font-normal text-muted-foreground">
              /{weeklyStats.totalDays || 7} days
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
