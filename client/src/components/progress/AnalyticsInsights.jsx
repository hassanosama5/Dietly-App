import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from 'recharts';

const AnalyticsInsights = ({ correlations, adherenceAnalytics }) => {
  if (!correlations?.hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Analytics & Insights</h3>
        <p className="text-gray-600">{correlations?.message || 'Insufficient data for correlation analysis. Complete at least one meal plan and log multiple weight entries.'}</p>
      </div>
    );
  }

  const { insights, summary, weeklyData } = correlations;

  // Prepare scatter plot data
  const scatterData = weeklyData.map(item => ({
    adherence: item.adherence,
    weightChange: Math.abs(item.weightChange),
    planName: item.planName,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800">{data.planName}</p>
          <p className="text-sm text-gray-600 mt-1">
            Adherence: <span className="font-bold">{data.adherence}%</span>
          </p>
          <p className="text-sm text-gray-600">
            Weight Change: <span className="font-bold">{data.weightChange}kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main Insight Card */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-3xl">💡</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Insight</h3>
            <p className="text-gray-700 text-base leading-relaxed">{summary.message}</p>
          </div>
        </div>
      </div>

      {/* Correlation Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Adherence vs. Weight Progress</h3>
        <p className="text-sm text-gray-600 mb-6">
          How your meal plan adherence impacts your weight goals
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* High Adherence */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-800">High Adherence</span>
              <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                85%+
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 mb-1">
              {Math.abs(insights.highAdherence.avgWeightChange)}kg
            </p>
            <p className="text-xs text-green-700">
              Average change across {insights.highAdherence.count} {insights.highAdherence.count === 1 ? 'period' : 'periods'}
            </p>
          </div>

          {/* Medium Adherence */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-800">Medium Adherence</span>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                70-84%
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mb-1">
              {Math.abs(insights.mediumAdherence.avgWeightChange)}kg
            </p>
            <p className="text-xs text-blue-700">
              Average change across {insights.mediumAdherence.count} {insights.mediumAdherence.count === 1 ? 'period' : 'periods'}
            </p>
          </div>

          {/* Low Adherence */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-orange-800">Low Adherence</span>
              <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                &lt;70%
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mb-1">
              {Math.abs(insights.lowAdherence.avgWeightChange)}kg
            </p>
            <p className="text-xs text-orange-700">
              Average change across {insights.lowAdherence.count} {insights.lowAdherence.count === 1 ? 'period' : 'periods'}
            </p>
          </div>
        </div>

        {/* Scatter Plot */}
        {weeklyData.length > 2 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Adherence vs Weight Change</h4>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  dataKey="adherence"
                  name="Adherence"
                  unit="%"
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Adherence %', position: 'insideBottom', offset: -10, style: { fill: '#6b7280', fontSize: 12 } }}
                />
                <YAxis
                  type="number"
                  dataKey="weightChange"
                  name="Weight Change"
                  unit="kg"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Weight Change (kg)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
                />
                <ZAxis range={[100, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Each dot represents a meal plan period. Higher adherence typically correlates with better results.
            </p>
          </div>
        )}
      </div>

      {/* Pattern Insights */}
      {adherenceAnalytics?.patterns && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Behavior Patterns</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Your Best Day</p>
                <p className="text-xs text-green-600 mt-1">{adherenceAnalytics.patterns.insight}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">{adherenceAnalytics.patterns.bestDay}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-orange-800">Challenging Day</p>
                <p className="text-xs text-orange-600 mt-1">Focus on improving consistency here</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-900">{adherenceAnalytics.patterns.worstDay}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>

        <div className="space-y-3">
          {insights.highAdherence.count > 0 && insights.lowAdherence.count > 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-sm font-medium text-blue-800">Consistency is Key</p>
                <p className="text-xs text-blue-600 mt-1">
                  Aim to maintain adherence above 85% for optimal results. Your data shows this makes a significant difference!
                </p>
              </div>
            </div>
          )}

          {adherenceAnalytics?.streaks?.current === 0 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-sm font-medium text-orange-800">Start a Streak</p>
                <p className="text-xs text-orange-600 mt-1">
                  Maintain 70%+ adherence for consecutive days to build momentum. Your longest streak was {adherenceAnalytics.streaks.longest} days!
                </p>
              </div>
            </div>
          )}

          {summary.avgAdherence < 70 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">Improve Adherence</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Your average adherence is {summary.avgAdherence}%. Try meal prepping or setting reminders to reach 70%+.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-sm font-medium text-green-800">Keep Tracking</p>
              <p className="text-xs text-green-600 mt-1">
                You've tracked {summary.totalPlans} meal {summary.totalPlans === 1 ? 'plan' : 'plans'}. More data = better insights!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInsights;
