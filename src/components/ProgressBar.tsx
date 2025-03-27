
import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  thickness?: "thin" | "normal" | "thick";
  color?: "default" | "success" | "warning" | "danger";
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  className,
  showLabel = false,
  thickness = "normal",
  color = "default",
  animated = true,
}) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const thicknessClasses = {
    thin: "h-1.5",
    normal: "h-2.5",
    thick: "h-4",
  };
  
  const colorClasses = {
    default: "bg-primary",
    success: "bg-kidney-green",
    warning: "bg-kidney-yellow",
    danger: "bg-kidney-red",
  };
  
  return (
    <div className={cn("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium">{percentage}%</span>
          <span className="text-muted-foreground font-medium">{value}/{max}</span>
        </div>
      )}
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", thicknessClasses[thickness])}>
        <div
          className={cn(
            colorClasses[color],
            "rounded-full transition-all duration-1000",
            animated && "animate-pulse-slow",
            thicknessClasses[thickness]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
