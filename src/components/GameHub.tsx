
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemoryGame from "./MemoryGame";
import SimonGame from "./SimonGame";
import WordGame from "./WordGame";
import { Brain, Music, BookOpenCheck } from "lucide-react";

const GameHub: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string>("memory");
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Game Center</h2>
        <p className="text-muted-foreground">Play games, earn points, stay healthy!</p>
      </div>
      
      <Tabs 
        value={activeGame} 
        onValueChange={setActiveGame}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md mx-auto bg-secondary/80 backdrop-blur-md border border-white/10 shadow-neon overflow-hidden">
          <TabsTrigger 
            value="memory" 
            className="text-sm flex items-center gap-1 relative overflow-hidden group"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Memory</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="simon" 
            className="text-sm flex items-center gap-1 relative overflow-hidden group"
          >
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">Simon</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="word" 
            className="text-sm flex items-center gap-1 relative overflow-hidden group"
          >
            <BookOpenCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Word</span>
            <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-0 group-data-[state=active]:translate-x-0 transition-transform duration-300 -z-10"></div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="memory" className="animate-scale-up">
          <MemoryGame />
        </TabsContent>
        
        <TabsContent value="simon" className="animate-scale-up">
          <SimonGame />
        </TabsContent>
        
        <TabsContent value="word" className="animate-scale-up">
          <WordGame />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameHub;
