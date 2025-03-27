
import React, { useState, useEffect } from "react";
import { useUser, LogEntryType } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Check, X, Pill, Moon, Activity, FastForward, Heart, ArrowRight, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";
import { calculatePoints, getPointsBreakdown } from "@/utils/points";
import { getRandomMessage } from "@/utils/messages";
import { motion } from "framer-motion";

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
  const [currentSection, setCurrentSection] = useState<number>(0);
  
  // Sections for step-by-step form
  const sections = [
    { name: "Medication", icon: <Pill className="h-5 w-5" /> },
    { name: "Diet", icon: <FastForward className="h-5 w-5" /> },
    { name: "Sleep", icon: <Moon className="h-5 w-5" /> },
    { name: "Activity", icon: <Activity className="h-5 w-5" /> },
    { name: "Blood Pressure", icon: <Heart className="h-5 w-5" /> },
  ];
  
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
  
  // Go to next section
  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };
  
  // Go to previous section
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };
  
  // Animation variants for the sections
  const variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  return (
    <div className={`glass-card p-5 relative overflow-hidden border border-kidney-purple/30 shadow-neon-purple ${className}`}>
      {/* Decorative elements for futuristic look */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kidney-purple via-kidney-blue to-kidney-green"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1 bg-gradient-to-r from-kidney-yellow to-kidney-red"></div>
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-kidney-blue animate-pulse"></div>
      <div className="absolute top-6 right-6 w-1 h-1 rounded-full bg-kidney-yellow animate-pulse animation-delay-200"></div>
      
      <div className="mb-4">
        <p className="text-sm font-medium uppercase text-kidney-blue mb-1">
          Daily Health Scanner
        </p>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-kidney-yellow animate-flame" /> Sadman's Moves
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Quick health monitor - tap to track your fight
        </p>
      </div>
      
      {/* Progress steps */}
      <div className="flex justify-between mb-6 px-2">
        {sections.map((section, index) => (
          <button
            key={index}
            className={`flex flex-col items-center transition-all duration-300 ${
              index === currentSection 
                ? "scale-110 text-kidney-purple" 
                : index < currentSection 
                  ? "text-kidney-green" 
                  : "text-muted-foreground"
            }`}
            onClick={() => setCurrentSection(index)}
            disabled={isLogComplete}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-all duration-300 ${
              index === currentSection 
                ? "bg-kidney-purple/20 shadow-neon-purple" 
                : index < currentSection 
                  ? "bg-kidney-green/20" 
                  : "bg-secondary"
            }`}>
              {index < currentSection ? (
                <Check className="h-4 w-4" />
              ) : (
                section.icon
              )}
            </div>
            <span className="text-xs hidden sm:block">{section.name}</span>
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sections */}
        <div className="min-h-[240px]">
          {/* Meds Section */}
          {currentSection === 0 && (
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-kidney-purple mb-3">
                <Pill className="h-5 w-5" />
                <h4 className="text-lg font-medium">Medication Check</h4>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-secondary/20 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <Label htmlFor="meds" className="text-base cursor-pointer flex items-center gap-2">
                    <span>Took meds today?</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-kidney-purple/20 text-kidney-purple">+20 pts</span>
                  </Label>
                  <Switch 
                    id="meds" 
                    checked={meds} 
                    onCheckedChange={setMeds} 
                    disabled={isLogComplete}
                    className="data-[state=checked]:bg-kidney-purple"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Taking your medication is crucial for kidney health
                </p>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  type="button" 
                  onClick={nextSection} 
                  disabled={isLogComplete}
                  className="glass-button font-medium gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Junk Food Section */}
          {currentSection === 1 && (
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-kidney-blue mb-3">
                <FastForward className="h-5 w-5" />
                <h4 className="text-lg font-medium">Diet Monitor</h4>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-secondary/20 backdrop-blur-md">
                <Label className="text-base mb-6 flex items-center justify-between">
                  <span>Junk food today?</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-kidney-blue/20 text-kidney-blue">
                    {getJunkLabel(junk)} (+{junk * 5} pts)
                  </span>
                </Label>
                
                <div className="py-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Mostly Junk</span>
                    <span>No Junk</span>
                  </div>
                  <Slider 
                    value={[junk]} 
                    min={0} 
                    max={10} 
                    step={1}
                    onValueChange={handleSliderChange}
                    disabled={isLogComplete}
                    className="py-4"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  type="button" 
                  onClick={prevSection} 
                  disabled={isLogComplete}
                  variant="outline"
                  className="font-medium"
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextSection} 
                  disabled={isLogComplete}
                  className="glass-button font-medium gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Sleep Section */}
          {currentSection === 2 && (
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-kidney-purple mb-3">
                <Moon className="h-5 w-5" />
                <h4 className="text-lg font-medium">Sleep Tracker</h4>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-secondary/20 backdrop-blur-md">
                <Label htmlFor="sleep" className="text-base flex items-center justify-between">
                  <span>Hours of sleep</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-kidney-purple/20 text-kidney-purple">
                    {sleep >= 6 ? "+15 pts" : "No points"}
                  </span>
                </Label>
                
                <div className="flex items-center gap-3 mt-3">
                  <Input 
                    id="sleep" 
                    type="number" 
                    min={0}
                    max={24}
                    value={sleep}
                    onChange={handleSleepChange}
                    className="w-20 bg-secondary/50 border-kidney-purple/20 focus:border-kidney-purple"
                    disabled={isLogComplete}
                  />
                  <p className="text-sm">hours</p>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Label htmlFor="midnight" className="text-base cursor-pointer">
                    Up past midnight?
                  </Label>
                  <Switch 
                    id="midnight" 
                    checked={midnightSleep} 
                    onCheckedChange={setMidnightSleep} 
                    disabled={isLogComplete}
                    className="data-[state=checked]:bg-kidney-purple"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  type="button" 
                  onClick={prevSection} 
                  disabled={isLogComplete}
                  variant="outline"
                  className="font-medium"
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextSection} 
                  disabled={isLogComplete}
                  className="glass-button font-medium gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Movement Section */}
          {currentSection === 3 && (
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-kidney-green mb-3">
                <Activity className="h-5 w-5" />
                <h4 className="text-lg font-medium">Activity Status</h4>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-secondary/20 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <Label htmlFor="move" className="text-base cursor-pointer flex items-center gap-2">
                    <span>Did you move today?</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-kidney-green/20 text-kidney-green">+10 pts</span>
                  </Label>
                  <Switch 
                    id="move" 
                    checked={move} 
                    onCheckedChange={setMove} 
                    disabled={isLogComplete}
                    className="data-[state=checked]:bg-kidney-green"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Any physical activity counts - walking, stretching, sports
                </p>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  type="button" 
                  onClick={prevSection} 
                  disabled={isLogComplete}
                  variant="outline"
                  className="font-medium"
                >
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextSection} 
                  disabled={isLogComplete}
                  className="glass-button font-medium gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {/* Blood Pressure Section */}
          {currentSection === 4 && (
            <motion.div 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-kidney-red mb-3">
                <Heart className="h-5 w-5" />
                <h4 className="text-lg font-medium">Blood Pressure</h4>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary to-secondary/20 backdrop-blur-md">
                <Label className="text-base flex items-center justify-between">
                  <span>Today's reading</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-kidney-red/20 text-kidney-red">Optional</span>
                </Label>
                
                <div className="flex items-center gap-2 mt-3">
                  <Input 
                    placeholder="120" 
                    value={systolic}
                    onChange={(e) => handleBPChange('systolic', e.target.value)}
                    className="w-20 bg-secondary/50 border-kidney-red/20 focus:border-kidney-red"
                    disabled={isLogComplete}
                  />
                  <span className="text-xl font-light">/</span>
                  <Input 
                    placeholder="80" 
                    value={diastolic}
                    onChange={(e) => handleBPChange('diastolic', e.target.value)}
                    className="w-20 bg-secondary/50 border-kidney-red/20 focus:border-kidney-red"
                    disabled={isLogComplete}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Good BP (below 130/80) = +10 points
                </p>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  type="button" 
                  onClick={prevSection} 
                  disabled={isLogComplete}
                  variant="outline"
                  className="font-medium"
                >
                  Back
                </Button>
                {!isLogComplete ? (
                  <Button 
                    type="submit" 
                    className="glass-button font-medium gap-1 bg-gradient-to-r from-kidney-blue to-kidney-purple hover:shadow-neon"
                  >
                    Submit Log <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex items-center justify-center py-1 px-4 rounded-md bg-kidney-green/20 text-kidney-green">
                    <Check className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Today's log complete!</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </form>
      
      {/* Visual feedback element */}
      <div className="absolute -bottom-3 left-0 w-full h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-kidney-blue via-kidney-purple to-kidney-yellow" 
          style={{ 
            width: `${(currentSection + 1) * 20}%`,
            transition: 'width 0.3s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default DailyLog;
