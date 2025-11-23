import React from "react";

const StatCard = ({ icon, label, value, color, trend }) => {
  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Background Decoration */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5"
        style={{ backgroundColor: color }}
      ></div>

      <div className="relative">
        {/* Icon */}
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-500">{label}</p>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div className="mt-3 flex items-center text-xs">
            <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
            <span className="text-gray-400 ml-1">vs last week</span>
          </div>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
};

export default StatCard;
