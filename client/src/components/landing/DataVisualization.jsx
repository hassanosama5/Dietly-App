import React from "react";

const DataVisualization = ({ current, target, metric, label }) => {
  const isAtGoal = current === target;
  const percentage = (current / target) * 100;

  return (
    <div className="relative">
      {/* Circular Progress */}
      <div className="relative w-40 h-40 mx-auto">
        <svg className="transform -rotate-90 w-40 h-40">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
            className="transition-all duration-1000"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isAtGoal ? (
            <div className="text-green-400 text-4xl mb-1">✓</div>
          ) : (
            <div className="text-3xl font-bold text-white">{current}</div>
          )}
          <div className="text-xs text-gray-400 uppercase tracking-wider">{metric}</div>
        </div>
      </div>

      {/* Label */}
      <p className="text-center text-gray-300 mt-4 font-medium">{label}</p>
      
      {isAtGoal && (
        <p className="text-center text-green-400 text-sm mt-1">You're at your goal!</p>
      )}
    </div>
  );
};

export default DataVisualization;