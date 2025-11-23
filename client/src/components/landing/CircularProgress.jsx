import React from "react";

const CircularProgress = ({ value, label, isGoalAchieved }) => {
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = isGoalAchieved ? 100 : 80;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D1FF" />
              <stop offset="100%" stopColor="#00A3FF" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white mb-1">{value}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">{label}</div>
        </div>
      </div>
      
      {isGoalAchieved && (
        <div className="mt-6 px-6 py-3 bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-full">
          <span className="text-[#00D1FF] font-semibold text-sm">✓ Goal Achieved</span>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
