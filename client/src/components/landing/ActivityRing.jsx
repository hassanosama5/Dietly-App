import React from "react";

const ActivityRing = ({ percentage, size = 120, strokeWidth = 8, color, label, value }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRing;
