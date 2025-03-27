
import React from "react";

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated circles */}
      <div 
        className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full bg-kidney-purple/5 blur-3xl"
        style={{
          animation: "pulse 15s ease-in-out infinite alternate",
        }}
      />
      <div 
        className="absolute bottom-1/3 left-1/4 w-96 h-96 rounded-full bg-kidney-blue/5 blur-3xl"
        style={{
          animation: "pulse 20s ease-in-out 2s infinite alternate",
        }}
      />
      <div 
        className="absolute top-2/3 right-1/4 w-72 h-72 rounded-full bg-kidney-yellow/5 blur-3xl"
        style={{
          animation: "pulse 18s ease-in-out 1s infinite alternate",
        }}
      />
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Fixed stars/particles */}
      <div className="fixed inset-0">
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 2 + 1;
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const animationDelay = Math.random() * 5;
          
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-70"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${top}%`,
                left: `${left}%`,
                animation: `twinkle 5s ease-in-out ${animationDelay}s infinite alternate`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedBackground;

// Adding keyframe animations to global styles in index.css
