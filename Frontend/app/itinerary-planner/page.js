"use client";

import React, { useState, useEffect } from "react";
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
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Flight,
  Hotel,
  Restaurant,
  DirectionsCar,
  Attractions,
  Schedule,
  LocationOn,
  CalendarToday,
  ExpandMore,
  Map,
  DirectionsWalk,
  LocalActivity,
  Nightlife,
  ShoppingCart,
  Museum,
  Park,
  BeachAccess,
  SmartToy,
  TrendingUp,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function AIItineraryPlanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [cities, setCities] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    destination: "",
    days: 3,
    travelStyle: "leisure", // leisure, adventure, cultural, romantic, family
    budget: "moderate", // budget, moderate, luxury
    interests: [], // beaches, historical, shopping, food, nature, nightlife
  });

  const interestsOptions = [
    { value: "beaches", label: "Beaches", icon: <BeachAccess /> },
    { value: "historical", label: "Historical Sites", icon: <Museum /> },
    { value: "shopping", label: "Shopping", icon: <ShoppingCart /> },
    { value: "food", label: "Food & Dining", icon: <Restaurant /> },
    { value: "nature", label: "Nature & Parks", icon: <Park /> },
    { value: "nightlife", label: "Nightlife", icon: <Nightlife /> },
    { value: "adventure", label: "Adventure", icon: <LocalActivity /> },
    { value: "cultural", label: "Cultural", icon: <Attractions /> },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const generateAIItinerary = async () => {
    if (!formData.destination) {
      alert("Please select a destination");
      return;
    }

    if (formData.interests.length === 0) {
      alert("Please select at least one interest");
      return;
    }

    setLoading(true);
    setAiResponse(null);

    try {
      const prompt = `
        You are an expert travel itinerary planner AI. Create a detailed day-by-day itinerary for a trip with the following details:

        DESTINATION: ${formData.destination}
        DURATION: ${formData.days} days
        TRAVEL STYLE: ${formData.travelStyle}
        BUDGET: ${formData.budget}
        INTERESTS: ${formData.interests.join(", ")}

        Please provide a comprehensive itinerary including:

        1. TRIP OVERVIEW:
           - Best time to visit
           - Must-visit attractions
           - Local customs/tips
           - Transportation advice

        2. DAY-BY-DAY ITINERARY:
           For each day, provide:
           - Morning activities
           - Afternoon activities  
           - Evening activities
           - Dining recommendations
           - Travel time estimates
           - Cost estimates where applicable

        3. ACTIVITY BREAKDOWN:
           - Cultural experiences
           - Dining experiences
           - Shopping opportunities
           - Relaxation activities

        4. PRACTICAL INFORMATION:
           - Local transportation options
           - Emergency contacts
           - Weather preparation
           - Packing suggestions

        5. BUDGET ESTIMATES:
           - Accommodation costs
           - Food expenses
           - Activity costs
           - Transportation costs

        IMPORTANT: Return your response as a valid JSON object with this exact structure:
        {
          "tripOverview": {
            "bestTimeToVisit": "string",
            "mustVisitAttractions": ["attraction1", "attraction2"],
            "localTips": ["tip1", "tip2", "tip3"],
            "transportationAdvice": "string"
          },
          "itinerary": [
            {
              "day": 1,
              "theme": "Day theme",
              "morning": {
                "activities": ["activity1", "activity2"],
                "description": "Detailed description",
                "duration": "2-3 hours",
                "cost": "budget estimate"
              },
              "afternoon": {
                "activities": ["activity1", "activity2"],
                "description": "Detailed description",
                "duration": "3-4 hours",
                "cost": "budget estimate"
              },
              "evening": {
                "activities": ["activity1", "activity2"],
                "description": "Detailed description",
                "duration": "2-3 hours",
                "cost": "budget estimate"
              },
              "diningRecommendations": ["restaurant1", "restaurant2"]
            }
          ],
          "budgetBreakdown": {
            "accommodation": { "range": "price range", "recommendations": "suggestions" },
            "food": { "dailyCost": number, "totalCost": number },
            "activities": { "dailyCost": number, "totalCost": number },
            "transportation": { "dailyCost": number, "totalCost": number },
            "totalEstimatedCost": number
          },
          "packingSuggestions": ["item1", "item2", "item3"],
          "emergencyInfo": {
            "emergencyNumber": "string",
            "hospitalAddress": "string",
            "embassyContact": "string"
          }
        }

        Make the itinerary realistic, enjoyable, and tailored to the travel style and interests. Include famous local spots and hidden gems.
      `;

      // Call Gemini AI API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const aiText = data.candidates[0].content.parts[0].text;

        // Extract JSON from AI response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const itineraryPlan = JSON.parse(jsonMatch[0]);
          setAiResponse(itineraryPlan);
        } else {
          throw new Error("Invalid AI response format");
        }
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      console.error("Error generating itinerary:", error);
      alert("Error generating itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const getInterestIcon = (interestValue) => {
    const interest = interestsOptions.find((i) => i.value === interestValue);
    return interest ? interest.icon : <LocalActivity />;
  };

  const OverviewCard = ({ title, icon, content, color = "primary" }) => (
    <Grow in={loaded} timeout={600}>
      <Card
        sx={{
          height: "100%",
          transition: "all 0.3s ease",
          "&:hover": { transform: "translateY(-5px)" },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Avatar
            sx={{
              bgcolor: `${theme.palette[color].main}20`,
              color: theme.palette[color].main,
              mb: 2,
            }}
          >
            {icon}
          </Avatar>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ color: theme.palette.text.primary }}
          >
            {title}
          </Typography>
          {Array.isArray(content) ? (
            <List dense>
              {content.map((item, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box
                      component="span"
                      sx={{ color: theme.palette[color].main }}
                    >
                      •
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {content}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: "100vh",
        background: theme.palette.background.default,
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.primary.main,
          color: "white",
          py: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Fade in={loaded} timeout={300}>
            <Box sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
              <Chip
                label="AI Powered"
                sx={{
                  background: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  mb: 2,
                  fontWeight: "bold",
                }}
              />
              <Typography
                variant={isMobile ? "h3" : "h2"}
                component="h1"
                gutterBottom
                color="white"
              >
                AI Itinerary Planner
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                component="h2"
                color="white"
                sx={{ mb: 3, opacity: 0.9 }}
              >
                Personalized Travel Plans Powered by Gemini AI
              </Typography>
              <Typography
                variant="body1"
                color="white"
                sx={{ mb: 4, opacity: 0.8, maxWidth: 600, mx: "auto" }}
              >
                Get custom day-by-day itineraries with famous spots, local gems,
                and practical travel advice
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Input Form */}
          <Grid item xs={12} md={4}>
            <Fade in={loaded} timeout={500}>
              <Card sx={{ position: "sticky", top: 100 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ color: theme.palette.text.primary, mb: 3 }}
                  >
                    Plan Your Trip
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Destination City"
                          value={formData.destination}
                          onChange={(e) =>
                            handleInputChange("destination", e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <LocationOn
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Number of Days"
                        value={formData.days}
                        onChange={(e) =>
                          handleInputChange(
                            "days",
                            parseInt(e.target.value) || 1
                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <CalendarToday
                              sx={{
                                mr: 1,
                                color: theme.palette.text.secondary,
                              }}
                            />
                          ),
                        }}
                        inputProps={{ min: 1, max: 30 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Travel Style"
                        value={formData.travelStyle}
                        onChange={(e) =>
                          handleInputChange("travelStyle", e.target.value)
                        }
                      >
                        <MenuItem value="leisure">
                          Leisure & Relaxation
                        </MenuItem>
                        <MenuItem value="adventure">
                          Adventure & Sports
                        </MenuItem>
                        <MenuItem value="cultural">
                          Cultural & Historical
                        </MenuItem>
                        <MenuItem value="romantic">Romantic Getaway</MenuItem>
                        <MenuItem value="family">Family Friendly</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Budget Level"
                        value={formData.budget}
                        onChange={(e) =>
                          handleInputChange("budget", e.target.value)
                        }
                      >
                        <MenuItem value="budget">Budget</MenuItem>
                        <MenuItem value="moderate">Moderate</MenuItem>
                        <MenuItem value="luxury">Luxury</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ color: theme.palette.text.primary }}
                      >
                        Interests & Activities
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {interestsOptions.map((interest) => (
                          <Chip
                            key={interest.value}
                            icon={interest.icon}
                            label={interest.label}
                            clickable
                            color={
                              formData.interests.includes(interest.value)
                                ? "secondary"
                                : "default"
                            }
                            variant={
                              formData.interests.includes(interest.value)
                                ? "filled"
                                : "outlined"
                            }
                            onClick={() => handleInterestToggle(interest.value)}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={generateAIItinerary}
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SmartToy />
                          )
                        }
                        sx={{
                          py: 1.5,
                          background: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                          fontWeight: "bold",
                          "&:hover": {
                            background: theme.palette.secondary.dark,
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading
                          ? "Creating Itinerary..."
                          : "Generate AI Itinerary"}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} md={8}>
            {loading && (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CircularProgress
                  size={60}
                  sx={{ color: theme.palette.secondary.main, mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  AI is crafting your perfect itinerary...
                </Typography>
              </Box>
            )}

            {aiResponse && !loading && (
              <Fade in={!!aiResponse} timeout={700}>
                <Box>
                  {/* Trip Overview */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h4"
                      component="h2"
                      gutterBottom
                      sx={{ color: theme.palette.text.primary }}
                    >
                      Your {formData.days}-Day {formData.destination} Itinerary
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12} md={6}>
                        <OverviewCard
                          title="Must-Visit Attractions"
                          icon={<Attractions />}
                          content={
                            aiResponse.tripOverview?.mustVisitAttractions
                          }
                          color="primary"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <OverviewCard
                          title="Local Tips"
                          icon={<DirectionsWalk />}
                          content={aiResponse.tripOverview?.localTips}
                          color="secondary"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Day-by-Day Itinerary */}
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ color: theme.palette.text.primary, mb: 3 }}
                  >
                    Day-by-Day Plan
                  </Typography>

                  <Stepper orientation="vertical">
                    {aiResponse.itinerary?.map((day, index) => (
                      <Step key={day.day} active={true}>
                        <StepLabel>
                          <Typography
                            variant="h6"
                            sx={{ color: theme.palette.text.primary }}
                          >
                            Day {day.day}: {day.theme}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Accordion defaultExpanded sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontWeight: "bold",
                                }}
                              >
                                🌅 Morning
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {day.morning?.activities?.map(
                                  (activity, idx) => (
                                    <ListItem key={idx}>
                                      <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Schedule
                                          sx={{
                                            fontSize: 16,
                                            color: theme.palette.primary.main,
                                          }}
                                        />
                                      </ListItemIcon>
                                      <ListItemText primary={activity} />
                                    </ListItem>
                                  )
                                )}
                              </List>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {day.morning?.description}
                              </Typography>
                            </AccordionDetails>
                          </Accordion>

                          <Accordion defaultExpanded sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography
                                sx={{
                                  color: theme.palette.secondary.main,
                                  fontWeight: "bold",
                                }}
                              >
                                ☀️ Afternoon
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {day.afternoon?.activities?.map(
                                  (activity, idx) => (
                                    <ListItem key={idx}>
                                      <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Schedule
                                          sx={{
                                            fontSize: 16,
                                            color: theme.palette.secondary.main,
                                          }}
                                        />
                                      </ListItemIcon>
                                      <ListItemText primary={activity} />
                                    </ListItem>
                                  )
                                )}
                              </List>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {day.afternoon?.description}
                              </Typography>
                            </AccordionDetails>
                          </Accordion>

                          <Accordion defaultExpanded sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography
                                sx={{
                                  color: theme.palette.info.main,
                                  fontWeight: "bold",
                                }}
                              >
                                🌙 Evening
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {day.evening?.activities?.map(
                                  (activity, idx) => (
                                    <ListItem key={idx}>
                                      <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Schedule
                                          sx={{
                                            fontSize: 16,
                                            color: theme.palette.info.main,
                                          }}
                                        />
                                      </ListItemIcon>
                                      <ListItemText primary={activity} />
                                    </ListItem>
                                  )
                                )}
                              </List>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {day.evening?.description}
                              </Typography>
                            </AccordionDetails>
                          </Accordion>

                          {day.diningRecommendations && (
                            <Card
                              sx={{
                                mt: 2,
                                background: `${theme.palette.success.main}10`,
                              }}
                            >
                              <CardContent>
                                <Typography
                                  variant="subtitle1"
                                  gutterBottom
                                  sx={{
                                    color: theme.palette.success.main,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Restaurant sx={{ mr: 1 }} />
                                  Dining Recommendations
                                </Typography>
                                <List dense>
                                  {day.diningRecommendations.map(
                                    (restaurant, idx) => (
                                      <ListItem key={idx}>
                                        <ListItemText primary={restaurant} />
                                      </ListItem>
                                    )
                                  )}
                                </List>
                              </CardContent>
                            </Card>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>

                  {/* Budget Breakdown */}
                  {aiResponse.budgetBreakdown && (
                    <Box sx={{ mt: 6 }}>
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{ color: theme.palette.text.primary }}
                      >
                        Budget Estimate
                      </Typography>
                      <Card>
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h6" color="primary.main">
                                  ₹
                                  {aiResponse.budgetBreakdown.totalEstimatedCost?.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Total Estimated
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h6" color="secondary.main">
                                  ₹
                                  {aiResponse.budgetBreakdown.food?.totalCost?.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Food & Dining
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h6" color="info.main">
                                  ₹
                                  {aiResponse.budgetBreakdown.activities?.totalCost?.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Activities
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Box sx={{ textAlign: "center" }}>
                                <Typography variant="h6" color="success.main">
                                  ₹
                                  {aiResponse.budgetBreakdown.transportation?.totalCost?.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Transportation
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box
                    sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => router.push("/search-flights")}
                      sx={{
                        background: theme.palette.primary.main,
                        "&:hover": { background: theme.palette.primary.dark },
                      }}
                    >
                      Book Flights
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={generateAIItinerary}
                    >
                      Regenerate Itinerary
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}

            {!aiResponse && !loading && (
              <Fade in={!aiResponse && !loading} timeout={500}>
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Map
                    sx={{
                      fontSize: 80,
                      color: "text.secondary",
                      mb: 2,
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Your AI Itinerary Awaits
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Fill in your trip details and let our AI create a perfect
                    day-by-day itinerary for you
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
