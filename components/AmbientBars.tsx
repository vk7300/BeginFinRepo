import React from 'react';

export const AmbientBars: React.FC = () => {
  return (
    <div className="absolute inset-0 flex justify-around opacity-40 pointer-events-none px-4">
      {[...Array(24)].map((_, i) => (
        <div 
          key={i} 
          className="w-1 md:w-1.5 bg-gradient-to-b from-transparent via-[#00FF00] to-transparent rounded-full"
          style={{
            height: `${50 + Math.random() * 40}%`,
            opacity: 0.1 + Math.random() * 0.4,
            animationName: 'ambient-float',
            animationDuration: `${4 + Math.random() * 8}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: `${i * -0.4}s`,
            top: `${Math.random() * 15}%`
          }}
        />
      ))}
      <style>{`
        @keyframes ambient-float {
          0% { transform: translateY(-100px) scaleY(0.7); opacity: 0.1; }
          50% { opacity: 0.9; }
          100% { transform: translateY(100px) scaleY(1.3); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};
