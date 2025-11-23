import React from "react";

const ProcessStep = ({ number, title, description, isLast }) => {
  return (
    <div className="relative flex-1">
      {/* Connecting Line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
      )}
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Number Circle */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/50">
          <span className="text-2xl font-bold text-white">{number}</span>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 max-w-xs">{description}</p>
      </div>
    </div>
  );
};

export default ProcessStep;
