
import React, { useState, useEffect } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import DailyLog from "@/components/DailyLog";
import StatsCard from "@/components/StatsCard";
import ChallengeCard from "@/components/ChallengeCard";
import AIInsights from "@/components/AIInsights";
import GameHub from "@/components/GameHub";
import AnimatedBackground from "@/components/AnimatedBackground";
import { challenges, getChallengeInfo } from "@/utils/challenges";
import { Toaster } from "@/components/ui/sonner";
import { Sparkles, Brain, LineChart, Zap, Gamepad } from "lucide-react";

// Main page content
const MainContent = () => {
  const { currentChallenge, completedChallenges, calculateProgressPercentage } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Get active challenge info
  const activeChallenge = currentChallenge ? getChallengeInfo(currentChallenge) : null;
  const activeProgress = currentChallenge ? calculateProgressPercentage() : 0;
  
  useEffect(() => {
    // Trigger page load animation
    setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 text-foreground pt-8 pb-16 px-4 md:px-8 max-w-6xl mx-auto relative">
      {/* Animated background */}
      <AnimatedBackground />
      
      <header className={`mb-8 transition-all duration-700 transform ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 glow-text flex items-center">
              Sadman's Kidney Fight
              <Zap className="h-6 w-6 ml-2 text-kidney-yellow animate-flame" />
            </h1>
            <p className="text-muted-foreground">Your health journey, one day at a time</p>
          </div>
        </div>
      </header>
      
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className={`transition-all duration-700 delay-300 transform ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      >
        <TabsList className="grid grid-cols-5 mb-8 w-full max-w-xl mx-auto bg-secondary/80 backdrop-blur-md border border-white/10 shadow-neon overflow-hidden">
          <TabsTrigger 
            value="dashboard" 
            className="text-sm md:text-base flex items-center gap-1 relative overflow-hidden group"
          >
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="log" 
            className="text-sm md:text-base flex items-center gap-1 relative overflow-hidden group"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Daily Log</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="insights" 
            className="text-sm md:text-base flex items-center gap-1 relative overflow-hidden group"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Insights</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="game" 
            className="text-sm md:text-base flex items-center gap-1 relative overflow-hidden group"
          >
            <Gamepad className="h-4 w-4" />
            <span className="hidden sm:inline">Games</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="challenges" 
            className="text-sm md:text-base flex items-center gap-1 relative overflow-hidden group"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6 animate-scale-up">
          <Dashboard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard />
            <AIInsights />
          </div>
        </TabsContent>
        
        <TabsContent value="log" className="animate-scale-up">
          <div className="max-w-md mx-auto">
            <DailyLog />
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="animate-scale-up">
          <div className="max-w-md mx-auto">
            <AIInsights />
          </div>
        </TabsContent>
        
        <TabsContent value="game" className="animate-scale-up">
          <GameHub />
        </TabsContent>
        
        <TabsContent value="challenges" className="animate-scale-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 7-day challenge */}
            <ChallengeCard 
              challenge={challenges["7day"]}
              isActive={currentChallenge === "7day"}
              isCompleted={completedChallenges.includes("7day")}
              progress={currentChallenge === "7day" ? activeProgress : 100}
            />
            
            {/* 14-day challenge */}
            <ChallengeCard 
              challenge={challenges["14day"]}
              isActive={currentChallenge === "14day"}
              isCompleted={completedChallenges.includes("14day")}
              isLocked={!completedChallenges.includes("7day")}
              progress={currentChallenge === "14day" ? activeProgress : 100}
            />
            
            {/* 30-day challenge */}
            <ChallengeCard 
              challenge={challenges["30day"]}
              isActive={currentChallenge === "30day"}
              isCompleted={completedChallenges.includes("30day")}
              isLocked={!completedChallenges.includes("14day")}
              progress={currentChallenge === "30day" ? activeProgress : 100}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main page with provider
const Index = () => {
  return (
    <UserProvider>
      <MainContent />
      <Toaster position="top-center" />
    </UserProvider>
  );
};

export default Index;
