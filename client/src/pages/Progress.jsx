import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import ProgressTracker from '../components/progress/ProgressTracker';
import WeightEntryModal from '../components/progress/WeightEntryModal';
import GoalProgressCard from '../components/progress/GoalProgressCard';
import AdherenceCalendar from '../components/progress/AdherenceCalendar';
import MealTypeBreakdown from '../components/progress/MealTypeBreakdown';
import AnalyticsInsights from '../components/progress/AnalyticsInsights';

const AccordionSection = ({ title, isOpen, onToggle, children, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};

const Progress = () => {
  const [openSections, setOpenSections] = useState({
    weight: true,
    adherence: false,
    analytics: false,
  });

  const [weighInStatus, setWeighInStatus] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [adherenceAnalytics, setAdherenceAnalytics] = useState(null);
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [weighInRes, goalRes, adherenceRes, correlationRes] = await Promise.all([
        api.get('/progress/weigh-in-status'),
        api.get('/progress/goal-progress'),
        api.get('/meal-plans/adherence-analytics?days=30'),
        api.get('/progress/correlations'),
      ]);

      setWeighInStatus(weighInRes.data.data);
      setGoalProgress(goalRes.data.data);
      setAdherenceAnalytics(adherenceRes.data.data);
      setCorrelations(correlationRes.data.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshKey]);

  const handleWeighInSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
          <p className="text-gray-600">
            Monitor your weight journey, meal plan adherence, and analytics
          </p>
        </div>

        {/* Weigh-In Status Banner */}
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          weighInStatus?.canWeighIn
            ? 'bg-green-50 border-2 border-green-500'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{weighInStatus?.canWeighIn ? '📊' : '📅'}</span>
            <div>
              <p className={`font-semibold ${
                weighInStatus?.canWeighIn ? 'text-green-800' : 'text-blue-800'
              }`}>
                {weighInStatus?.message}
              </p>
              {!weighInStatus?.canWeighIn && weighInStatus?.daysUntilNextWeighIn > 0 && (
                <p className="text-sm text-blue-600">
                  {weighInStatus.daysUntilNextWeighIn} {weighInStatus.daysUntilNextWeighIn === 1 ? 'day' : 'days'} until your next weigh-in
                </p>
              )}
            </div>
          </div>
          {weighInStatus?.canWeighIn && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              Log Weight
            </button>
          )}
        </div>

        {/* Weight Journey Section */}
        <AccordionSection
          title="Weight Journey"
          icon="⚖️"
          isOpen={openSections.weight}
          onToggle={() => toggleSection('weight')}
        >
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GoalProgressCard goalProgress={goalProgress} />
              <ProgressTracker />
            </div>
          </div>
        </AccordionSection>

        {/* Meal Adherence Section */}
        <AccordionSection
          title="Meal Adherence"
          icon="🍽️"
          isOpen={openSections.adherence}
          onToggle={() => toggleSection('adherence')}
        >
          <div className="space-y-6 mt-6">
            {/* Streak & Summary */}
            {adherenceAnalytics?.hasData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 mb-2">Current Streak</p>
                  <p className="text-4xl font-bold text-orange-900 mb-1">
                    {adherenceAnalytics.streaks.current}
                  </p>
                  <p className="text-xs text-orange-600">{adherenceAnalytics.streaks.message}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-2">Longest Streak</p>
                  <p className="text-4xl font-bold text-green-900 mb-1">
                    {adherenceAnalytics.streaks.longest}
                  </p>
                  <p className="text-xs text-green-600">days at 70%+ adherence</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">Overall Adherence</p>
                  <p className="text-4xl font-bold text-blue-900 mb-1">
                    {adherenceAnalytics.summary.overallAdherence}%
                  </p>
                  <p className="text-xs text-blue-600">
                    {adherenceAnalytics.summary.daysAboveThreshold} of {adherenceAnalytics.summary.totalDays} days above 70%
                  </p>
                </div>
              </div>
            )}

            {/* Calendar and Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdherenceCalendar dailyData={adherenceAnalytics?.dailyData} />
              <MealTypeBreakdown mealTypeStats={adherenceAnalytics?.mealTypeBreakdown} />
            </div>
          </div>
        </AccordionSection>

        {/* Analytics & Insights Section */}
        <AccordionSection
          title="Analytics & Insights"
          icon="📈"
          isOpen={openSections.analytics}
          onToggle={() => toggleSection('analytics')}
        >
          <div className="mt-6">
            <AnalyticsInsights
              correlations={correlations}
              adherenceAnalytics={adherenceAnalytics}
            />
          </div>
        </AccordionSection>
      </div>

      {/* Weight Entry Modal */}
      <WeightEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleWeighInSuccess}
        weighInStatus={weighInStatus}
      />
    </div>
  );
};

export default Progress;
