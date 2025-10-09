import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { callGeminiWithContext } from '@/lib/gemini';

export async function POST(request) {
  try {
    const body = await request.json();
    const { source, destination, date, flightClass } = body;

    if (!source || !destination || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Step 1: Fetch historical flight data from MongoDB
    const db = await getDatabase();
    const historicalFlights = await db
      .collection('flights')
      .find({
        source: new RegExp(source, 'i'),
        destination: new RegExp(destination, 'i'),
        class: flightClass || 'Economy'
      })
      .sort({ price: 1 })
      .limit(20)
      .toArray();

    // Step 2: Calculate basic statistics
    const prices = historicalFlights.map(f => f.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Step 3: Prepare data for Gemini
    const flightDataSummary = {
      route: `${source} to ${destination}`,
      class: flightClass || 'Economy',
      historicalPrices: prices,
      avgPrice,
      minPrice,
      maxPrice,
      sampleCount: historicalFlights.length,
      requestedDate: date
    };

    // Step 4: Create AI prompt
    const systemPrompt = `You are an AI flight price prediction expert. Analyze historical flight data and predict ticket prices based on patterns, seasonality, and demand.

Historical Flight Data:
${JSON.stringify(flightDataSummary, null, 2)}

Provide a prediction in the following JSON format only (no additional text):
{
  "predictedPrice": <number>,
  "priceRange": {
    "min": <number>,
    "max": <number>
  },
  "confidence": "<high|medium|low>",
  "factors": ["factor1", "factor2", ...],
  "recommendation": "<brief recommendation>"
}`;

    const userPrompt = `Predict the ticket price for ${source} to ${destination} on ${date} for ${flightClass} class.`;

    // Step 5: Call Gemini API
    const aiResponse = await callGeminiWithContext(systemPrompt, userPrompt);
    
    // Parse JSON response
    const prediction = JSON.parse(aiResponse);

    // Step 6: Return combined result
    return NextResponse.json({
      success: true,
      prediction: {
        ...prediction,
        historicalData: {
          avgPrice,
          minPrice,
          maxPrice,
          sampleSize: historicalFlights.length
        }
      }
    });

  } catch (error) {
    console.error('Budget predictor error:', error);
    return NextResponse.json(
      { error: 'Failed to predict budget' },
      { status: 500 }
    );
  }
}