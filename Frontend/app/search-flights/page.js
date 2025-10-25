"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Collapse,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AiFlightRecommender from '../components/AiFlightRecommender';

export default function SearchFlightsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [flights, setFlights] = useState([]);
  const [searchSource, setSearchSource] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchDate, setSearchDate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchFlights = async (source, destination, departureDate) => {
    if (!source || !destination) {
      setFlights([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (source) queryParams.append("source", source);
      if (destination) queryParams.append("destination", destination);
      if (departureDate) {
        const y = departureDate.getFullYear();
        const m = String(departureDate.getMonth() + 1).padStart(2, "0");
        const d = String(departureDate.getDate()).padStart(2, "0");
        queryParams.append("departureDate", `${y}-${m}-${d}`);
      }

      const response = await fetch(
        `http://localhost:5000/flights?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch flights");
      }
      const data = await response.json();
      console.log("Fetched flights with dates:", data);
      setFlights(data);
    } catch (err) {
      setError("Error: " + err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAIRecommendations = async () => {
    if (!searchSource || !searchDestination) {
      setError("Please enter source and destination first");
      return;
    }

    setAiLoading(true);
    setAiDialogOpen(true);
    
    try {
      const recommendedFlights = flights
        .filter(flight => 
          flight.price <= 500 && // Budget-friendly
          flight.stops <= 1 && // Minimal stops
          flight.duration <= 360 // Reasonable duration
        )
        .slice(0, 3)
        .map(flight => ({
          ...flight,
          recommendationReason: getRecommendationReason(flight)
        }));
      
      setAiRecommendations(recommendedFlights);
      setAiLoading(false);
    } catch (err) {
      setError("AI recommendation service unavailable");
      setAiLoading(false);
    }
  };

  const getRecommendationReason = (flight) => {
    const reasons = [];
    if (flight.price <= 300) reasons.push("Great price");
    if (flight.stops === 0) reasons.push("Direct flight");
    if (flight.duration <= 240) reasons.push("Short duration");
    if (flight.availableSeats > 10) reasons.push("Many seats available");
    if (flight.discount?.hasDiscount) reasons.push("Special discount");
    
    return reasons.length > 0 ? reasons.join(" • ") : "Good overall value";
  };

  const getDiscountedPrice = (flight) => {
    if (!flight.discount?.hasDiscount) return flight.price;
    
    if (flight.discount.discountType === "percentage") {
      return flight.price * (1 - flight.discount.discountValue / 100);
    } else {
      return Math.max(0, flight.price - flight.discount.discountValue);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFlights(searchSource, searchDestination, searchDate);
  };

  // Format time for consistent display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString;
    }
    return "N/A";
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Flexible";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format operating days for display
  const formatOperatingDays = (days) => {
    if (!days || !Array.isArray(days)) return "Daily";
    
    const dayMap = {
      'sun': 'Sun', 'mon': 'Mon', 'tue': 'Tue', 'wed': 'Wed',
      'thu': 'Thu', 'fri': 'Fri', 'sat': 'Sat'
    };
    
    if (days.length === 7) return "Daily";
    return days.map(day => dayMap[day] || day).join(', ');
  };

  // Check if flight operates on searched date
  const getFlightStatus = (flight, searchDate) => {
    if (!searchDate) return "Available";
    
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const searchDay = days[searchDate.getDay()];
    
    if (!flight.operatingDays || flight.operatingDays.length === 0) return "Available";
    
    return flight.operatingDays.includes(searchDay) ? "Available" : "Not available on selected date";
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box 
        sx={{ 
          maxWidth: "lg", 
          mx: "auto",
          py: 4,
          px: 2
        }}
      >
        {/* Header with theme colors */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
              }}
            >
              Search Flights
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Find flights based on operating schedules - Search by date or see all available flights
            </Typography>
          </Box>
        </motion.div>

        {/* Error Alert */}
        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
              border: `1px solid ${theme.palette.grey[300]}`
            }}
          >
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ 
                display: "flex", 
                gap: 3, 
                mb: 3,
                flexWrap: "wrap",
                alignItems: "flex-end"
              }}
            >
              <TextField
                label="From City"
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                fullWidth
                required
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(33% - 24px)' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }
                }}
              />
              <TextField
                label="To City"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                fullWidth
                required
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(33% - 24px)' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  }
                }}
              />
              <DatePicker
                label="Departure Date (Optional)"
                value={searchDate}
                onChange={(newValue) => setSearchDate(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    sx={{
                      flex: { xs: '1 1 100%', sm: '1 1 calc(33% - 24px)' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white',
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      }
                    }}
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ 
                  minWidth: 140,
                  height: 56,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  flex: { xs: '1 1 100%', sm: '1' },
                  background: theme.palette.primary.main,
                  boxShadow: `0 4px 15px ${theme.palette.primary.main}30`,
                  '&:hover': {
                    background: theme.palette.primary.dark,
                    boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Search Flights
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchDate 
                  ? `Searching for flights on ${formatDisplayDate(searchDate)}`
                  : "Showing all available flights (select date to filter by day)"
                }
              </Typography>
              
              <Button
                onClick={getAIRecommendations}
                variant="outlined"
                size="large"
                startIcon={<SmartToyIcon />}
                disabled={!searchSource || !searchDestination || flights.length === 0}
                sx={{
                  borderRadius: 3,
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: `${theme.palette.secondary.main}10`,
                    borderColor: theme.palette.secondary.dark,
                    color: theme.palette.secondary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 15px ${theme.palette.secondary.main}30`,
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Get AI Recommendations
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                background: theme.palette.primary.main,
                color: 'white'
              }}
            >
              <CircularProgress 
                sx={{ 
                  color: 'white',
                  mb: 2
                }} 
              />
              <Typography variant="h6">
                Searching for the best flights...
              </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Results */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {flights.length === 0 ? (
              <Paper
                elevation={1}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                  border: `1px solid ${theme.palette.grey[300]}`
                }}
              >
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  ✈️ No Flights Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {searchSource && searchDestination 
                    ? `No flights found from ${searchSource} to ${searchDestination}${searchDate ? ` on ${formatDisplayDate(searchDate)}` : ''}`
                    : 'Enter source and destination to search for flights'
                  }
                </Typography>
              </Paper>
            ) : (
              <>
                {(() => {
                  const uniqueAirlines = [...new Set(flights.map((f) => f.airline))];

                  if (!selectedAirline) {
                    return (
                      <Box>
                        <Typography 
                          variant="h5" 
                          gutterBottom 
                          sx={{ 
                            mb: 3,
                            fontWeight: '600',
                            color: 'text.primary'
                          }}
                        >
                          Select an Airline ({flights.length} flights found)
                          {searchDate && (
                            <Typography variant="body1" color="text.secondary">
                              Showing flights available on {formatDisplayDate(searchDate)}
                            </Typography>
                          )}
                        </Typography>
                        <Grid container spacing={3}>
                          {uniqueAirlines.map((airline, index) => {
                            const airlineFlights = flights.filter(f => f.airline === airline);
                            const availableFlights = searchDate 
                              ? airlineFlights.filter(f => getFlightStatus(f, searchDate) === "Available")
                              : airlineFlights;
                            
                            return (
                              <Grid item xs={6} sm={4} md={3} lg={2} key={airline}>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ 
                                    duration: 0.4, 
                                    delay: index * 0.1 
                                  }}
                                  whileHover={{ 
                                    scale: 1.05,
                                    transition: { duration: 0.2 }
                                  }}
                                >
                                  <Card
                                    onClick={() => setSelectedAirline(airline)}
                                    sx={{
                                      cursor: 'pointer',
                                      borderRadius: 3,
                                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                      transition: 'all 0.3s ease',
                                      border: `2px solid ${theme.palette.secondary.main}`,
                                      '&:hover': {
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                                      }
                                    }}
                                  >
                                    <CardContent sx={{ 
                                      textAlign: 'center', 
                                      p: 3,
                                      '&:last-child': { pb: 3 }
                                    }}>
                                      <Box
                                        sx={{
                                          width: 56,
                                          height: 56,
                                          mx: 'auto',
                                          mb: 1.5,
                                          borderRadius: '50%',
                                          backgroundColor: theme.palette.primary.main,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
                                        }}
                                      >
                                        <Typography 
                                          variant="subtitle1" 
                                          sx={{ 
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '0.9rem'
                                          }}
                                        >
                                          {airline.split(' ').map(word => word[0]).join('')}
                                        </Typography>
                                      </Box>
                                      <Typography 
                                        variant="h6" 
                                        sx={{
                                          fontWeight: 'bold',
                                          mb: 1,
                                          color: theme.palette.primary.main,
                                        }}
                                      >
                                        {airline}
                                      </Typography>
                                      <Typography 
                                        variant="body2"
                                        sx={{ opacity: 0.9, color: 'text.secondary' }}
                                      >
                                        {availableFlights.length} flights available
                                      </Typography>
                                      {searchDate && availableFlights.length < airlineFlights.length && (
                                        <Typography variant="caption" color="text.secondary">
                                          {airlineFlights.length - availableFlights.length} not available on selected date
                                        </Typography>
                                      )}
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    );
                  } else {
                    const airlineFlights = flights.filter((f) => f.airline === selectedAirline);
                    const sortedFlights = airlineFlights.sort((a, b) => {
                      // Sort by availability first, then by price
                      const aStatus = getFlightStatus(a, searchDate);
                      const bStatus = getFlightStatus(b, searchDate);
                      
                      if (aStatus !== bStatus) {
                        return aStatus === "Available" ? -1 : 1;
                      }
                      return a.price - b.price;
                    });

                    return (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Box sx={{ mb: 3 }}>
                          <Button
                            onClick={() => setSelectedAirline(null)}
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            sx={{ 
                              mb: 2,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 'bold',
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                background: `${theme.palette.primary.main}10`
                              }
                            }}
                          >
                            Back to Airlines
                          </Button>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              background: theme.palette.primary.main,
                              color: 'white'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: '50%',
                                  backgroundColor: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: theme.palette.primary.main,
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {selectedAirline.split(' ').map(word => word[0]).join('')}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="h4" color="white" sx={{ fontWeight: 'bold' }}>
                                  {selectedAirline} Flights
                                </Typography>
                                <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
                                  {sortedFlights.length} flights • {searchDate ? `Showing availability for ${formatDisplayDate(searchDate)}` : 'All available flights'}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Box>

                        <Grid container spacing={3}>
                          {sortedFlights.map((flight, index) => {
                            const finalPrice = getDiscountedPrice(flight);
                            const hasDiscount = flight.discount?.hasDiscount && finalPrice < flight.price;
                            const flightStatus = getFlightStatus(flight, searchDate);
                            const isAvailable = flightStatus === "Available";
                            
                            return (
                              <Grid item xs={12} key={flight._id || index}>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ 
                                    duration: 0.4, 
                                    delay: index * 0.1 
                                  }}
                                  whileHover={{ 
                                    scale: isAvailable ? 1.01 : 1,
                                    transition: { duration: 0.2 }
                                  }}
                                >
                                  <Card
                                    sx={{
                                      width: '100%',
                                      borderRadius: 3,
                                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                      transition: 'all 0.3s ease',
                                      border: `1px solid ${isAvailable ? theme.palette.grey[300] : theme.palette.grey[200]}`,
                                      opacity: isAvailable ? 1 : 0.7,
                                      '&:hover': {
                                        boxShadow: isAvailable ? '0 8px 30px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.1)',
                                      }
                                    }}
                                  >
                                    <CardContent sx={{ p: 3 }}>
                                      {/* Status Badge */}
                                      {!isAvailable && (
                                        <Box sx={{ mb: 2 }}>
                                          <Chip 
                                            label={flightStatus}
                                            color="warning"
                                            size="small"
                                          />
                                        </Box>
                                      )}
                                      
                                      <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                                        gap: 2,
                                        mb: 2
                                      }}>
                                        {/* Airline & Flight Info */}
                                        <Box sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 2,
                                          minWidth: { xs: '100%', md: '180px' },
                                          mb: { xs: 2, md: 0 }
                                        }}>
                                          <Box
                                            sx={{
                                              width: 50,
                                              height: 50,
                                              borderRadius: '50%',
                                              backgroundColor: isAvailable ? theme.palette.primary.main : theme.palette.grey[400],
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: 'white',
                                              fontWeight: 'bold',
                                              fontSize: '0.8rem',
                                              flexShrink: 0
                                            }}
                                          >
                                            {selectedAirline.split(' ').map(word => word[0]).join('')}
                                          </Box>
                                          <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                              {flight.flightNumber}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                              {selectedAirline}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Operates: {formatOperatingDays(flight.operatingDays)}
                                            </Typography>
                                          </Box>
                                        </Box>

                                        {/* Departure */}
                                        <Box sx={{ 
                                          textAlign: 'center',
                                          minWidth: { xs: '45%', md: '120px' }
                                        }}>
                                          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                            {formatTime(flight.departure?.time)}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                            {flight.source}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {flight.calculatedDeparture ? formatDisplayDate(flight.calculatedDeparture.date) : 'Flexible date'}
                                          </Typography>
                                        </Box>

                                        {/* Duration & Stops */}
                                        <Box sx={{ 
                                          textAlign: 'center',
                                          minWidth: { xs: '45%', md: '120px' },
                                          display: { xs: 'none', sm: 'block' }
                                        }}>
                                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                            {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
                                          </Typography>
                                          <Box sx={{ 
                                            width: 60, 
                                            height: 2, 
                                            backgroundColor: isAvailable ? theme.palette.primary.main : theme.palette.grey[400],
                                            my: 1,
                                            mx: 'auto'
                                          }} />
                                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                            {flight.stops || 0} stop(s)
                                          </Typography>
                                        </Box>

                                        {/* Arrival */}
                                        <Box sx={{ 
                                          textAlign: 'center',
                                          minWidth: { xs: '45%', md: '120px' }
                                        }}>
                                          <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                            {formatTime(flight.arrival?.time)}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                                            {flight.destination}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {flight.calculatedArrival ? formatDisplayDate(flight.calculatedArrival.date) : 'Flexible date'}
                                          </Typography>
                                        </Box>

                                        {/* Price & Action */}
                                        <Box sx={{ 
                                          textAlign: { xs: 'left', md: 'right' },
                                          minWidth: { xs: '100%', md: '140px' },
                                          mt: { xs: 2, md: 0 }
                                        }}>
                                          <Box sx={{ mb: 1 }}>
                                            {hasDiscount ? (
                                              <>
                                                <Typography 
                                                  variant="h5" 
                                                  sx={{ 
                                                    fontWeight: 'bold',
                                                    color: isAvailable ? theme.palette.success.main : theme.palette.grey[500],
                                                    lineHeight: 1.2
                                                  }}
                                                >
                                                  ₹{finalPrice.toFixed(2)}
                                                </Typography>
                                                <Typography 
                                                  variant="body2" 
                                                  sx={{ 
                                                    textDecoration: 'line-through',
                                                    color: 'text.secondary'
                                                  }}
                                                >
                                                  ₹{flight.price}
                                                </Typography>
                                                <Chip 
                                                  label="Discount" 
                                                  size="small" 
                                                  color="success" 
                                                  sx={{ mt: 0.5 }}
                                                />
                                              </>
                                            ) : (
                                              <Typography 
                                                variant="h5" 
                                                sx={{ 
                                                  fontWeight: 'bold',
                                                  color: isAvailable ? theme.palette.primary.main : theme.palette.grey[500],
                                                  lineHeight: 1.2
                                                }}
                                              >
                                                ₹{flight.price}
                                              </Typography>
                                            )}
                                          </Box>
                                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2, mb: 1 }}>
                                            {flight.class || 'Economy'} • {flight.availableSeats || 0} seats
                                          </Typography>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            disabled={!isAvailable}
                                            onClick={() => {
                                              if (isAvailable) {
                                                localStorage.setItem('selectedFlight', JSON.stringify(flight));
                                                router.push(`/book-flight?flightId=${flight._id}`);
                                              }
                                            }}
                                            sx={{
                                              borderRadius: 2,
                                              textTransform: 'none',
                                              fontWeight: 'bold',
                                              background: isAvailable ? theme.palette.secondary.main : theme.palette.grey[400],
                                              color: isAvailable ? theme.palette.secondary.contrastText : theme.palette.grey[600],
                                              width: { xs: '100%', md: 'auto' },
                                              '&:hover': isAvailable ? {
                                                background: theme.palette.secondary.dark,
                                              } : {}
                                            }}
                                          >
                                            {isAvailable ? 'Book Now' : 'Not Available'}
                                          </Button>
                                        </Box>
                                      </Box>

                                      {/* Mobile view for duration & stops */}
                                      <Box sx={{ 
                                        display: { xs: 'flex', sm: 'none' },
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mt: 2,
                                        pt: 2,
                                        borderTop: `1px solid ${theme.palette.grey[200]}`
                                      }}>
                                        <Typography variant="body2" color="text.secondary">
                                          Duration: {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Stops: {flight.stops || 0}
                                        </Typography>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </motion.div>
                    );
                  }
                })()}
              </>
            )}
          </motion.div>
        )}

        {/* AI Recommendations Dialog - Keep this part the same as before */}
        <AiFlightRecommender
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        flights={flights}
        source={searchSource}
        destination={searchDestination}
        departureDate={searchDate}
      />
      </Box>
    </LocalizationProvider>
  );
}