import React from 'react';

const AdherenceCalendar = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Adherence Calendar</h3>
        <p className="text-gray-600">No adherence data available yet. Start logging meals!</p>
      </div>
    );
  }

  // Group data by weeks
  const getWeeksData = () => {
    const weeks = [];
    let currentWeek = [];

    dailyData.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();

      // Start new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);

      // Push last week
      if (index === dailyData.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  };

  const weeks = getWeeksData();

  const getAdherenceColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-700';
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-yellow-400';
    if (percentage >= 30) return 'bg-orange-400';
    if (percentage > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDayInitial = (date) => {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return dayNames[new Date(date).getDay()];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Adherence Calendar</h3>
      <p className="text-sm text-gray-600 mb-6">
        Track your daily meal plan adherence over time
      </p>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-2">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="group relative flex-1"
              >
                <div
                  className={`aspect-square rounded ${getAdherenceColor(day.adherencePercentage)} transition-transform hover:scale-110 cursor-pointer`}
                  title={`${formatDate(day.date)}: ${day.adherencePercentage}% adherence`}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-medium">
                    <span className="text-[10px] opacity-75">{getDayInitial(day.date)}</span>
                    <span>{day.adherencePercentage}%</span>
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                    <p className="font-semibold">{formatDate(day.date)}</p>
                    <p className="mt-1">Adherence: {day.adherencePercentage}%</p>
                    <p>Meals: {day.consumedMeals}/{day.totalMeals}</p>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-3">Adherence Level</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200"></div>
            <span className="text-xs text-gray-600">0%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-400"></div>
            <span className="text-xs text-gray-600">1-30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-400"></div>
            <span className="text-xs text-gray-600">30-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-xs text-gray-600">50-70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-xs text-gray-600">70-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span className="text-xs text-gray-600">80-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-700"></div>
            <span className="text-xs text-gray-600">90-100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdherenceCalendar;
