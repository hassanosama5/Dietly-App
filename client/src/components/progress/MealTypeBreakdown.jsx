import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const MealTypeBreakdown = ({ mealTypeStats }) => {
  if (!mealTypeStats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Meal Type Breakdown</h3>
        <p className="text-gray-600">No meal data available yet.</p>
      </div>
    );
  }

  // Transform data for chart
  const chartData = [
    {
      name: 'Breakfast',
      adherence: mealTypeStats.breakfast.percentage,
      consumed: mealTypeStats.breakfast.consumed,
      total: mealTypeStats.breakfast.total,
    },
    {
      name: 'Lunch',
      adherence: mealTypeStats.lunch.percentage,
      consumed: mealTypeStats.lunch.consumed,
      total: mealTypeStats.lunch.total,
    },
    {
      name: 'Dinner',
      adherence: mealTypeStats.dinner.percentage,
      consumed: mealTypeStats.dinner.consumed,
      total: mealTypeStats.dinner.total,
    },
    {
      name: 'Snacks',
      adherence: mealTypeStats.snacks.percentage,
      consumed: mealTypeStats.snacks.consumed,
      total: mealTypeStats.snacks.total,
    },
  ];

  // Colors for bars based on adherence
  const getBarColor = (value) => {
    if (value >= 85) return '#10b981'; // green-500
    if (value >= 70) return '#3b82f6'; // blue-500
    if (value >= 50) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            Adherence: <span className="font-bold">{data.adherence}%</span>
          </p>
          <p className="text-xs text-gray-500">
            {data.consumed} of {data.total} meals consumed
          </p>
        </div>
      );
    }
    return null;
  };

  // Get emoji for meal type
  const getMealEmoji = (mealType) => {
    switch (mealType) {
      case 'Breakfast':
        return '🥐';
      case 'Lunch':
        return '🍱';
      case 'Dinner':
        return '🍽️';
      case 'Snacks':
        return '🍿';
      default:
        return '';
    }
  };

  // Find best and worst performing meal type
  const sortedMeals = [...chartData].sort((a, b) => b.adherence - a.adherence);
  const bestMeal = sortedMeals[0];
  const worstMeal = sortedMeals[sortedMeals.length - 1];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Meal Type Breakdown</h3>
      <p className="text-sm text-gray-600 mb-6">
        Compare adherence across different meal types
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[0, 100]}
            label={{ value: 'Adherence %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="adherence"
            radius={[8, 8, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.adherence)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {chartData.map((meal) => (
          <div key={meal.name} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-1">{getMealEmoji(meal.name)}</div>
            <p className="text-xs text-gray-600 mb-1">{meal.name}</p>
            <p className="text-2xl font-bold text-gray-800">{meal.adherence}%</p>
            <p className="text-xs text-gray-500">{meal.consumed}/{meal.total}</p>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getMealEmoji(bestMeal.name)}</span>
            <div>
              <p className="text-sm font-medium text-green-800">Best Performance</p>
              <p className="text-xs text-green-600">{bestMeal.name}</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-green-700">{bestMeal.adherence}%</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getMealEmoji(worstMeal.name)}</span>
            <div>
              <p className="text-sm font-medium text-orange-800">Needs Improvement</p>
              <p className="text-xs text-orange-600">{worstMeal.name}</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-orange-700">{worstMeal.adherence}%</span>
        </div>
      </div>

      {/* Recommendation */}
      {worstMeal.adherence < 70 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <span className="font-medium">Tip:</span> Try setting reminders or preparing {worstMeal.name.toLowerCase()} in advance to improve adherence!
          </p>
        </div>
      )}
    </div>
  );
};

export default MealTypeBreakdown;
