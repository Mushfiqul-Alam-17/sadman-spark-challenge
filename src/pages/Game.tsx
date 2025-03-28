
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import GameHub from '@/components/GameHub';
import GameLeaderboard from '@/components/GameLeaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Gamepad } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const Game: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('play');
  const { name } = useUser();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 text-foreground pt-8 pb-16 px-4 md:px-8 max-w-6xl mx-auto relative">
      <AnimatedBackground />
      
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 glow-text">Game Center</h1>
        <p className="text-muted-foreground">Play games, earn points, track your progress</p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8 w-full max-w-md mx-auto bg-secondary/80 backdrop-blur-md border border-white/10 shadow-neon overflow-hidden">
          <TabsTrigger
            value="play"
            className="text-sm flex items-center gap-1 relative overflow-hidden group"
          >
            <Gamepad className="h-4 w-4" />
            <span>Play Games</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
          
          <TabsTrigger
            value="scores"
            className="text-sm flex items-center gap-1 relative overflow-hidden group"
          >
            <Trophy className="h-4 w-4" />
            <span>My Scores</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="play" className="animate-scale-up">
          <GameHub />
        </TabsContent>
        
        <TabsContent value="scores" className="animate-scale-up">
          <GameLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Game;
