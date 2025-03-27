
import React, { useEffect, useRef } from "react";

interface LivePulseProps {
  color?: string;
  size?: "sm" | "md" | "lg";
  intensity?: "low" | "medium" | "high";
}

const LivePulse: React.FC<LivePulseProps> = ({ 
  color = "#7209B7", 
  size = "md", 
  intensity = "medium" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Set canvas size based on prop
  const getCanvasSize = () => {
    switch (size) {
      case "sm": return 60;
      case "lg": return 140;
      default: return 100;
    }
  };
  
  // Set pulse intensity
  const getPulseIntensity = () => {
    switch (intensity) {
      case "low": return 0.5;
      case "high": return 2;
      default: return 1;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const canvasSize = getCanvasSize();
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const maxRadius = canvasSize / 2.5;
    
    const intensityFactor = getPulseIntensity();
    
    let phase = 0;
    let animationFrameId: number;
    
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      // Create heartbeat line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      for (let x = 0; x < canvasSize; x++) {
        const normalized = x / canvasSize;
        
        // Create a heartbeat-like pattern
        let y = centerY;
        
        if (normalized > 0.3 && normalized < 0.7) {
          const pulsePhase = normalized * 10 + phase;
          const pulseHeight = Math.sin(pulsePhase) * 15 * intensityFactor;
          
          // Add a spike for the heartbeat
          if (normalized > 0.45 && normalized < 0.55) {
            const spikeIntensity = (1 - Math.abs((normalized - 0.5) * 20)) * 25 * intensityFactor;
            y += pulseHeight - spikeIntensity;
          } else {
            y += pulseHeight;
          }
        }
        
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvasSize, centerY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Create pulsing circle
      const pulseSize = (Math.sin(phase * 2) * 0.2 + 0.8) * maxRadius;
      const glowSize = (Math.sin(phase * 2) * 0.3 + 0.7) * maxRadius;
      
      // Outer glow
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowSize * 1.5
      );
      gradient.addColorStop(0, `${color}40`);
      gradient.addColorStop(1, "transparent");
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Main circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = `${color}20`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      
      // Update phase
      phase += 0.05;
      
      // Request next frame
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, size, intensity]);

  return (
    <canvas 
      ref={canvasRef} 
      className="mx-auto animate-pulse-slow"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
};

export default LivePulse;
