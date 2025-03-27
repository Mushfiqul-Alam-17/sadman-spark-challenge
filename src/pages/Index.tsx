
import React, { useState } from "react";
import { UserProvider, useUser } from "@/context/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import DailyLog from "@/components/DailyLog";
import StatsCard from "@/components/StatsCard";
import ChallengeCard from "@/components/ChallengeCard";
import { challenges, getChallengeInfo } from "@/utils/challenges";
import { Toaster } from "@/components/ui/sonner";

// Main page content
const MainContent = () => {
  const { currentChallenge, completedChallenges, calculateProgressPercentage } = useUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Get active challenge info
  const activeChallenge = currentChallenge ? getChallengeInfo(currentChallenge) : null;
  const activeProgress = currentChallenge ? calculateProgressPercentage() : 0;
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      <header className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 glow-text">Sadman's Kidney Fight</h1>
            <p className="text-muted-foreground">Your health journey, one day at a time</p>
          </div>
        </div>
      </header>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
        <TabsList className="grid grid-cols-3 mb-8 w-full max-w-md mx-auto">
          <TabsTrigger value="dashboard" className="text-sm md:text-base">Dashboard</TabsTrigger>
          <TabsTrigger value="log" className="text-sm md:text-base">Daily Log</TabsTrigger>
          <TabsTrigger value="challenges" className="text-sm md:text-base">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6 animate-scale-up">
          <Dashboard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard />
            <DailyLog />
          </div>
        </TabsContent>
        
        <TabsContent value="log" className="animate-scale-up">
          <div className="max-w-md mx-auto">
            <DailyLog />
          </div>
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
