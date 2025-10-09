import { NextResponse } from "next/server";
import { callGeminiWithContext } from "@/lib/gemini";

export async function POST(request) {
  try {
    const body = await request.json();
    const { destination, budget, duration, interests, travelDate } = body;

    if (!destination || !budget) {
      return NextResponse.json(
        { error: "Destination and budget are required" },
        { status: 400 }
      );
    }

    // Step 1: Create detailed prompt for Gemini
    const systemPrompt = `You are an expert travel itinerary planner. Create detailed, personalized travel itineraries based on user  preferences and budget constraints.
Consider the following when planning:

Local attractions and must-see places
Budget-friendly accommodations
Transportation within the city
Food and dining recommendations
Time management and realistic schedules
Safety and travel tips

Provide the response in the following JSON format only:
{
"itinerary": {
"destination": "<destination>",
"totalBudget": <number>,
"dailyPlan": [
{
"day": <number>,
"activities": [
{
"time": "<time>",
"activity": "<activity name>",
"location": "<location>",
"estimatedCost": <number>,
"description": "<brief description>",
"tips": "<helpful tips>"
}
],
"meals": {
"breakfast": { "place": "<place>", "cost": <number> },
"lunch": { "place": "<place>", "cost": <number> },
"dinner": { "place": "<place>", "cost": <number> }
},
"accommodation": {
"name": "<hotel/hostel name>",
"cost": <number>
}
}
],
"budgetBreakdown": {
"accommodation": <number>,
"food": <number>,
"activities": <number>,
"transportation": <number>,
"miscellaneous": <number>
},
"travelTips": ["<tip1>", "<tip2>", ...],
"packingList": ["<item1>", "<item2>", ...]
}
}`;
    const userPrompt = `Create a ${
      duration || 3
    }-day itinerary for ${destination} with a budget of ₹${budget}.
Travel date: ${travelDate || "Flexible"}
Interests: ${interests || "General sightseeing, local culture, food"}`;
    // Step 2: Call Gemini API
    const aiResponse = await callGeminiWithContext(systemPrompt, userPrompt);

    // Step 3: Parse the response
    const itinerary = JSON.parse(aiResponse);

    // Step 4: Return formatted itinerary
    return NextResponse.json({
      success: true,
      itinerary: itinerary.itinerary,
    });
  } catch (error) {
    console.error("Itinerary planner error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
