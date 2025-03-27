
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { getChallengeInfo, getNextChallenge } from "@/utils/challenges";
import ProgressBar from "./ProgressBar";
import StreakMeter from "./StreakMeter";
import { getRandomMessage } from "@/utils/messages";
import { Sparkles } from "lucide-react";

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { 
    name, 
    points, 
    streak, 
    rank, 
    currentChallenge, 
    calculateProgressPercentage,
    completedChallenges
  } = useUser();
  
  const [motivationalMessage, setMotivationalMessage] = useState<string>("");
  const [fistSize, setFistSize] = useState<number>(30);
  
  // Get challenge info
  const challenge = currentChallenge 
    ? getChallengeInfo(currentChallenge) 
    : getNextChallenge(completedChallenges) 
      ? getChallengeInfo(getNextChallenge(completedChallenges))
      : null;
  
  // Calculate progress
  const progress = currentChallenge ? calculateProgressPercentage() : 0;
  
  // Update fist size based on progress
  useEffect(() => {
    const baseFistSize = 30;
    const maxFistSize = 80;
    const newSize = baseFistSize + (maxFistSize - baseFistSize) * (progress / 100);
    setFistSize(newSize);
  }, [progress]);
  
  // Get random motivational message on mount and when streak changes
  useEffect(() => {
    setMotivationalMessage(getRandomMessage('daily'));
  }, [streak]);
  
  // Create rank badge with appropriate styling
  const getRankBadge = () => {
    let bgColor = "";
    let textColor = "";
    
    switch (rank) {
      case "Rookie":
        bgColor = "bg-kidney-blue/20";
        textColor = "text-kidney-blue";
        break;
      case "Killer":
        bgColor = "bg-kidney-purple/20";
        textColor = "text-kidney-purple";
        break;
      case "King":
        bgColor = "bg-kidney-yellow/20";
        textColor = "text-kidney-yellow";
        break;
    }
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${bgColor} ${textColor}`}>
        {rank === "King" && <Sparkles className="w-4 h-4 mr-1 animate-flame" />}
        <span className="font-bold text-sm">{rank}</span>
      </div>
    );
  };
  
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase text-muted-foreground mb-1">
          Sadman's HQ
        </p>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          {getRankBadge()}
        </div>
        <p className="text-kidney-yellow mt-2">{motivationalMessage}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {challenge ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Current Challenge:</p>
                <h3 className="text-xl font-bold">{challenge.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Goal: {challenge.pointsGoal} points in {challenge.duration} days
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <ProgressBar 
                  value={progress} 
                  max={100} 
                  animated={true}
                  color={progress >= 70 ? "success" : progress >= 40 ? "warning" : "default"}
                />
              </div>
              
              <div className="pt-3">
                <p className="text-sm font-medium mb-1">Total Fight Points:</p>
                <p className="text-3xl font-bold">
                  {points} 
                  <span className="text-sm font-normal text-muted-foreground ml-1">pts</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center space-y-4 py-6">
              <p className="text-center text-muted-foreground">
                No active challenge.<br />Start one from the Challenges tab!
              </p>
              <p className="text-xl font-bold">
                {points} 
                <span className="text-sm font-normal text-muted-foreground ml-1">total pts</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {/* Animated fist icon */}
            <div 
              className="w-40 h-40 flex items-center justify-center"
              style={{ 
                transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
            >
              <div 
                className={`
                  relative rounded-full 
                  ${progress > 0 ? 'animate-pulse-slow shadow-neon' : 'opacity-70'}
                `}
                style={{ 
                  width: `${fistSize}px`, 
                  height: `${fistSize}px`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  ✊
                </div>
              </div>
            </div>
            
            {/* Streak indicator */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <StreakMeter streak={streak} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
