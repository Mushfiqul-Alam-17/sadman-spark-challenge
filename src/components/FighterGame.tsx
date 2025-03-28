
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { Sword, Shield, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveGameScore } from "@/lib/supabase";
import { toast } from "sonner";

interface Fighter {
  health: number;
  attack: number;
  defense: number;
  x: number;
  direction: 1 | -1;
  isAttacking: boolean;
  isBlocking: boolean;
}

const FighterGame: React.FC = () => {
  const { name, setPoints } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Fighter>({
    health: 100,
    attack: 15,
    defense: 5,
    x: 100,
    direction: 1,
    isAttacking: false,
    isBlocking: false
  });
  const enemyRef = useRef<Fighter>({
    health: 100,
    attack: 10,
    defense: 3,
    x: 300,
    direction: -1,
    isAttacking: false,
    isBlocking: false
  });
  const animationFrameRef = useRef<number>(0);
  const lastActionTimeRef = useRef<number>(0);
  
  // Start game
  const startGame = () => {
    if (gameOver) {
      // Reset game state
      setScore(0);
      setRound(1);
      setGameOver(false);
      setWinner(null);
    }
    
    setIsPlaying(true);
    setShowInstructions(false);
    
    resetFighters();
    
    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Reset fighters for a new round
  const resetFighters = () => {
    if (!gameAreaRef.current) return;
    
    const width = gameAreaRef.current.clientWidth;
    
    playerRef.current = {
      health: 100,
      attack: 15 + Math.floor(round / 2),
      defense: 5 + Math.floor(round / 3),
      x: width * 0.25,
      direction: 1,
      isAttacking: false,
      isBlocking: false
    };
    
    enemyRef.current = {
      health: 100 + round * 10,
      attack: 10 + round * 2,
      defense: 3 + round,
      x: width * 0.75,
      direction: -1,
      isAttacking: false,
      isBlocking: false
    };
  };
  
  // End game
  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameRef.current);
    
    // Add points to user account
    const gamePoints = score;
    setPoints(prev => prev + gamePoints);
    
    // Save score to Supabase
    try {
      await saveGameScore(name, 'fighter', score);
      toast.success(`Saved score: ${score} points!`);
    } catch (error) {
      console.error("Failed to save score:", error);
      toast.error("Failed to save your score");
    }
  };
  
  // Game loop
  const gameLoop = () => {
    if (!isPlaying) return;
    
    // Move characters
    updatePositions();
    
    // AI for enemy moves
    handleEnemyAI();
    
    // Check for round completion
    if (playerRef.current.health <= 0 || enemyRef.current.health <= 0) {
      if (playerRef.current.health <= 0) {
        setWinner("enemy");
        endGame();
      } else {
        setWinner("player");
        setScore(prev => prev + round * 100);
        setRound(prev => prev + 1);
        resetFighters();
      }
    }
    
    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Update fighter positions
  const updatePositions = () => {
    if (!gameAreaRef.current) return;
    
    const width = gameAreaRef.current.clientWidth;
    const playerSpeed = 3;
    const enemySpeed = 2;
    
    // Update player movement based on keys
    
    // Update enemy movement (AI controlled)
    const distanceToPlayer = Math.abs(enemyRef.current.x - playerRef.current.x);
    if (distanceToPlayer > 100 && !enemyRef.current.isAttacking) {
      // Move toward player
      if (enemyRef.current.x > playerRef.current.x) {
        enemyRef.current.x = Math.max(50, enemyRef.current.x - enemySpeed);
        enemyRef.current.direction = -1;
      } else {
        enemyRef.current.x = Math.min(width - 50, enemyRef.current.x + enemySpeed);
        enemyRef.current.direction = 1;
      }
    }
    
    // Reset attack animations after a short time
    if (playerRef.current.isAttacking && Date.now() - lastActionTimeRef.current > 300) {
      playerRef.current.isAttacking = false;
    }
    
    if (enemyRef.current.isAttacking && Date.now() - lastActionTimeRef.current > 300) {
      enemyRef.current.isAttacking = false;
    }
  };
  
  // Handle enemy AI
  const handleEnemyAI = () => {
    if (Date.now() - lastActionTimeRef.current < 1000) return;
    
    const distanceToPlayer = Math.abs(enemyRef.current.x - playerRef.current.x);
    
    // Random action based on distance
    if (distanceToPlayer < 100) {
      const action = Math.random();
      
      if (action < 0.6) {
        // Attack
        enemyAttack();
      } else if (action < 0.9) {
        // Block
        enemyRef.current.isBlocking = true;
        setTimeout(() => {
          enemyRef.current.isBlocking = false;
        }, 800);
      }
      
      lastActionTimeRef.current = Date.now();
    }
  };
  
  // Player attack
  const playerAttack = () => {
    if (!isPlaying || playerRef.current.isAttacking || playerRef.current.isBlocking) return;
    
    playerRef.current.isAttacking = true;
    lastActionTimeRef.current = Date.now();
    
    // Check if hit enemy
    const distanceToEnemy = Math.abs(playerRef.current.x - enemyRef.current.x);
    if (distanceToEnemy < 100) {
      // Calculate damage
      let damage = playerRef.current.attack;
      
      // Reduce damage if enemy is blocking
      if (enemyRef.current.isBlocking) {
        damage = Math.max(1, damage - enemyRef.current.defense);
      }
      
      // Apply damage
      enemyRef.current.health = Math.max(0, enemyRef.current.health - damage);
    }
  };
  
  // Enemy attack
  const enemyAttack = () => {
    if (!isPlaying || enemyRef.current.isAttacking || enemyRef.current.isBlocking) return;
    
    enemyRef.current.isAttacking = true;
    
    // Check if hit player
    const distanceToPlayer = Math.abs(enemyRef.current.x - playerRef.current.x);
    if (distanceToPlayer < 100) {
      // Calculate damage
      let damage = enemyRef.current.attack;
      
      // Reduce damage if player is blocking
      if (playerRef.current.isBlocking) {
        damage = Math.max(1, damage - playerRef.current.defense);
      }
      
      // Apply damage
      playerRef.current.health = Math.max(0, playerRef.current.health - damage);
    }
  };
  
  // Player block
  const playerBlock = () => {
    if (!isPlaying || playerRef.current.isAttacking || playerRef.current.isBlocking) return;
    
    playerRef.current.isBlocking = true;
    lastActionTimeRef.current = Date.now();
    
    // Auto release block after a time
    setTimeout(() => {
      playerRef.current.isBlocking = false;
    }, 800);
  };
  
  // Move player left
  const movePlayerLeft = () => {
    if (!isPlaying || !gameAreaRef.current) return;
    
    playerRef.current.x = Math.max(50, playerRef.current.x - 20);
    playerRef.current.direction = -1;
  };
  
  // Move player right
  const movePlayerRight = () => {
    if (!isPlaying || !gameAreaRef.current) return;
    
    const width = gameAreaRef.current.clientWidth;
    playerRef.current.x = Math.min(width - 50, playerRef.current.x + 20);
    playerRef.current.direction = 1;
  };
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          movePlayerLeft();
          break;
        case 'ArrowRight':
          movePlayerRight();
          break;
        case ' ':
          playerAttack();
          break;
        case 'Shift':
          playerBlock();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center space-x-2">
          <Sword className="h-5 w-5 text-kidney-purple animate-flame" />
          <h2 className="text-xl font-bold">Fighter Game</h2>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-kidney-yellow" />
            <span className="font-bold">{score}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-bold">Round {round}</span>
          </div>
        </div>
      </div>
      
      <div className="w-full flex justify-between mb-2">
        <div className="w-1/2 pr-2">
          <div className="flex items-center mb-1">
            <Heart className="h-4 w-4 text-kidney-red mr-2" />
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-kidney-red h-4 rounded-full transition-all duration-200"
                style={{ width: `${playerRef.current.health}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Player</span>
            <span>{playerRef.current.health}/100</span>
          </div>
        </div>
        
        <div className="w-1/2 pl-2">
          <div className="flex items-center mb-1">
            <Heart className="h-4 w-4 text-kidney-purple mr-2" />
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-kidney-purple h-4 rounded-full transition-all duration-200"
                style={{ width: `${enemyRef.current.health}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Enemy</span>
            <span>{enemyRef.current.health}/{100 + round * 10}</span>
          </div>
        </div>
      </div>
      
      <div
        ref={gameAreaRef}
        className="relative w-full aspect-[16/9] max-w-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 rounded-lg shadow-neon"
      >
        {!isPlaying && !gameOver && showInstructions && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
            <h3 className="text-xl font-bold mb-4">Fighter Game</h3>
            <p className="mb-6">
              Use the arrow keys to move, space to attack, and shift to block. 
              Defeat all enemies to advance to the next round with stronger opponents!
            </p>
            <Button variant="default" size="lg" onClick={startGame}>
              Start Game
            </Button>
          </div>
        )}
        
        {!isPlaying && gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
            <h3 className="text-xl font-bold mb-2">Game Over</h3>
            <p className="mb-1">Your score: {score}</p>
            <p className="mb-1">Rounds completed: {round - 1}</p>
            <p className="mb-6">Points earned: {score}</p>
            <Button variant="default" size="lg" onClick={startGame}>
              Play Again
            </Button>
          </div>
        )}
        
        {isPlaying && (
          <>
            {/* Player */}
            <div
              className={`absolute bottom-20 flex flex-col items-center transition-all duration-100 ${
                playerRef.current.isAttacking ? 'animate-pulse-slow' : ''
              }`}
              style={{
                left: `${playerRef.current.x}px`,
                transform: `scaleX(${playerRef.current.direction})`,
              }}
            >
              {playerRef.current.isBlocking && (
                <Shield className="absolute -left-4 -top-4 h-6 w-6 text-kidney-blue animate-pulse-slow" />
              )}
              <div className="h-24 w-16 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-kidney-blue shadow-neon-blue mb-2"></div>
                <div className="h-16 w-8 bg-kidney-blue rounded-sm shadow-neon-blue"></div>
              </div>
              {playerRef.current.isAttacking && (
                <Sword className="absolute -right-8 top-4 h-8 w-8 text-kidney-yellow rotate-45" />
              )}
            </div>
            
            {/* Enemy */}
            <div
              className={`absolute bottom-20 flex flex-col items-center transition-all duration-100 ${
                enemyRef.current.isAttacking ? 'animate-pulse-slow' : ''
              }`}
              style={{
                left: `${enemyRef.current.x}px`,
                transform: `scaleX(${enemyRef.current.direction})`,
              }}
            >
              {enemyRef.current.isBlocking && (
                <Shield className="absolute -left-4 -top-4 h-6 w-6 text-kidney-purple animate-pulse-slow" />
              )}
              <div className="h-24 w-16 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-kidney-purple shadow-neon-purple mb-2"></div>
                <div className="h-16 w-8 bg-kidney-purple rounded-sm shadow-neon-purple"></div>
              </div>
              {enemyRef.current.isAttacking && (
                <Sword className="absolute -right-8 top-4 h-8 w-8 text-kidney-yellow rotate-45" />
              )}
            </div>
            
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-900/50"></div>
          </>
        )}
      </div>
      
      {isPlaying && (
        <div className="grid grid-cols-3 gap-2 mt-4 w-full max-w-md">
          <Button variant="outline" onClick={movePlayerLeft}>
            ← Move
          </Button>
          <Button variant="default" onClick={playerAttack}>
            <Sword className="h-4 w-4 mr-1" /> Attack
          </Button>
          <Button variant="outline" onClick={movePlayerRight}>
            Move →
          </Button>
          <Button variant="secondary" className="col-span-3" onClick={playerBlock}>
            <Shield className="h-4 w-4 mr-1" /> Block
          </Button>
        </div>
      )}
    </div>
  );
};

export default FighterGame;
