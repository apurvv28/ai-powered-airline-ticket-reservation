"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Switch,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton as MuiIconButton,
  Alert,
  InputAdornment
} from "@mui/material";
import { motion } from "framer-motion";
import LogoutIcon from '@mui/icons-material/Logout';
import FlightIcon from '@mui/icons-material/Flight';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DiscountIcon from '@mui/icons-material/Discount';

export default function AirlineDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const [airline, setAirline] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addFlightDialog, setAddFlightDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [flightForm, setFlightForm] = useState({
    flightNumber: "",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    stops: 0,
    class: "Economy",
    price: "",
    totalSeats: "",
    availableSeats: "",
    operatingDays: [],
    isActive: true,
    discount: {
      hasDiscount: false,
      discountType: "percentage", // percentage or fixed
      discountValue: "",
      discountStartDate: "",
      discountEndDate: ""
    },
    aircraftType: "",
    baggageAllowance: ""
  });

  const daysOfWeek = [
    { value: "sun", label: "Sunday" },
    { value: "mon", label: "Monday" },
    { value: "tue", label: "Tuesday" },
    { value: "wed", label: "Wednesday" },
    { value: "thu", label: "Thursday" },
    { value: "fri", label: "Friday" },
    { value: "sat", label: "Saturday" }
  ];

  const flightClasses = ["Economy", "Premium Economy", "Business", "First Class"];
  const aircraftTypes = ["Boeing 737", "Boeing 747", "Airbus A320", "Airbus A380", "Embraer E190", "Bombardier CRJ"];

  useEffect(() => {
    const airlineData = localStorage.getItem("airline");
    if (!airlineData) {
      router.push("/airline-log");
      return;
    }
    
    setAirline(JSON.parse(airlineData));
    fetchFlights(JSON.parse(airlineData)._id);
  }, [router]);

  const fetchFlights = async (airlineId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/airlines/${airlineId}/flights`);
      const data = await response.json();
      setFlights(data);
    } catch (err) {
      console.error("Error fetching flights:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("airline");
    localStorage.removeItem("airlineToken");
    localStorage.removeItem("isAirlineLoggedIn");
    router.push("/airline-log");
  };

  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFlightForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFlightForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleOperatingDaysChange = (day) => {
    setFlightForm(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };

  const calculateDuration = () => {
    if (flightForm.departureTime && flightForm.arrivalTime) {
      const [depHours, depMinutes] = flightForm.departureTime.split(':').map(Number);
      const [arrHours, arrMinutes] = flightForm.arrivalTime.split(':').map(Number);
      
      let totalMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
      if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle next day arrival
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      setFlightForm(prev => ({
        ...prev,
        duration: totalMinutes
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (!flightForm.flightNumber || !flightForm.source || !flightForm.destination) {
        setError("Please fill in all required fields");
        return;
      }

      if (flightForm.operatingDays.length === 0) {
        setError("Please select at least one operating day");
        return;
      }

      const flightData = {
        ...flightForm,
        airlineId: airline._id,
        airline: airline.airlineName,
        departure: {
          date: new Date().toISOString().split('T')[0], // Default date
          time: flightForm.departureTime
        },
        arrival: {
          date: new Date().toISOString().split('T')[0], // Default date
          time: flightForm.arrivalTime
        },
        price: Number(flightForm.price),
        totalSeats: Number(flightForm.totalSeats),
        availableSeats: Number(flightForm.availableSeats || flightForm.totalSeats),
        duration: Number(flightForm.duration),
        stops: Number(flightForm.stops)
      };

      const url = editingFlight 
        ? `http://localhost:5000/api/airlines/flights/${editingFlight._id}`
        : `http://localhost:5000/api/airlines/${airline._id}/flights`;

      const method = editingFlight ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        throw new Error("Failed to save flight");
      }

      const savedFlight = await response.json();
      
      setSuccess(editingFlight ? "Flight updated successfully!" : "Flight added successfully!");
      setAddFlightDialog(false);
      setEditingFlight(null);
      resetForm();
      
      // Refresh flights list
      fetchFlights(airline._id);

    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const resetForm = () => {
    setFlightForm({
      flightNumber: "",
      source: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      duration: "",
      stops: 0,
      class: "Economy",
      price: "",
      totalSeats: "",
      availableSeats: "",
      operatingDays: [],
      isActive: true,
      discount: {
        hasDiscount: false,
        discountType: "percentage",
        discountValue: "",
        discountStartDate: "",
        discountEndDate: ""
      },
      aircraftType: "",
      baggageAllowance: ""
    });
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    setFlightForm({
      flightNumber: flight.flightNumber,
      source: flight.source,
      destination: flight.destination,
      departureTime: flight.departure.time,
      arrivalTime: flight.arrival.time,
      duration: flight.duration.toString(),
      stops: flight.stops,
      class: flight.class,
      price: flight.price.toString(),
      totalSeats: flight.totalSeats.toString(),
      availableSeats: flight.availableSeats.toString(),
      operatingDays: flight.operatingDays || [],
      isActive: flight.isActive,
      discount: flight.discount || {
        hasDiscount: false,
        discountType: "percentage",
        discountValue: "",
        discountStartDate: "",
        discountEndDate: ""
      },
      aircraftType: flight.aircraftType || "",
      baggageAllowance: flight.baggageAllowance || ""
    });
    setAddFlightDialog(true);
  };

  const handleDelete = async (flightId) => {
    if (confirm("Are you sure you want to delete this flight?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/airlines/flights/${flightId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete flight");
        }

        setSuccess("Flight deleted successfully!");
        fetchFlights(airline._id);
      } catch (err) {
        setError("Error: " + err.message);
      }
    }
  };

  const getOperatingDaysLabel = (days) => {
    return days.map(day => {
      const dayObj = daysOfWeek.find(d => d.value === day);
      return dayObj ? dayObj.label.substring(0, 3) : day;
    }).join(", ");
  };

  const getDiscountedPrice = (flight) => {
    if (!flight.discount?.hasDiscount) return flight.price;
    
    if (flight.discount.discountType === "percentage") {
      return flight.price * (1 - flight.discount.discountValue / 100);
    } else {
      return flight.price - flight.discount.discountValue;
    }
  };

  if (!airline) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <FlightIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" color="white" sx={{ flexGrow: 1 }}>
            {airline.airlineName} - Admin Panel
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.primary.main, color: 'white' }}>
              <CardContent>
                <Typography variant="h4" color="white" gutterBottom>
                  {flights.length}
                </Typography>
                <Typography variant="h6" color="white">
                  Total Flights
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.secondary.main, color: 'white' }}>
              <CardContent>
                <Typography variant="h4" color="white" gutterBottom>
                  {flights.filter(f => f.isActive).length}
                </Typography>
                <Typography variant="h6" color="white">
                  Active Flights
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.success.main, color: 'white' }}>
              <CardContent>
                <Typography variant="h4" color="white" gutterBottom>
                  {airline.airlineCode}
                </Typography>
                <Typography variant="h6" color="white">
                  Airline Code
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ background: theme.palette.info.main, color: 'white' }}>
              <CardContent>
                <Typography variant="h4" color="white" gutterBottom>
                  {flights.reduce((sum, flight) => sum + flight.availableSeats, 0)}
                </Typography>
                <Typography variant="h6" color="white">
                  Available Seats
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
                onClick={() => {
                  setEditingFlight(null);
                  resetForm();
                  setAddFlightDialog(true);
                }}
              >
                Add New Flight
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => fetchFlights(airline._id)}
              >
                Refresh Flights
              </Button>
            </Paper>
          </Grid>

          {/* Flights Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlightIcon /> Manage Flights
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Flight No.</TableCell>
                      <TableCell>Route</TableCell>
                      <TableCell>Timing</TableCell>
                      <TableCell>Operating Days</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Seats</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flights.map((flight) => (
                      <TableRow key={flight._id}>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {flight.flightNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {flight.source} → {flight.destination}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {flight.aircraftType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {flight.departure.time} - {flight.arrival.time}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {getOperatingDaysLabel(flight.operatingDays || []).split(', ').map(day => (
                              <Chip key={day} label={day} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={flight.class} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              ₹{flight.discount?.hasDiscount ? getDiscountedPrice(flight).toFixed(2) : flight.price}
                            </Typography>
                            {flight.discount?.hasDiscount && (
                              <Typography variant="caption" color="error" sx={{ textDecoration: 'line-through' }}>
                                ₹{flight.price}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {flight.availableSeats}/{flight.totalSeats}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={flight.isActive ? "Active" : "Inactive"} 
                            color={flight.isActive ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <MuiIconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEdit(flight)}
                            >
                              <EditIcon />
                            </MuiIconButton>
                            <MuiIconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(flight._id)}
                            >
                              <DeleteIcon />
                            </MuiIconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Add/Edit Flight Dialog */}
      <Dialog 
        open={addFlightDialog} 
        onClose={() => setAddFlightDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingFlight ? "Edit Flight" : "Add New Flight"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Flight Number"
                  value={flightForm.flightNumber}
                  onChange={(e) => handleFormChange("flightNumber", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aircraft Type"
                  value={flightForm.aircraftType}
                  onChange={(e) => handleFormChange("aircraftType", e.target.value)}
                  select
                >
                  {aircraftTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Source City"
                  value={flightForm.source}
                  onChange={(e) => handleFormChange("source", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destination City"
                  value={flightForm.destination}
                  onChange={(e) => handleFormChange("destination", e.target.value)}
                  required
                />
              </Grid>

              {/* Timing */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Departure Time"
                  type="time"
                  value={flightForm.departureTime}
                  onChange={(e) => {
                    handleFormChange("departureTime", e.target.value);
                    calculateDuration();
                  }}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Arrival Time"
                  type="time"
                  value={flightForm.arrivalTime}
                  onChange={(e) => {
                    handleFormChange("arrivalTime", e.target.value);
                    calculateDuration();
                  }}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  value={flightForm.duration}
                  InputProps={{ readOnly: true }}
                  helperText="Calculated automatically"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stops"
                  type="number"
                  value={flightForm.stops}
                  onChange={(e) => handleFormChange("stops", e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Operating Days */}
              <Grid item xs={12}>
  <FormControl fullWidth>
    <InputLabel shrink>Operating Days</InputLabel>
    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {daysOfWeek.map((day) => (
        <Chip
          key={day.value}
          label={day.label}
          clickable
          color={flightForm.operatingDays.includes(day.value) ? "primary" : "default"}
          variant={flightForm.operatingDays.includes(day.value) ? "filled" : "outlined"}
          onClick={() => handleOperatingDaysChange(day.value)}
          onDelete={flightForm.operatingDays.includes(day.value) ? () => handleOperatingDaysChange(day.value) : undefined}
          deleteIcon={flightForm.operatingDays.includes(day.value) ? <CloseIcon /> : undefined}
        />
      ))}
    </Box>
  </FormControl>
</Grid>

              {/* Class and Pricing */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Class"
                  value={flightForm.class}
                  onChange={(e) => handleFormChange("class", e.target.value)}
                  select
                >
                  {flightClasses.map(cls => (
                    <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price ($)"
                  type="number"
                  value={flightForm.price}
                  onChange={(e) => handleFormChange("price", e.target.value)}
                  required
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>

              {/* Seating */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Seats"
                  type="number"
                  value={flightForm.totalSeats}
                  onChange={(e) => handleFormChange("totalSeats", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Available Seats"
                  type="number"
                  value={flightForm.availableSeats}
                  onChange={(e) => handleFormChange("availableSeats", e.target.value)}
                  required
                />
              </Grid>

              {/* Baggage Allowance */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Baggage Allowance"
                  value={flightForm.baggageAllowance}
                  onChange={(e) => handleFormChange("baggageAllowance", e.target.value)}
                  placeholder="e.g., 20kg check-in, 7kg cabin"
                />
              </Grid>

              {/* Discount Section */}
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={flightForm.discount.hasDiscount}
                        onChange={(e) => handleFormChange("discount.hasDiscount", e.target.checked)}
                      />
                    }
                    label="Apply Discount"
                  />
                </FormGroup>
              </Grid>

              {flightForm.discount.hasDiscount && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Discount Type"
                      value={flightForm.discount.discountType}
                      onChange={(e) => handleFormChange("discount.discountType", e.target.value)}
                      select
                    >
                      <MenuItem value="percentage">Percentage (%)</MenuItem>
                      <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Discount Value"
                      type="number"
                      value={flightForm.discount.discountValue}
                      onChange={(e) => handleFormChange("discount.discountValue", e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {flightForm.discount.discountType === "percentage" ? "%" : "$"}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Discount Start Date"
                      type="date"
                      value={flightForm.discount.discountStartDate}
                      onChange={(e) => handleFormChange("discount.discountStartDate", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Discount End Date"
                      type="date"
                      value={flightForm.discount.discountEndDate}
                      onChange={(e) => handleFormChange("discount.discountEndDate", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              {/* Status */}
              <Grid item xs={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={flightForm.isActive}
                        onChange={(e) => handleFormChange("isActive", e.target.checked)}
                      />
                    }
                    label="Active Flight"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFlightDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            startIcon={editingFlight ? <EditIcon /> : <AddIcon />}
          >
            {editingFlight ? "Update Flight" : "Add Flight"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}