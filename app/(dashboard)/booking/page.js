"use client";

import { useState } from "react";

export default function BookingPage() {
  const [flightId, setFlightId] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/bookings/create/route.js".replace("/route.js",""), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId, passengerName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Booking failed");
      setMessage("Booking created successfully.");
    } catch (err) {
      setMessage(err.message || "Booking error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Flight ID</label>
            <input value={flightId} onChange={(e) => setFlightId(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Passenger name</label>
            <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Creating…' : 'Create booking'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  );
}
