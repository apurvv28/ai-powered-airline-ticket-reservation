'use client';

import { useState } from 'react';

export default function ItineraryPlanner({ budgetData }) {
  const [formData, setFormData] = useState({
    destination: '',
    budget: budgetData?.predictedPrice || '',
    duration: 3,
    interests: '',
    travelDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/ai/itinerary-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setItinerary(data.itinerary);
      }
    } catch (error) {
      console.error('Itinerary error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination City
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="e.g., Mumbai"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Budget (₹)
          </label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="15000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (days)
          </label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            min="1"
            max="10"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date
          </label>
          <input
            type="date"
            value={formData.travelDate}
            onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests (Optional)
          </label>
          <input
            type="text"
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            placeholder="e.g., Beaches, food, nightlife, museums"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                     py-3 px-6 rounded-lg font-semibold hover:from-purple-700 
                     hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? '🔄 Generating Itinerary...' : '🗺️ Generate AI Itinerary'}
          </button>
        </div>
      </form>

      {/* Display Itinerary */}
      {itinerary && (
        <div className="mt-8 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🎉 Your Personalized Itinerary
            </h3>
            <p className="text-gray-600">
              {itinerary.destination} • {itinerary.dailyPlan?.length} Days • 
              Budget: ₹{itinerary.totalBudget?.toLocaleString()}
            </p>
          </div>

          {/* Day-by-Day Plan */}
          {itinerary.dailyPlan?.map((day, dayIdx) => (
            <div key={dayIdx} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h4 className="text-xl font-bold text-indigo-600 mb-4">
                📅 Day {day.day}
              </h4>

              {/* Activities */}
              <div className="space-y-4 mb-6">
                <h5 className="font-semibold text-gray-700">Activities:</h5>
                {day.activities?.map((activity, actIdx) => (
                  <div key={actIdx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-400">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{activity.activity}</p>
                        <p className="text-sm text-gray-600">
                          🕒 {activity.time} • 📍 {activity.location}
                        </p>
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                        ₹{activity.estimatedCost}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                    {activity.tips && (
                      <p className="text-xs text-indigo-600">💡 {activity.tips}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Meals */}
              {day.meals && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600">🍳 Breakfast</p>
                    <p className="text-sm font-semibold">{day.meals.breakfast?.place}</p>
                    <p className="text-xs text-gray-600">₹{day.meals.breakfast?.cost}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600">🍛 Lunch</p>
                    <p className="text-sm font-semibold">{day.meals.lunch?.place}</p>
                    <p className="text-xs text-gray-600">₹{day.meals.lunch?.cost}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600">🍽️ Dinner</p>
                    <p className="text-sm font-semibold">{day.meals.dinner?.place}</p>
                    <p className="text-xs text-gray-600">₹{day.meals.dinner?.cost}</p>
                  </div>
                </div>
              )}

              {/* Accommodation */}
              {day.accommodation && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">🏨 Accommodation</p>
                  <div className="flex justify-between">
                    <p className="font-semibold">{day.accommodation.name}</p>
                    <p className="text-blue-600 font-semibold">₹{day.accommodation.cost}/night</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Budget Breakdown */}
          {itinerary.budgetBreakdown && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">💰 Budget Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(itinerary.budgetBreakdown).map(([category, amount]) => (
                  <div key={category} className="text-center">
                    <p className="text-sm text-gray-600 capitalize mb-1">{category}</p>
                    <p className="text-lg font-bold text-indigo-600">₹{amount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Tips */}
          {itinerary.travelTips && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3">💡 Travel Tips</h4>
              <ul className="space-y-2">
                {itinerary.travelTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Packing List */}
          {itinerary.packingList && (
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-lg font-bold text-gray-800 mb-3">🎒 Packing List</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {itinerary.packingList.map((item, idx) => (
                  <div key={idx} className="bg-white rounded px-3 py-2 text-sm text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}