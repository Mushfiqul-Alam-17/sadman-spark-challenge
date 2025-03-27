
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { Brain, Award, Clock, Sparkles } from "lucide-react";

// Health-related words for the game
const healthWords = [
  "kidney", "medicine", "health", "hydrate", "wellness", "exercise", 
  "strength", "nutrition", "vitamins", "protein", "fitness", "vegetables",
  "balance", "mineral", "calcium", "therapy", "recovery", "walking",
  "sleeping", "routine", "water", "posture", "breath", "mindful"
];

const WordGame: React.FC = () => {
  const { points, setPoints } = useUser();
  const [currentWord, setCurrentWord] = useState<string>("");
  const [scrambledWord, setScrambledWord] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem("wordGameHighScore");
    return saved ? parseInt(saved) : 0;
  });
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  
  // Get a random word and scramble it
  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * healthWords.length);
    const word = healthWords[randomIndex];
    setCurrentWord(word);
    
    // Scramble the word
    const scrambled = word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    
    setScrambledWord(scrambled);
    setUserInput("");
  };
  
  // Start a new game
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    getNewWord();
  };
  
  // Check user's answer
  const checkAnswer = () => {
    if (userInput.toLowerCase() === currentWord.toLowerCase()) {
      // Correct answer
      const newScore = score + 1 + streak;
      setScore(newScore);
      setStreak(streak + 1);
      
      // Visual feedback
      const feedback = streak > 2 ? 
        `Great! +${1 + streak} points (${streak}x streak)` : 
        "Correct!";
      
      toast.success(feedback, {
        icon: streak > 2 ? <Sparkles className="h-4 w-4" /> : undefined
      });
      
      // Award points for correct answers
      const pointsToAdd = Math.floor((1 + streak) * 2);
      setPoints(prevPoints => prevPoints + pointsToAdd);
      
      // Add time bonus for streak
      if (streak > 2) {
        setTimeLeft(prev => Math.min(prev + streak, 30));
      }
      
      // Move to next word
      getNewWord();
    } else {
      // Incorrect answer
      toast.error("Try again!");
      setStreak(0);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === "") return;
    checkAnswer();
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      
      // Update high score if needed
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("wordGameHighScore", score.toString());
        
        // Bonus points for beating high score
        const bonusPoints = score * 5;
        setPoints(prevPoints => prevPoints + bonusPoints);
        toast.success(`New high score! +${bonusPoints} bonus points!`);
      }
    }
    
    return () => clearInterval(timer);
  }, [timeLeft, gameActive, score, highScore, setPoints]);
  
  return (
    <div className="glass-card p-5 space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Word Unscramble</h2>
        <p className="text-muted-foreground">
          Unscramble health-related words before time runs out!
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Score</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Best</p>
          <p className="text-2xl font-bold">{highScore}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold">{streak > 0 ? `${streak}x` : "-"}</p>
        </div>
      </div>
      
      {gameActive && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Time left</span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {timeLeft}s
            </span>
          </div>
          <Progress value={(timeLeft / 30) * 100} className="h-2" />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {gameActive ? (
          <motion.div
            key="gameActive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-secondary/30 p-4 rounded-xl flex justify-center">
              <div className="flex space-x-2">
                {scrambledWord.split("").map((letter, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      rotate: Math.random() * 10 - 5
                    }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300
                    }}
                    className="w-8 h-10 bg-secondary flex items-center justify-center rounded-md text-xl font-bold uppercase"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your answer"
                className="glass-input text-center text-lg"
                autoFocus
              />
              
              <Button 
                type="submit" 
                className="w-full glass-button"
                disabled={userInput.trim() === ""}
              >
                <Brain className="mr-2 h-4 w-4" />
                Check Answer
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="gameInactive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center py-8"
          >
            {score > 0 && (
              <div className="mb-6 text-center">
                <p className="text-lg font-bold mb-1">Game Over!</p>
                <p className="text-kidney-yellow flex items-center justify-center">
                  <Award className="h-4 w-4 mr-1" />
                  Final Score: {score}
                </p>
                {score === highScore && score > 0 && (
                  <p className="text-kidney-purple text-sm mt-1">New Best Score!</p>
                )}
              </div>
            )}
            
            <Button 
              onClick={startGame} 
              className="glass-button"
              size="lg"
            >
              {score > 0 ? "Play Again" : "Start Game"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordGame;
