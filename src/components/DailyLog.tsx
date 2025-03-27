
import React, { useState } from "react";
import { useUser, LogEntryType } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { calculatePoints, getPointsBreakdown } from "@/utils/points";
import { getRandomMessage } from "@/utils/messages";

interface DailyLogProps {
  className?: string;
}

const DailyLog: React.FC<DailyLogProps> = ({ className }) => {
  const { todayLog, logDaily } = useUser();
  
  const [meds, setMeds] = useState<boolean>(todayLog?.meds || false);
  const [junk, setJunk] = useState<number>(todayLog?.junk || 5);
  const [sleep, setSleep] = useState<number>(todayLog?.sleep || 6);
  const [midnightSleep, setMidnightSleep] = useState<boolean>(todayLog?.midnightSleep || false);
  const [move, setMove] = useState<boolean>(todayLog?.move || false);
  const [systolic, setSystolic] = useState<string>(todayLog?.bp?.systolic.toString() || "");
  const [diastolic, setDiastolic] = useState<string>(todayLog?.bp?.diastolic.toString() || "");
  
  const handleSliderChange = (value: number[]) => {
    setJunk(value[0]);
  };
  
  const handleSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 24) {
      setSleep(value);
    }
  };
  
  const handleBPChange = (type: 'systolic' | 'diastolic', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      if (type === 'systolic') {
        setSystolic(value);
      } else {
        setDiastolic(value);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create log entry
    const bp = systolic && diastolic 
      ? { systolic: parseInt(systolic), diastolic: parseInt(diastolic) } 
      : undefined;
    
    const logEntry = {
      meds,
      junk,
      sleep,
      midnightSleep,
      move,
      bp
    };
    
    // Get points
    const points = calculatePoints(logEntry);
    const breakdown = getPointsBreakdown(logEntry);
    
    // Submit the log
    logDaily(logEntry);
    
    // Calculate which aspect was best
    const aspects = [
      { name: 'meds', points: breakdown.meds, max: 20 },
      { name: 'junk', points: breakdown.junk, max: 50 },
      { name: 'sleep', points: breakdown.sleep, max: 15 },
      { name: 'move', points: breakdown.move, max: 10 }
    ];
    
    const bestAspect = aspects.reduce((best, current) => {
      const bestPercentage = (best.points / best.max) * 100;
      const currentPercentage = (current.points / current.max) * 100;
      return currentPercentage > bestPercentage ? current : best;
    });
    
    // Show toast with points earned and best aspect
    if (breakdown.perfectDay > 0) {
      toast.success(`Perfect Day! +${points} points`, {
        description: "You crushed it today! Every aspect of your health is on point!",
      });
    } else {
      toast.success(`Log Saved! +${points} points`, {
        description: getRandomMessage(bestAspect.name as any, breakdown[bestAspect.name] > 0 ? 'positive' : 'negative'),
      });
    }
  };
  
  const getJunkLabel = (value: number) => {
    if (value <= 2) return "Mostly Junk";
    if (value <= 5) return "Some Junk";
    if (value <= 8) return "Little Junk";
    return "No Junk";
  };
  
  const isLogComplete = todayLog !== null;
  
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="mb-4">
        <p className="text-sm font-medium uppercase text-muted-foreground mb-1">
          Daily Check-in
        </p>
        <h3 className="text-xl font-bold">Sadman's Moves</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Quick 20-second log to track your fight
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Meds Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="meds" className="text-base cursor-pointer">
              Took meds today?
            </Label>
            <Switch 
              id="meds" 
              checked={meds} 
              onCheckedChange={setMeds} 
              disabled={isLogComplete}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            +20 points when you take your meds
          </p>
        </div>
        
        {/* Junk Food Section */}
        <div className="space-y-3">
          <Label className="text-base mb-6">
            Junk today? <span className="text-muted-foreground text-sm">{getJunkLabel(junk)} ({junk}/10)</span>
          </Label>
          <Slider 
            value={[junk]} 
            min={0} 
            max={10} 
            step={1}
            onValueChange={handleSliderChange}
            disabled={isLogComplete}
            className="py-4"
          />
          <p className="text-xs text-muted-foreground">
            0 = all junk, 10 = no junk, +{junk * 5} points
          </p>
        </div>
        
        {/* Sleep Section */}
        <div className="space-y-3">
          <Label htmlFor="sleep" className="text-base">
            How many hours did you sleep?
          </Label>
          <div className="flex items-center gap-3">
            <Input 
              id="sleep" 
              type="number" 
              min={0}
              max={24}
              value={sleep}
              onChange={handleSleepChange}
              className="w-20"
              disabled={isLogComplete}
            />
            <p className="text-sm">hours</p>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <Label htmlFor="midnight" className="text-base cursor-pointer">
              Up past midnight?
            </Label>
            <Switch 
              id="midnight" 
              checked={midnightSleep} 
              onCheckedChange={setMidnightSleep} 
              disabled={isLogComplete}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            6+ hours sleep and before midnight = +15 points
          </p>
        </div>
        
        {/* Movement Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="move" className="text-base cursor-pointer">
              Did you move today?
            </Label>
            <Switch 
              id="move" 
              checked={move} 
              onCheckedChange={setMove} 
              disabled={isLogComplete}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Any physical activity counts, +10 points
          </p>
        </div>
        
        {/* Blood Pressure Section (Optional) */}
        <div className="space-y-3">
          <Label className="text-base">
            Blood Pressure <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="120" 
              value={systolic}
              onChange={(e) => handleBPChange('systolic', e.target.value)}
              className="w-20"
              disabled={isLogComplete}
            />
            <span>/</span>
            <Input 
              placeholder="80" 
              value={diastolic}
              onChange={(e) => handleBPChange('diastolic', e.target.value)}
              className="w-20"
              disabled={isLogComplete}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Good BP (e.g. below 130/80) = +10 points
          </p>
        </div>
        
        {/* Submit Button */}
        {!isLogComplete ? (
          <Button type="submit" className="w-full glass-button font-medium">
            Lock It In, Sadman!
          </Button>
        ) : (
          <div className="flex items-center justify-center py-1 px-4 rounded-md bg-kidney-green/20 text-kidney-green">
            <Check className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Today's log complete!</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default DailyLog;
