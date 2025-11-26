import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const WeightEntryModal = ({ isOpen, onClose, onSuccess, weighInStatus }) => {
  const [weight, setWeight] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [mood, setMood] = useState('neutral');
  const [sleepHours, setSleepHours] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [activityMinutes, setActivityMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (weighInStatus?.lastWeight && isOpen) {
      // Pre-fill with last weight as a starting point
      setWeight(weighInStatus.lastWeight.toString());
    }
  }, [weighInStatus, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!weight || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    // Validate that it's Sunday
    if (!weighInStatus?.canWeighIn) {
      setError(weighInStatus?.message || 'You can only weigh-in on Sundays');
      return;
    }

    setLoading(true);

    try {
      const progressData = {
        weight: parseFloat(weight),
        energyLevel: parseInt(energyLevel),
        mood,
        ...(sleepHours && { sleepHours: parseFloat(sleepHours) }),
        ...(waterIntake && { waterIntake: parseFloat(waterIntake) }),
        ...(activityMinutes && { activityMinutes: parseInt(activityMinutes) }),
        ...(notes && { notes }),
      };

      await api.post('/progress', progressData);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWeight('');
    setEnergyLevel(3);
    setMood('neutral');
    setSleepHours('');
    setWaterIntake('');
    setActivityMinutes('');
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Weekly Weigh-In</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Sunday Status Message */}
          <div className={`mb-6 p-4 rounded-lg ${
            weighInStatus?.canWeighIn
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm font-medium ${
              weighInStatus?.canWeighIn ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {weighInStatus?.message}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Weight (Required) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your weight"
                required
                disabled={!weighInStatus?.canWeighIn}
              />
            </div>

            {/* Energy Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy Level: {energyLevel}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={!weighInStatus?.canWeighIn}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Mood */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={!weighInStatus?.canWeighIn}
              >
                <option value="excellent">😄 Excellent</option>
                <option value="good">🙂 Good</option>
                <option value="neutral">😐 Neutral</option>
                <option value="low">😔 Low</option>
                <option value="poor">😞 Poor</option>
              </select>
            </div>

            {/* Optional Fields in a Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="8"
                  disabled={!weighInStatus?.canWeighIn}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water (liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="2.5"
                  disabled={!weighInStatus?.canWeighIn}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={activityMinutes}
                  onChange={(e) => setActivityMinutes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="30"
                  disabled={!weighInStatus?.canWeighIn}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength="500"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="How are you feeling? Any observations?"
                disabled={!weighInStatus?.canWeighIn}
              />
              <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !weighInStatus?.canWeighIn}
                className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                  loading || !weighInStatus?.canWeighIn
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeightEntryModal;
