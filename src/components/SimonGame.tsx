
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { Play, Award, RefreshCw } from "lucide-react";

interface ColorButton {
  id: number;
  color: string;
  activeColor: string;
  soundFrequency: number;
}

const colorButtons: ColorButton[] = [
  { id: 0, color: "bg-kidney-red", activeColor: "bg-red-400", soundFrequency: 261.63 }, // C4
  { id: 1, color: "bg-kidney-blue", activeColor: "bg-blue-400", soundFrequency: 329.63 }, // E4
  { id: 2, color: "bg-kidney-yellow", activeColor: "bg-yellow-400", soundFrequency: 392.00 }, // G4
  { id: 3, color: "bg-kidney-green", activeColor: "bg-green-400", soundFrequency: 523.25 }, // C5
];

const SimonGame: React.FC = () => {
  const { points, setPoints } = useUser();
  const [sequence, setSequence] = useState<number[]>([]);
  const [playingSequence, setPlayingSequence] = useState<boolean>(false);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem("simonHighScore");
    return saved ? parseInt(saved) : 0;
  });
  const [activeButton, setActiveButton] = useState<number | null>(null);

  // Sound effect function
  const playSound = useCallback((frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.1;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, duration);
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  }, []);

  // Start a new game
  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setUserSequence([]);
    setGameActive(true);
    setGameOver(false);
    setScore(0);
    setPlayingSequence(true);
  };

  // Add to sequence and play it
  const extendSequence = useCallback(() => {
    const newSequence = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setUserSequence([]);
    setPlayingSequence(true);
  }, [sequence]);

  // Play the current sequence
  useEffect(() => {
    if (playingSequence && gameActive) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < sequence.length) {
          const button = sequence[index];
          setActiveButton(button);
          playSound(colorButtons[button].soundFrequency, 300);
          
          setTimeout(() => {
            setActiveButton(null);
          }, 300);
          
          index++;
        } else {
          clearInterval(interval);
          setPlayingSequence(false);
        }
      }, 600);
      
      return () => clearInterval(interval);
    }
  }, [playingSequence, sequence, gameActive, playSound]);

  // Handle user button clicks
  const handleButtonClick = (buttonId: number) => {
    if (!gameActive || playingSequence || gameOver) return;
    
    const updatedUserSequence = [...userSequence, buttonId];
    setUserSequence(updatedUserSequence);
    
    // Play sound and show animation
    setActiveButton(buttonId);
    playSound(colorButtons[buttonId].soundFrequency, 200);
    setTimeout(() => setActiveButton(null), 200);
    
    // Check if user pressed the correct button
    if (buttonId !== sequence[userSequence.length]) {
      setGameOver(true);
      setGameActive(false);
      toast.error("Game Over! Incorrect sequence.");
      return;
    }
    
    // Check if user completed the sequence
    if (updatedUserSequence.length === sequence.length) {
      const newScore = sequence.length;
      setScore(newScore);
      
      // Update high score if needed
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("simonHighScore", newScore.toString());
      }
      
      // Award points for completing a sequence
      if (newScore > 3) {
        const pointsEarned = Math.floor(newScore * 5);
        setPoints(prevPoints => prevPoints + pointsEarned);
        toast.success(`+${pointsEarned} points earned for reaching level ${newScore}!`);
      }
      
      // Move to next sequence after a delay
      setTimeout(() => {
        extendSequence();
      }, 1000);
    }
  };

  return (
    <div className="glass-card p-5 space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Simon Says</h2>
        <p className="text-muted-foreground">
          Watch the sequence and repeat it. Each successful round adds a new step!
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Level</p>
          <p className="text-2xl font-bold">{gameActive ? score : "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">High Score</p>
          <p className="text-2xl font-bold">{highScore}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 aspect-square">
        {colorButtons.map((btn) => (
          <motion.button
            key={btn.id}
            className={`rounded-xl ${activeButton === btn.id ? btn.activeColor : btn.color} shadow-md`}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(btn.id)}
            disabled={playingSequence || !gameActive || gameOver}
            animate={{ 
              scale: activeButton === btn.id ? 1.1 : 1,
              opacity: (!gameActive || gameOver) ? 0.7 : 1 
            }}
            transition={{ duration: 0.15 }}
          />
        ))}
      </div>
      
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          {!gameActive && !gameOver ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Button onClick={startGame} className="glass-button">
                <Play size={16} className="mr-2" />
                Start Game
              </Button>
            </motion.div>
          ) : gameOver ? (
            <motion.div
              key="retry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Button onClick={startGame} variant="outline" className="glass-button">
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <p className="text-sm font-medium mb-2">
                {playingSequence ? "Watch carefully..." : "Your turn!"}
              </p>
              {score >= 5 && (
                <p className="text-xs text-kidney-yellow flex items-center">
                  <Award size={12} className="mr-1" />
                  Earning points at this level!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SimonGame;
