"use client";

import FlightSearchForm from "@/components/FlightSearchForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Fly smarter with AI</h1>
          <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
            Search, compare and book flights with AI-powered price predictions and itinerary planning.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Find the best flight</h2>
          <FlightSearchForm />
        </section>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-2">🤖 AI Budget Predictor</h3>
            <p className="text-sm text-gray-600">Get estimated ticket prices using historical data and AI.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-2">🗺️ Itinerary Planner</h3>
            <p className="text-sm text-gray-600">Plan your trip with personalized day-by-day itineraries.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold mb-2">🔒 Secure Bookings</h3>
            <p className="text-sm text-gray-600">Manage your bookings and view your travel history.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
