'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from "@mui/material";
import {
  Flight,
  Hotel,
  DirectionsCar,
  AccountBalanceWallet,
  SmartToy,
  TrendingUp,
  Schedule,
  LocationOn,
  CalendarToday,
  AttachMoney,
  CheckCircle
} from "@mui/icons-material";
import { useRouter } from 'next/navigation';

export default function AIBudgetPlanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    days: 1,
    nights: 1,
    budgetPreference: 'economy', // economy, moderate, luxury
    travelStyle: 'solo' // solo, couple, family, business
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);


  const fetchFlights = async (source, destination) => {
    try {
      const response = await fetch(
        `http://localhost:5000/flights?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`
      );
      const flightsData = await response.json();
      setFlights(flightsData.slice(0, 5)); // Get top 5 flights
      return flightsData;
    } catch (error) {
      console.error('Error fetching flights:', error);
      return [];
    }
  };

  const generateAIBudgetPlan = async () => {
    if (!formData.source || !formData.destination) {
      alert('Please select source and destination');
      return;
    }

    setLoading(true);
    setAiResponse(null);

    try {
      // Fetch available flights first
      const availableFlights = await fetchFlights(formData.source, formData.destination);

      // Prepare data for AI
      const flightPrices = availableFlights.map(flight => ({
        airline: flight.airline,
        price: flight.price,
        duration: flight.duration,
        class: flight.class
      }));

      const prompt = `
        You are an expert travel budget planner AI. Create a detailed budget breakdown for a trip with the following details:

        SOURCE: ${formData.source}
        DESTINATION: ${formData.destination}
        DURATION: ${formData.days} days, ${formData.nights} nights
        BUDGET PREFERENCE: ${formData.budgetPreference}
        TRAVEL STYLE: ${formData.travelStyle}

        Available Flight Options:
        ${JSON.stringify(flightPrices, null, 2)}

        Please provide a comprehensive budget plan including:

        1. FLIGHT COSTS:
           - Analyze available flights and recommend the best option
           - Provide price range and specific recommendations

        2. ACCOMMODATION COSTS:
           - Estimate hotel costs based on ${formData.budgetPreference} preference
           - Consider ${formData.nights} nights stay
           - Provide cost per night and total

        3. LOCAL TRANSPORTATION:
           - Estimate daily local travel costs (taxis, public transport, rentals)
           - Consider ${formData.days} days of local travel

        4. DAILY EXPENSES:
           - Food and dining estimates
           - Activities and entertainment
           - Miscellaneous expenses

        5. TOTAL BUDGET BREAKDOWN:
           - Provide a clear total cost estimate
           - Show cost distribution percentages
           - Give money-saving tips

        IMPORTANT: Return your response as a valid JSON object with this exact structure:
        {
          "flightRecommendation": {
            "recommendedFlight": "Airline and details",
            "priceRange": "Price range string",
            "estimatedCost": number,
            "reasoning": "Why this flight is recommended"
          },
          "accommodation": {
            "type": "Hotel type description",
            "costPerNight": number,
            "totalCost": number,
            "recommendation": "Accommodation suggestions"
          },
          "localTransportation": {
            "dailyCost": number,
            "totalCost": number,
            "recommendations": "Transport options"
          },
          "dailyExpenses": {
            "food": number,
            "activities": number,
            "miscellaneous": number,
            "dailyTotal": number
          },
          "totalBudget": {
            "totalCost": number,
            "breakdown": {
              "flights": number,
              "accommodation": number,
              "transportation": number,
              "expenses": number
            },
            "percentageBreakdown": {
              "flights": number,
              "accommodation": number,
              "transportation": number,
              "expenses": number
            }
          },
          "moneySavingTips": ["tip1", "tip2", "tip3"],
          "additionalRecommendations": "Any additional advice"
        }

        Make all cost estimates realistic and based on current market rates. Consider the travel style (${formData.travelStyle}) in your calculations.
      `;

      // Call Gemini AI API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const aiText = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from AI response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const budgetPlan = JSON.parse(jsonMatch[0]);
          setAiResponse(budgetPlan);
        } else {
          throw new Error('Invalid AI response format');
        }
      } else {
        throw new Error('No response from AI');
      }

    } catch (error) {
      console.error('Error generating budget plan:', error);
      alert('Error generating budget plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const BudgetCard = ({ title, icon, amount, subtitle, color = "primary" }) => (
    <Grow in={loaded} timeout={600}>
      <Card sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)' } }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Avatar sx={{ bgcolor: `${theme.palette[color].main}20`, color: theme.palette[color].main, mb: 2, mx: 'auto' }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="h3" gutterBottom sx={{ color: theme.palette.text.primary }}>
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ color: theme.palette[color].main, fontWeight: 'bold', mb: 1 }}>
            ₹{amount?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: theme.palette.background.default }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.primary.main,
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={loaded} timeout={300}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Chip 
                label="AI Powered" 
                sx={{ 
                  background: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  mb: 2,
                  fontWeight: 'bold'
                }} 
              />
              <Typography variant={isMobile ? "h3" : "h2"} component="h1" gutterBottom color='white'>
                AI Budget Planner
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"} component="h2" color='white' sx={{ mb: 3, opacity: 0.9 }}>
                Smart Travel Cost Estimation Powered by Gemini AI
              </Typography>
              <Typography variant="body1" color='white' sx={{ mb: 4, opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
                Get personalized budget estimates for your entire trip including flights, accommodation, and local expenses
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Input Form */}
          <Grid item xs={12} md={5}>
            <Fade in={loaded} timeout={500}>
              <Card sx={{ position: 'sticky', top: 100 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ color: theme.palette.text.primary, mb: 3 }}>
                    Trip Details
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Departure City"
                        value={formData.source}
                        onChange={(e) => handleInputChange('source', e.target.value)}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Destination City"
                        value={formData.destination}
                        onChange={(e) => handleInputChange('destination', e.target.value)}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        }}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Days"
                        value={formData.days}
                        onChange={(e) => handleInputChange('days', parseInt(e.target.value) || 1)}
                        InputProps={{
                          startAdornment: <CalendarToday sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        }}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Nights"
                        value={formData.nights}
                        onChange={(e) => handleInputChange('nights', parseInt(e.target.value) || 1)}
                        InputProps={{
                          startAdornment: <Hotel sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        }}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Budget Preference"
                        value={formData.budgetPreference}
                        onChange={(e) => handleInputChange('budgetPreference', e.target.value)}
                        InputProps={{
                          startAdornment: <AccountBalanceWallet sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        }}
                      >
                        <MenuItem value="economy">Economy</MenuItem>
                        <MenuItem value="moderate">Moderate</MenuItem>
                        <MenuItem value="luxury">Luxury</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Travel Style"
                        value={formData.travelStyle}
                        onChange={(e) => handleInputChange('travelStyle', e.target.value)}
                        InputProps={{
                          startAdornment: <TrendingUp sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        }}
                      >
                        <MenuItem value="solo">Solo Traveler</MenuItem>
                        <MenuItem value="couple">Couple</MenuItem>
                        <MenuItem value="family">Family</MenuItem>
                        <MenuItem value="business">Business</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={generateAIBudgetPlan}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <SmartToy />}
                        sx={{
                          py: 1.5,
                          background: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                          fontWeight: 'bold',
                          '&:hover': {
                            background: theme.palette.secondary.dark,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Generating Plan...' : 'Generate AI Budget Plan'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={7}>
            {loading && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ color: theme.palette.secondary.main, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  AI is analyzing your trip and generating budget recommendations...
                </Typography>
              </Box>
            )}

            {aiResponse && !loading && (
              <Fade in={!!aiResponse} timeout={700}>
                <Box>
                  {/* Total Budget Summary */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: theme.palette.text.primary }}>
                      Your AI Budget Plan
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                      Total Estimated Cost: <Box component="span" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold', fontSize: '1.5rem' }}>
                        ₹{aiResponse.totalBudget?.totalCost?.toLocaleString()}
                      </Box>
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={6} sm={3}>
                        <BudgetCard
                          title="Flights"
                          icon={<Flight />}
                          amount={aiResponse.totalBudget?.breakdown?.flights}
                          subtitle="Round trip"
                          color="primary"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <BudgetCard
                          title="Accommodation"
                          icon={<Hotel />}
                          amount={aiResponse.totalBudget?.breakdown?.accommodation}
                          subtitle={`${formData.nights} nights`}
                          color="secondary"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <BudgetCard
                          title="Transport"
                          icon={<DirectionsCar />}
                          amount={aiResponse.totalBudget?.breakdown?.transportation}
                          subtitle="Local travel"
                          color="info"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <BudgetCard
                          title="Expenses"
                          icon={<AttachMoney />}
                          amount={aiResponse.totalBudget?.breakdown?.expenses}
                          subtitle="Food & activities"
                          color="success"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Detailed Breakdown */}
                  <Grid container spacing={3}>
                    {/* Flight Recommendations */}
                    <Grid item xs={12}>
                      <Card>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" component="h3" gutterBottom sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center' }}>
                            <Flight sx={{ mr: 1, color: theme.palette.primary.main }} />
                            Flight Recommendations
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {aiResponse.flightRecommendation?.recommendedFlight}
                          </Typography>
                          <Chip 
                            label={aiResponse.flightRecommendation?.priceRange} 
                            color="primary" 
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {aiResponse.flightRecommendation?.reasoning}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Accommodation */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" component="h3" gutterBottom sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center' }}>
                            <Hotel sx={{ mr: 1, color: theme.palette.secondary.main }} />
                            Accommodation
                          </Typography>
                          <Typography variant="h6" color="secondary.main" sx={{ mb: 1 }}>
                            ₹{aiResponse.accommodation?.totalCost?.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {aiResponse.accommodation?.type} • ₹{aiResponse.accommodation?.costPerNight?.toLocaleString()}/night
                          </Typography>
                          <Typography variant="body2">
                            {aiResponse.accommodation?.recommendation}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Local Transportation */}
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" component="h3" gutterBottom sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center' }}>
                            <DirectionsCar sx={{ mr: 1, color: theme.palette.info.main }} />
                            Local Transportation
                          </Typography>
                          <Typography variant="h6" color="info.main" sx={{ mb: 1 }}>
                            ₹{aiResponse.localTransportation?.totalCost?.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            ₹{aiResponse.localTransportation?.dailyCost?.toLocaleString()}/day
                          </Typography>
                          <Typography variant="body2">
                            {aiResponse.localTransportation?.recommendations}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Money Saving Tips */}
                    <Grid item xs={12}>
                      <Card>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" component="h3" gutterBottom sx={{ color: theme.palette.text.primary }}>
                            💡 Money Saving Tips
                          </Typography>
                          <List dense>
                            {aiResponse.moneySavingTips?.map((tip, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText primary={tip} />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => router.push('/search-flights')}
                      sx={{
                        background: theme.palette.primary.main,
                        '&:hover': { background: theme.palette.primary.dark }
                      }}
                    >
                      Book Flights
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={generateAIBudgetPlan}
                    >
                      Regenerate Plan
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}

            {!aiResponse && !loading && (
              <Fade in={!aiResponse && !loading} timeout={500}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <SmartToy sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Your AI Budget Plan Awaits
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Fill in your trip details and let our AI create a comprehensive budget plan for you
                  </Typography>
                </Box>
              </Fade>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}