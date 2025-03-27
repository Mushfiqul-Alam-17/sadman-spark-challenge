
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Brain, Trophy, Timer, RotateCcw } from "lucide-react";

type MemoryCard = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

const MemoryGame: React.FC = () => {
  const { points } = useUser();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCount, setFlippedCount] = useState(0);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Possible emojis for memory cards
  const emojis = ["🧠", "💊", "💧", "🍎", "🏃", "💤", "🩸", "❤️", "🥦", "🏆"];

  // Initialize game
  const initializeGame = () => {
    // Create card pairs
    const cardValues = [...emojis.slice(0, 5), ...emojis.slice(0, 5)];
    
    // Shuffle cards
    const shuffledCards = cardValues
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedCount(0);
    setFlippedIndexes([]);
    setMoves(0);
    setGameOver(false);
    setTimeElapsed(0);
    
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };

  // Start game and timer
  const startGame = () => {
    initializeGame();
    setGameStarted(true);
    
    // Start timer
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  // Handle card flip
  const handleCardClick = (index: number) => {
    // Prevent clicking if two cards are already flipped or the clicked card is already flipped/matched
    if (flippedCount === 2 || cards[index].flipped || cards[index].matched) {
      return;
    }

    // Flip the card
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);
    
    // Track flipped cards
    const newFlippedIndexes = [...flippedIndexes, index];
    setFlippedIndexes(newFlippedIndexes);
    setFlippedCount(flippedCount + 1);
    
    // Check for match when two cards are flipped
    if (newFlippedIndexes.length === 2) {
      setMoves(moves + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndexes;
      
      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].matched = true;
          matchedCards[secondIndex].matched = true;
          setCards(matchedCards);
          setFlippedCount(0);
          setFlippedIndexes([]);
          
          // Check if all cards are matched
          if (matchedCards.every(card => card.matched)) {
            endGame();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].flipped = false;
          resetCards[secondIndex].flipped = false;
          setCards(resetCards);
          setFlippedCount(0);
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  };

  // End game
  const endGame = () => {
    setGameOver(true);
    
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Calculate score based on moves and time
    const basePoints = 100;
    const movesPenalty = moves * 5;
    const timePenalty = Math.floor(timeElapsed / 5);
    const finalScore = Math.max(basePoints - movesPenalty - timePenalty, 10);
    
    // Show completion message
    toast.success(`Game Complete! +${finalScore} points`, {
      description: `You completed the game in ${moves} moves and ${timeElapsed} seconds!`,
    });
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    initializeGame();
    
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden border border-kidney-blue/30 shadow-neon-blue">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kidney-blue via-kidney-purple to-kidney-green"></div>
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-kidney-yellow animate-pulse"></div>
      
      <div className="mb-4">
        <p className="text-sm font-medium uppercase text-kidney-blue mb-1">
          Brain Training
        </p>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Brain className="h-5 w-5 text-kidney-purple" /> Memory Challenge
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Exercise your brain and earn bonus points
        </p>
      </div>
      
      {!gameStarted ? (
        <div className="flex flex-col items-center justify-center py-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 text-center"
          >
            <p className="text-lg mb-2">Ready to test your memory?</p>
            <p className="text-sm text-muted-foreground">Match all the pairs with the fewest moves!</p>
          </motion.div>
          
          <Button 
            onClick={startGame}
            className="glass-button font-medium px-8 py-6 text-lg"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <>
          {/* Game stats */}
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-kidney-yellow" />
              <span>Moves: {moves}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-kidney-blue" />
              <span>Time: {formatTime(timeElapsed)}</span>
            </div>
          </div>
          
          {/* Memory card grid */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ rotateY: 0 }}
                animate={{ 
                  rotateY: card.flipped ? 180 : 0,
                  scale: card.matched ? 0.95 : 1,
                }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: card.flipped || card.matched ? 1 : 1.05 }}
                onClick={() => handleCardClick(index)}
                className={`aspect-square cursor-pointer perspective-1000 ${
                  card.matched ? "opacity-50" : ""
                }`}
              >
                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d`}>
                  {/* Card back */}
                  <div className={`absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-kidney-purple/80 to-kidney-blue/80 backface-hidden ${
                    card.flipped ? "hidden" : ""
                  }`}>
                    <span className="text-xl">?</span>
                  </div>
                  
                  {/* Card front */}
                  <div className={`absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-secondary/20 border border-white/10 backface-hidden rotate-y-180 ${
                    card.flipped ? "" : "hidden"
                  }`}>
                    <span className="text-2xl">{card.value}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Game controls */}
          <div className="flex justify-center mt-4">
            <Button 
              onClick={resetGame} 
              variant="outline" 
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" /> Reset Game
            </Button>
          </div>
          
          {/* Game over message */}
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-kidney-green/20 text-kidney-green text-center"
            >
              <p className="font-medium">Congratulations! 🎉</p>
              <p className="text-sm">All matches found in {moves} moves!</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryGame;
