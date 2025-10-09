"use client";

import { useEffect, useState } from "react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/bookings/list/route.js".replace("/route.js",""))
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setBookings(data.bookings || []);
      })
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>
        {loading ? (
          <p>Loading…</p>
        ) : bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Flight: {b.flightId}</p>
                    <p className="text-sm">Passenger: {b.passengerName}</p>
                  </div>
                  <div className="text-sm text-gray-600">{new Date(b.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
