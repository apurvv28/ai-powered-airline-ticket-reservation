 'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FlightSearchForm from '@/components/FlightSearchForm';
import BudgetPredictor from '@/components/BudgetPredictor';
import ItineraryPlanner from '@/components/ItineraryPlanner';

export default function SearchPage() {
  const [showItinerary, setShowItinerary] = useState(false);
  const [budgetData, setBudgetData] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState('');

  const searchParams = useSearchParams();

  // Read URL params and fetch results when they change
  const searchString = searchParams ? searchParams.toString() : '';

  useEffect(() => {
    if (!searchParams) return;
    const origin = searchParams.get('origin') || searchParams.get('source');
    const destination = searchParams.get('destination');
    const departDate = searchParams.get('departDate') || searchParams.get('date');
    if (!origin || !destination || !departDate) return;

    const q = searchParams.toString();
    setLoadingResults(true);
    setResultsError('');

    fetch(`/api/flights/search?${q}`)
      .then((r) => {
        if (!r.ok) throw new Error('Search failed');
        return r.json();
      })
      .then((data) => {
        setResults(data.flights || []);
      })
      .catch((err) => {
        console.error('Search fetch error:', err);
        setResultsError(err.message || 'Failed to load results');
      })
      .finally(() => setLoadingResults(false));
  }, [searchString]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          ✈️ AI-Powered Flight Booking
        </h1>

        {/* Main Flight Search */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Search Flights
          </h2>
          <FlightSearchForm />
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h3 className="text-xl font-semibold mb-4">Search Results</h3>
          {loadingResults ? (
            <p>Loading results…</p>
          ) : resultsError ? (
            <p className="text-red-600">{resultsError}</p>
          ) : results.length === 0 ? (
            <p>No flights found for your query.</p>
          ) : (
            <div className="space-y-4">
              {results.map((f) => (
                <div key={f._id} className="p-4 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{f.source} → {f.destination}</div>
                    <div className="text-sm text-gray-600">{f.airline || 'Unknown Airline'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{f.price}</div>
                    <div className="text-sm text-gray-600">{f.class || f.cabin || 'Economy'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Budget Predictor */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">🤖</span>
            <h2 className="text-2xl font-semibold text-gray-700">
              AI Budget Predictor
            </h2>
          </div>
          <BudgetPredictor onPrediction={setBudgetData} />
          
          {/* Button to show itinerary planner */}
          {budgetData && (
            <button
              onClick={() => setShowItinerary(!showItinerary)}
              className="mt-6 w-full bg-gradient-to-r from-purple-500 to-indigo-600 
                       text-white py-4 px-6 rounded-xl font-semibold text-lg
                       hover:from-purple-600 hover:to-indigo-700 transition-all
                       shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {showItinerary ? '🔼 Hide' : '🗺️ Plan Your Itinerary'} with AI
            </button>
          )}
        </div>

        {/* AI Itinerary Planner (shown when button clicked) */}
        {showItinerary && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">🗺️</span>
              <h2 className="text-2xl font-semibold text-gray-700">
                AI Itinerary Planner
              </h2>
            </div>
            <ItineraryPlanner budgetData={budgetData} />
          </div>
        )}
      </div>
    </div>
  );
}
