import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="group relative overflow-hidden">
      {/* Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-600/0 group-hover:from-cyan-500/5 group-hover:to-blue-600/5 transition-all duration-500 rounded-3xl"></div>
      
      {/* Card Content */}
      <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-3xl p-8 h-full hover:border-cyan-500/30 transition-all duration-300">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <span className="text-4xl">{icon}</span>
        </div>
        
        {/* Text */}
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;