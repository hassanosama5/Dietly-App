import React from 'react';

const GoalProgressCard = ({ goalProgress }) => {
  if (!goalProgress?.hasGoal) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Goal Progress</h3>
        <p className="text-gray-600">{goalProgress?.message || 'Set a target weight in your profile to track your goal progress.'}</p>
      </div>
    );
  }

  if (!goalProgress?.hasData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Goal Progress</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Target: {goalProgress.goal.targetWeight}kg</p>
        </div>
        <p className="text-gray-600">{goalProgress.message}</p>
      </div>
    );
  }

  const { goal, progress, projections, insights } = goalProgress;

  const getGoalEmoji = (healthGoal) => {
    switch (healthGoal) {
      case 'lose':
        return '📉';
      case 'gain':
        return '📈';
      case 'maintain':
        return '➡️';
      default:
        return '🎯';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = () => {
    if (progress.progressPercentage >= 75) return 'bg-green-600';
    if (progress.progressPercentage >= 50) return 'bg-blue-600';
    if (progress.progressPercentage >= 25) return 'bg-yellow-600';
    return 'bg-gray-400';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          {getGoalEmoji(goal.healthGoal)} Goal Progress
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          insights.isOnTrack ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {insights.isOnTrack ? 'On Track' : 'Needs Attention'}
        </span>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Start</p>
          <p className="text-2xl font-bold text-gray-800">{goal.startWeight}</p>
          <p className="text-xs text-gray-500">kg</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Current</p>
          <p className="text-2xl font-bold text-green-600">{goal.currentWeight}</p>
          <p className="text-xs text-gray-500">kg</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Target</p>
          <p className="text-2xl font-bold text-gray-800">{goal.targetWeight}</p>
          <p className="text-xs text-gray-500">kg</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-800">{progress.progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(progress.progressPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-600">
            {Math.abs(progress.totalChange)}kg {goal.healthGoal === 'lose' ? 'lost' : 'gained'}
          </span>
          <span className="text-xs text-gray-600">
            {Math.abs(progress.remainingChange)}kg to go
          </span>
        </div>
      </div>

      {/* Weekly Average */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Average Weekly Change</span>
          <span className="text-lg font-bold text-gray-800">
            {Math.abs(progress.avgWeeklyChange)}kg/week
          </span>
        </div>
      </div>

      {/* Projections */}
      {projections.optimistic && projections.realistic && projections.conservative && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Goal Date Projections</h4>

          <div className="space-y-3">
            {/* Optimistic */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-green-800">Optimistic</span>
                <span className="text-sm font-bold text-green-900">
                  {formatDate(projections.optimistic.estimatedDate)}
                </span>
              </div>
              <p className="text-xs text-green-700">{projections.optimistic.description}</p>
              <p className="text-xs text-green-600 mt-1">
                ~{projections.optimistic.weeksToGoal} weeks ({Math.abs(projections.optimistic.weeklyRate)}kg/week)
              </p>
            </div>

            {/* Realistic */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-800">Realistic</span>
                <span className="text-sm font-bold text-blue-900">
                  {formatDate(projections.realistic.estimatedDate)}
                </span>
              </div>
              <p className="text-xs text-blue-700">{projections.realistic.description}</p>
              <p className="text-xs text-blue-600 mt-1">
                ~{projections.realistic.weeksToGoal} weeks ({Math.abs(projections.realistic.weeklyRate)}kg/week)
              </p>
            </div>

            {/* Conservative */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-orange-800">Conservative</span>
                <span className="text-sm font-bold text-orange-900">
                  {formatDate(projections.conservative.estimatedDate)}
                </span>
              </div>
              <p className="text-xs text-orange-700">{projections.conservative.description}</p>
              <p className="text-xs text-orange-600 mt-1">
                ~{projections.conservative.weeksToGoal} weeks ({Math.abs(projections.conservative.weeklyRate)}kg/week)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insight Message */}
      <div className={`p-3 rounded-lg ${
        insights.isOnTrack
          ? 'bg-green-50 border border-green-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <p className={`text-sm ${
          insights.isOnTrack ? 'text-green-800' : 'text-yellow-800'
        }`}>
          {insights.message}
        </p>
      </div>
    </div>
  );
};

export default GoalProgressCard;
