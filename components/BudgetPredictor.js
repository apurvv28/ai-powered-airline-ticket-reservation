'use client';

import { useState } from 'react';

export default function BudgetPredictor({ onPrediction }) {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: '',
    class: 'Economy'
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the budget predictor API
      const response = await fetch('/api/ai/budget-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setPrediction(data.prediction);
        onPrediction(data.prediction);
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From (Source)
          </label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            placeholder="e.g., Delhi"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To (Destination)
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            placeholder="e.g., Mumbai"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class
          </label>
          <select
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold
                     hover:bg-blue-700 transition-colors disabled:bg-gray-400
                     disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Predicting...' : '🤖 Predict Budget with AI'}
          </button>
        </div>
      </form>

      {/* Display Prediction Result */}
      {prediction && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🎯 AI Prediction Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-1">Predicted Price</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{prediction.predictedPrice?.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-1">Price Range</p>
              <p className="text-lg font-semibold text-gray-800">
                ₹{prediction.priceRange?.min?.toLocaleString()} - 
                ₹{prediction.priceRange?.max?.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-1">Confidence</p>
              <p className="text-lg font-semibold text-green-600 uppercase">
                {prediction.confidence}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">📊 Factors Considered:</h4>
            <ul className="list-disc list-inside space-y-1">
              {prediction.factors?.map((factor, idx) => (
                <li key={idx} className="text-gray-600">{factor}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <h4 className="font-semibold text-gray-700 mb-2">💡 Recommendation:</h4>
            <p className="text-gray-600">{prediction.recommendation}</p>
          </div>

          {prediction.historicalData && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Based on {prediction.historicalData.sampleSize} historical flights</p>
              <p>Average price: ₹{prediction.historicalData.avgPrice?.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}