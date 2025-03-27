
import React from "react";
import { Challenge } from "@/utils/challenges";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  progress = 0,
  isActive = false,
  isCompleted = false,
  isLocked = false,
}) => {
  const { startChallenge } = useUser();
  
  const handleStartChallenge = () => {
    startChallenge(challenge.id);
    toast.success(`Started the ${challenge.name} challenge!`, {
      description: challenge.messages.start,
    });
  };
  
  return (
    <div 
      className={`glass-card p-5 transition-all duration-500 ${
        isActive 
          ? "border-kidney-blue shadow-neon-blue" 
          : isCompleted 
            ? "border-kidney-green shadow-neon-green" 
            : isLocked 
              ? "opacity-60 hover:opacity-70 border-border" 
              : "hover:border-kidney-purple/50 hover:shadow-neon-purple/50"
      }`}
    >
      <div className="space-y-4">
        <div>
          <p className={`inline-block px-2 py-0.5 text-xs rounded-full mb-2 ${
            isActive 
              ? "bg-kidney-blue/20 text-kidney-blue" 
              : isCompleted 
                ? "bg-kidney-green/20 text-kidney-green" 
                : isLocked 
                  ? "bg-muted text-muted-foreground" 
                  : "bg-kidney-purple/20 text-kidney-purple"
          }`}>
            {isActive 
              ? "ACTIVE" 
              : isCompleted 
                ? "COMPLETED" 
                : isLocked 
                  ? "LOCKED" 
                  : "AVAILABLE"}
          </p>
          <h3 className="text-xl font-bold">{challenge.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Goal: {challenge.pointsGoal} points</span>
              <span>{challenge.duration} days</span>
            </div>
            {(isActive || isCompleted) && (
              <ProgressBar 
                value={progress} 
                max={100} 
                thickness="normal" 
                color={isCompleted ? "success" : "default"}
                animated={isActive}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Tasks:</p>
            <ul className="text-sm space-y-1">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 mt-1.5 mr-2 rounded-full bg-kidney-red"></span>
                {challenge.tasks.meds.description}
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 mt-1.5 mr-2 rounded-full bg-kidney-yellow"></span>
                {challenge.tasks.junk.description}
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 mt-1.5 mr-2 rounded-full bg-kidney-blue"></span>
                {challenge.tasks.sleep.hours.description}
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 mt-1.5 mr-2 rounded-full bg-kidney-purple"></span>
                {challenge.tasks.move.description}
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          {isActive ? (
            <p className="text-sm font-medium text-kidney-blue animate-pulse-slow">Challenge in progress!</p>
          ) : isCompleted ? (
            <p className="text-sm font-medium text-kidney-green">
              Challenge complete! {challenge.reward.message}
            </p>
          ) : isLocked ? (
            <p className="text-sm text-muted-foreground">
              Complete previous challenges to unlock this one.
            </p>
          ) : (
            <Button 
              onClick={handleStartChallenge}
              className="w-full glass-button group font-medium"
            >
              Start Challenge
              <span className="ml-1 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
