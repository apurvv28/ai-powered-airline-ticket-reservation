"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FlightSearchForm({ onSearch, initialValues = {} }) {
	const router = useRouter();

	const [form, setForm] = useState({
		origin: initialValues.origin || "",
		destination: initialValues.destination || "",
		tripType: initialValues.tripType || "oneway", // oneway | roundtrip
		departDate: initialValues.departDate || "",
		returnDate: initialValues.returnDate || "",
		passengers: initialValues.passengers || 1,
		cabin: initialValues.cabin || "Economy",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	function update(field, value) {
		setForm((s) => ({ ...s, [field]: value }));
	}

	function buildQuery(params) {
		const esc = encodeURIComponent;
		return Object.keys(params)
			.filter((k) => params[k] !== undefined && params[k] !== "")
			.map((k) => `${esc(k)}=${esc(params[k])}`)
			.join("&");
	}

	const validate = () => {
		setError("");
		const { origin, destination, departDate, returnDate, tripType, passengers } = form;
		if (!origin.trim() || !destination.trim()) {
			setError("Please enter both origin and destination.");
			return false;
		}
		if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
			setError("Origin and destination cannot be the same.");
			return false;
		}
		if (!departDate) {
			setError("Please select a departure date.");
			return false;
		}
		if (tripType === "roundtrip") {
			if (!returnDate) {
				setError("Please select a return date for round-trip.");
				return false;
			}
			if (new Date(returnDate) < new Date(departDate)) {
				setError("Return date cannot be before departure date.");
				return false;
			}
		}
		if (!passengers || passengers < 1) {
			setError("Passengers must be at least 1.");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		setError("");

		try {
			const payload = {
				origin: form.origin.trim(),
				destination: form.destination.trim(),
				tripType: form.tripType,
				departDate: form.departDate,
				returnDate: form.tripType === "roundtrip" ? form.returnDate : undefined,
				passengers: Number(form.passengers),
				cabin: form.cabin,
			};

			const res = await fetch("/api/flights/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || "Search failed");
			}

			const data = await res.json();

			// Call callback if provided
			if (typeof onSearch === "function") onSearch(data);

			// Navigate to dashboard search page with query params so results can be loaded there
			const query = buildQuery({
				origin: payload.origin,
				destination: payload.destination,
				departDate: payload.departDate,
				returnDate: payload.returnDate,
				passengers: payload.passengers,
				cabin: payload.cabin,
				tripType: payload.tripType,
			});

			router.push(`/search?${query}`);
		} catch (err) {
			console.error("Flight search error:", err);
			setError(err?.message || "Unexpected error during search.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
				<div className="md:col-span-1">
					<label className="block text-sm font-medium text-gray-700 mb-2">From</label>
					<input
						type="text"
						value={form.origin}
						onChange={(e) => update("origin", e.target.value)}
						placeholder="City or airport"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						required
					/>
				</div>

				<div className="md:col-span-1">
					<label className="block text-sm font-medium text-gray-700 mb-2">To</label>
					<input
						type="text"
						value={form.destination}
						onChange={(e) => update("destination", e.target.value)}
						placeholder="City or airport"
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						required
					/>
				</div>

				<div className="md:col-span-1">
					<label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
					<input
						type="date"
						value={form.departDate}
						onChange={(e) => update("departDate", e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						required
					/>
				</div>

				<div className="md:col-span-1">
					<label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
					<input
						type="date"
						value={form.returnDate}
						onChange={(e) => update("returnDate", e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						disabled={form.tripType === "oneway"}
						aria-disabled={form.tripType === "oneway"}
					/>
				</div>

				<div className="md:col-span-1">
					<label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
					<select
						value={form.passengers}
						onChange={(e) => update("passengers", Number(e.target.value))}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						{Array.from({ length: 9 }).map((_, i) => (
							<option key={i + 1} value={i + 1}>
								{i + 1}
							</option>
						))}
					</select>
				</div>

				<div className="md:col-span-1">
					<label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
					<select
						value={form.cabin}
						onChange={(e) => update("cabin", e.target.value)}
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="Economy">Economy</option>
						<option value="Premium Economy">Premium Economy</option>
						<option value="Business">Business</option>
						<option value="First">First</option>
					</select>
				</div>

				<div className="md:col-span-2 flex items-center space-x-4">
					<label className="inline-flex items-center">
						<input
							type="radio"
							name="tripType"
							value="oneway"
							checked={form.tripType === "oneway"}
							onChange={() => update("tripType", "oneway")}
							className="mr-2"
						/>
						One-way
					</label>

					<label className="inline-flex items-center">
						<input
							type="radio"
							name="tripType"
							value="roundtrip"
							checked={form.tripType === "roundtrip"}
							onChange={() => update("tripType", "roundtrip")}
							className="mr-2"
						/>
						Round-trip
					</label>
				</div>

				<div className="md:col-span-2">
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{loading ? "🔄 Searching…" : "Search Flights"}
					</button>
				</div>
			</form>

			{error && (
				<div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
					{error}
				</div>
			)}
		</div>
	);
}

