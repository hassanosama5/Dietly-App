import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-[#1A1A1A] border border-white/[0.05] rounded-2xl p-8 hover:border-[#00D1FF]/30 transition-all duration-300 h-full">
      {/* Icon */}
      <div className="w-16 h-16 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center mb-6">
        <span className="text-4xl">{icon}</span>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      
      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
