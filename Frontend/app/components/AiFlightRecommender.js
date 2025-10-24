"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  useTheme
} from '@mui/material';
import { SmartToy as SmartToyIcon, Close as CloseIcon } from '@mui/icons-material';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY';

export default function AiFlightRecommender({
  open,
  onClose,
  flights,
  source,
  destination,
  departureDate
}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // 🔹 Generate the AI prompt
  const generatePrompt = (flightData, source, destination, date) => {
    const simplifiedFlights = flightData.map(flight => ({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      price: flight.price,
      stops: flight.stops || 0,
      duration: flight.duration || 0
    }));

    return `
You are an expert travel assistant. Find the best flight from ${source} to ${destination} on ${date}.
Consider price, stops, and duration carefully.

Available flights: ${JSON.stringify(simplifiedFlights, null, 2)}

Respond ONLY with valid JSON in this exact format:
{"recommendedFlight": "[flight number]", "explanation": "[why this flight is best]"}
Do NOT include any text, markdown, or extra commentary outside the JSON.
`;
  };

  // 🔹 Fetch AI recommendation
  const getAiRecommendation = useCallback(async () => {
    setLoading(true);
    try {
      const apiKey = GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        throw new Error('Missing Gemini API key. Set NEXT_PUBLIC_GEMINI_API_KEY in your .env file.');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: generatePrompt(flights, source, destination, departureDate) }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 400,
              topP: 0.8,
              topK: 20,
            },
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('API Response:', data);

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!aiResponse) throw new Error('Invalid AI response');

      console.log('AI Text Response:', aiResponse);

      let recommendedFlight = null;
      let explanation = '';

      // 🔹 Parse AI response robustly
      try {
        // Try to extract JSON substring even if extra text exists
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : aiResponse;

        const parsedResponse = JSON.parse(jsonText);
        const flightNum = parsedResponse.recommendedFlight;
        recommendedFlight = flights.find(f => f.flightNumber === flightNum);
        explanation = parsedResponse.explanation?.trim() || 'Recommended by AI analysis.';
      } catch (err) {
        console.warn('AI response was not valid JSON. Falling back to text analysis.');
        // Try to extract flight number from text
        const match = aiResponse.match(/([A-Z]{1,2}\d{2,4})/);
        if (match) {
          recommendedFlight = flights.find(f =>
            f.flightNumber.toUpperCase().includes(match[1].toUpperCase())
          );
        }

        // Extract explanation part
        const reasonMatch = aiResponse.match(/because(.*)/i);
        explanation = reasonMatch ? `Because${reasonMatch[1].trim()}` : aiResponse;
      }

      // 🔹 Fallback if AI doesn't match flight
      if (!recommendedFlight) {
        recommendedFlight = flights.reduce(
          (best, current) => (current.price < best.price ? current : best),
          flights[0]
        );
        explanation ||= 'Fallback: Selected lowest-priced flight.';
      }

      setRecommendation({ recommendedFlight, explanation });
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      setRecommendation({
        error: 'Failed to get AI recommendation. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }, [flights, source, destination, departureDate]);

  // 🔹 Trigger AI recommendation when dialog opens
  useEffect(() => {
    if (open && flights.length > 0) {
      getAiRecommendation();
    }
  }, [open, flights, getAiRecommendation]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon />
          <Typography variant="h6" color='white'>AI Flight Recommendation</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
            }}
          >
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Analyzing flights with AI...</Typography>
            <Typography variant="body2" color="text.secondary">
              Finding the best option for your journey
            </Typography>
          </Box>
        ) : recommendation ? (
          recommendation.error ? (
            <Typography color="error" align="center">
              {recommendation.error}
            </Typography>
          ) : (
            <Box>
              <Card
                sx={{
                  mt: 2,
                  border: `2px solid ${theme.palette.secondary.main}`,
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      {recommendation.recommendedFlight.airline} — Flight{' '}
                      {recommendation.recommendedFlight.flightNumber}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {source} → {destination}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ mt: 1 }}
                    >
                      {formatPrice(recommendation.recommendedFlight.price)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.03)',
                      p: 2,
                      borderRadius: 1,
                      mt: 2,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {recommendation.explanation}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
