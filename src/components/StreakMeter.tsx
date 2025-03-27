
import React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakMeterProps {
  streak: number;
  className?: string;
}

const StreakMeter: React.FC<StreakMeterProps> = ({ streak, className }) => {
  // Calculate intensity of flames based on streak
  const getFlameSize = (position: number): number => {
    if (streak === 0) return 16; // Base size when no streak
    
    // Make flames bigger with streak
    const baseSize = 18;
    const maxSize = 26;
    
    // Central flame is biggest
    if (position === 2) {
      return Math.min(baseSize + streak, maxSize);
    }
    
    // Adjacent flames
    if (position === 1 || position === 3) {
      return Math.min(baseSize + (streak - 1) * 0.8, maxSize - 2);
    }
    
    // Outer flames
    return Math.min(baseSize + (streak - 2) * 0.6, maxSize - 4);
  };
  
  const getFlameOpacity = (position: number): number => {
    if (streak === 0) return 0.3;
    
    // Make outer flames appear with streak
    if (position === 0 && streak < 2) return 0.2;
    if (position === 4 && streak < 2) return 0.2;
    if (position === 1 && streak < 1) return 0.3;
    if (position === 3 && streak < 1) return 0.3;
    
    return 1;
  };
  
  const getAnimationDelay = (position: number): string => {
    const delayMap = ["0.5s", "0.2s", "0s", "0.3s", "0.6s"];
    return delayMap[position];
  };
  
  return (
    <div className={cn("flex items-end justify-center gap-0.5 py-2", className)}>
      {[0, 1, 2, 3, 4].map((pos) => (
        <div 
          key={pos}
          className="relative transition-all duration-500"
          style={{ 
            opacity: getFlameOpacity(pos),
            animationDelay: getAnimationDelay(pos)
          }}
        >
          <Flame
            className={cn(
              "flame-icon animate-flame",
              streak > 0 && "animate-bounce-small"
            )}
            size={getFlameSize(pos)}
            style={{ 
              animationDuration: `${1.5 + pos * 0.2}s`,
              animationDelay: getAnimationDelay(pos)
            }}
          />
        </div>
      ))}
      <div className="mt-2 text-xs font-medium text-kidney-yellow">
        {streak === 0 ? (
          <span className="opacity-60">No streak</span>
        ) : (
          <span className="animate-pulse-slow">{streak} day{streak > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
};

export default StreakMeter;
