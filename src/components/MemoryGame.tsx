
import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Gamepad, Trophy, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const EMOJI_CARDS = ["💊", "🥗", "😴", "🏃", "💧", "🩸", "🧠", "💪", "🌙", "🍎"];

interface Card {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryGame: React.FC = () => {
  const { points, setPoints } = useUser();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const initializeGame = () => {
    // Create pairs of cards
    const shuffledEmojis = [...EMOJI_CARDS, ...EMOJI_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        value: emoji,
        flipped: false,
        matched: false,
      }));

    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameCompleted(false);
    setTimer(0);
    
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const startGame = () => {
    initializeGame();
    setGameStarted(true);
    
    // Start timer
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  const handleCardClick = (cardId: number) => {
    if (
      flippedCards.length === 2 || // Block if two cards are already flipped
      flippedCards.includes(cardId) || // Block if card is already flipped
      cards[cardId].matched // Block if card is already matched
    ) {
      return;
    }

    // Flip the card
    const updatedCards = [...cards];
    updatedCards[cardId].flipped = true;
    setCards(updatedCards);

    // Add to flipped cards
    const updatedFlippedCards = [...flippedCards, cardId];
    setFlippedCards(updatedFlippedCards);

    // If two cards are flipped, check for match
    if (updatedFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstCardId, secondCardId] = updatedFlippedCards;
      
      if (cards[firstCardId].value === cards[secondCardId].value) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstCardId].matched = true;
          matchedCards[secondCardId].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setMatchedPairs(matchedPairs + 1);
          
          // Check if game is completed
          if (matchedPairs + 1 === EMOJI_CARDS.length) {
            completeGame();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const unmatchedCards = [...cards];
          unmatchedCards[firstCardId].flipped = false;
          unmatchedCards[secondCardId].flipped = false;
          setCards(unmatchedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const completeGame = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setGameCompleted(true);
    
    // Calculate points based on performance
    // Less moves and faster time = more points
    const timeBonus = Math.max(100 - timer, 0);
    const moveBonus = Math.max(100 - (moves * 5), 0);
    const earnedPoints = Math.floor((timeBonus + moveBonus) / 2);
    
    // Add points to user
    setPoints(points + earnedPoints);
    
    toast.success(`Game completed! You earned ${earnedPoints} points!`, {
      description: `Moves: ${moves} | Time: ${timer}s`,
    });
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-5 space-y-4 animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <Gamepad className="text-kidney-purple h-5 w-5" />
        <p className="text-sm font-medium uppercase text-muted-foreground">
          Memory Game
        </p>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center space-y-4 p-6">
          <Gamepad className="h-16 w-16 text-kidney-yellow animate-pulse" />
          <h3 className="text-xl font-bold text-center">Kidney Memory Challenge</h3>
          <p className="text-muted-foreground text-center">
            Match all pairs to earn bonus points! Test your memory and have fun!
          </p>
          <button
            onClick={startGame}
            className="glass-button px-6 py-2 mt-4 flex items-center gap-2"
          >
            <Gamepad className="h-4 w-4" />
            <span>Start Game</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-kidney-yellow" />
              <span>{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-kidney-purple" />
              <span>Moves: {moves}</span>
            </div>
            <button 
              onClick={startGame}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square flex items-center justify-center text-3xl rounded-lg cursor-pointer transition-all duration-300 transform ${
                  card.flipped || card.matched
                    ? "bg-primary/20 rotate-0 scale-100"
                    : "bg-secondary shadow-neon hover:shadow-neon-blue rotate-0 scale-100 hover:scale-105"
                } ${
                  card.matched ? "shadow-neon-green opacity-70" : ""
                }`}
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d",
                  transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                {(card.flipped || card.matched) && (
                  <div 
                    className={`transform ${card.matched ? "animate-pulse-slow" : "animate-fade-in"}`}
                  >
                    {card.value}
                  </div>
                )}
              </div>
            ))}
          </div>

          {gameCompleted && (
            <div className="mt-4 text-center p-4 rounded-lg bg-primary/20 border border-primary/30 animate-scale-up">
              <Trophy className="h-8 w-8 text-kidney-yellow mx-auto mb-2" />
              <h3 className="text-lg font-bold">You Win!</h3>
              <p className="text-sm text-muted-foreground">
                Completed in {moves} moves and {formatTime(timer)}
              </p>
              <button
                onClick={startGame}
                className="glass-button px-4 py-1 mt-3 text-sm flex items-center gap-1 mx-auto"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Play Again</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryGame;
