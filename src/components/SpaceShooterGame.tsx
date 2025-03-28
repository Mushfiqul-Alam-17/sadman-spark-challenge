
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { Rocket, Star, ShieldAlert, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveGameScore } from "@/lib/supabase";
import { toast } from "sonner";

interface Spaceship {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Projectile {
  x: number;
  y: number;
  speed: number;
}

interface Enemy {
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
}

const SpaceShooterGame: React.FC = () => {
  const { name, setPoints } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<Spaceship>({
    x: 0,
    y: 0,
    width: 40,
    height: 40
  });
  const projectilesRef = useRef<Projectile[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const lastShotTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  // Start game
  const startGame = () => {
    if (gameOver) {
      // Reset game state
      setScore(0);
      setLives(3);
      setGameOver(false);
      projectilesRef.current = [];
      enemiesRef.current = [];
    }
    
    setIsPlaying(true);
    setShowInstructions(false);
    
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      shipRef.current = {
        x: rect.width / 2 - 20,
        y: rect.height - 60,
        width: 40,
        height: 40
      };
    }
    
    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // End game
  const endGame = async () => {
    setIsPlaying(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameRef.current);
    
    // Add points to user account
    const gamePoints = Math.floor(score / 10);
    setPoints(prev => prev + gamePoints);
    
    // Save score to Supabase
    try {
      await saveGameScore(name, 'space-shooter', score);
      toast.success(`Saved score: ${score} points!`);
    } catch (error) {
      console.error("Failed to save score:", error);
      toast.error("Failed to save your score");
    }
  };
  
  // Game loop
  const gameLoop = () => {
    if (!isPlaying || !gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    
    // Move projectiles
    projectilesRef.current = projectilesRef.current
      .filter(projectile => projectile.y > 0)
      .map(projectile => ({
        ...projectile,
        y: projectile.y - projectile.speed
      }));
    
    // Move enemies
    enemiesRef.current = enemiesRef.current
      .filter(enemy => enemy.y < gameArea.height)
      .map(enemy => ({
        ...enemy,
        y: enemy.y + enemy.speed
      }));
    
    // Spawn new enemies
    if (Math.random() < 0.02 + (score / 10000)) {
      const newEnemy: Enemy = {
        x: Math.random() * (gameArea.width - 30),
        y: -30,
        speed: 2 + Math.random() * 3,
        width: 30,
        height: 30
      };
      enemiesRef.current.push(newEnemy);
    }
    
    // Check collisions
    projectilesRef.current.forEach((projectile, pIndex) => {
      enemiesRef.current.forEach((enemy, eIndex) => {
        if (
          projectile.x >= enemy.x &&
          projectile.x <= enemy.x + enemy.width &&
          projectile.y >= enemy.y &&
          projectile.y <= enemy.y + enemy.height
        ) {
          // Remove projectile and enemy
          projectilesRef.current.splice(pIndex, 1);
          enemiesRef.current.splice(eIndex, 1);
          
          // Increase score
          setScore(prevScore => prevScore + 10);
        }
      });
    });
    
    // Check if enemies hit player
    enemiesRef.current.forEach((enemy, index) => {
      if (
        enemy.y + enemy.height >= shipRef.current.y &&
        enemy.x + enemy.width >= shipRef.current.x &&
        enemy.x <= shipRef.current.x + shipRef.current.width
      ) {
        // Remove enemy
        enemiesRef.current.splice(index, 1);
        
        // Decrease lives
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            endGame();
          }
          return newLives;
        });
      }
    });
    
    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Shoot
  const shoot = () => {
    if (!isPlaying) return;
    
    const now = Date.now();
    if (now - lastShotTimeRef.current < 300) return; // Limit firing rate
    
    lastShotTimeRef.current = now;
    
    const newProjectile: Projectile = {
      x: shipRef.current.x + shipRef.current.width / 2,
      y: shipRef.current.y,
      speed: 8
    };
    
    projectilesRef.current.push(newProjectile);
  };
  
  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPlaying || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    shipRef.current.x = Math.max(
      0,
      Math.min(
        rect.width - shipRef.current.width,
        e.clientX - rect.left
      )
    );
  };
  
  // Touch move handler
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPlaying || !gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    shipRef.current.x = Math.max(
      0,
      Math.min(
        rect.width - shipRef.current.width,
        touch.clientX - rect.left
      )
    );
  };
  
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
          <Rocket className="h-5 w-5 text-kidney-yellow animate-flame" />
          <h2 className="text-xl font-bold">Space Shooter</h2>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-kidney-yellow" />
            <span className="font-bold">{score}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-kidney-red" />
            <span className="font-bold">{lives}</span>
          </div>
        </div>
      </div>
      
      <div
        ref={gameAreaRef}
        className="relative w-full aspect-[4/3] max-w-2xl overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 rounded-lg shadow-neon"
        onClick={shoot}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {!isPlaying && !gameOver && showInstructions && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/50">
            <h3 className="text-xl font-bold mb-4">Space Shooter</h3>
            <p className="mb-6">
              Move your ship with the mouse or touch. Click or tap to shoot. Destroy
              enemy ships and survive as long as possible!
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
            <p className="mb-6">Points earned: {Math.floor(score / 10)}</p>
            <Button variant="default" size="lg" onClick={startGame}>
              Play Again
            </Button>
          </div>
        )}
        
        {isPlaying && (
          <>
            {/* Render player ship */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: `${shipRef.current.x}px`,
                top: `${shipRef.current.y}px`,
                width: `${shipRef.current.width}px`,
                height: `${shipRef.current.height}px`,
              }}
            >
              <Rocket className="h-10 w-10 text-kidney-blue rotate-180" />
            </div>
            
            {/* Render projectiles */}
            {projectilesRef.current.map((projectile, index) => (
              <div
                key={`projectile-${index}`}
                className="absolute w-2 h-6 bg-kidney-yellow rounded-full"
                style={{
                  left: `${projectile.x - 1}px`,
                  top: `${projectile.y}px`,
                }}
              />
            ))}
            
            {/* Render enemies */}
            {enemiesRef.current.map((enemy, index) => (
              <div
                key={`enemy-${index}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${enemy.x}px`,
                  top: `${enemy.y}px`,
                  width: `${enemy.width}px`,
                  height: `${enemy.height}px`,
                }}
              >
                <Rocket className="h-8 w-8 text-kidney-red" />
              </div>
            ))}
          </>
        )}
      </div>
      
      {isPlaying && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => {
            setIsPlaying(false);
            setShowInstructions(true);
            cancelAnimationFrame(animationFrameRef.current);
          }}
        >
          <Settings className="h-4 w-4 mr-2" />
          Pause Game
        </Button>
      )}
    </div>
  );
};

export default SpaceShooterGame;
