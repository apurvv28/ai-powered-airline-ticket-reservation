"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Avatar,
  Divider,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  Flight,
  Person,
  CalendarToday,
  Payment,
  CheckCircle,
  Cancel,
  Schedule,
  ArrowBack,
  Refresh,
  Info
} from "@mui/icons-material";
import { motion } from "framer-motion";

export default function BookingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');

      // Get userId from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/bookings`);

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle />;
      case 'pending':
        return <Schedule />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Info />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading your bookings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/home')}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Bookings
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchUserBookings}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* No Bookings */}
      {bookings.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Flight sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven&pos;t made any bookings yet. Start by searching for flights!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/search-flights')}
          >
            Search Flights
          </Button>
        </Box>
      )}

      {/* Bookings List */}
      <Grid container spacing={3}>
        {bookings.map((booking, index) => (
          <Grid item xs={12} key={booking._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
                onClick={() => handleViewDetails(booking)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <Flight />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {booking.flightId?.airline} - {booking.flightId?.flightNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Booking ID: {booking.bookingId}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      icon={getStatusIcon(booking.status)}
                      label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      color={getStatusColor(booking.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Flight sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Route
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {booking.flightId?.source} → {booking.flightId?.destination}
                      </Typography>
                    </Grid>

                    {booking.seatNumber && (
                      <Grid item xs={12} md={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Person sx={{ color: 'primary.main', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Seat
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {booking.seatNumber}
                        </Typography>
                      </Grid>
                    )}

                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Travel Date
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {formatDate(booking.travelDate)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Payment sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary">
                        ${booking.totalAmount?.toFixed(2)}
                      </Typography>
                      {booking.status === 'confirmed' && !booking.seatNumber && (
                        <Typography variant="caption" color="warning.main">
                          Seat will be assigned after payment
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">
                      Booked on {formatDate(booking.createdAt)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Flight />
          Booking Details
          <Chip
            icon={selectedBooking ? getStatusIcon(selectedBooking.status) : null}
            label={selectedBooking ? selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1) : ''}
            color={selectedBooking ? getStatusColor(selectedBooking.status) : 'default'}
            size="small"
            sx={{ ml: 'auto' }}
          />
        </DialogTitle>

        <DialogContent dividers>
          {selectedBooking && (
            <Box>
              {/* Flight Information */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flight /> Flight Information
              </Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Flight Number</Typography>
                      <Typography variant="body1">{selectedBooking.flightId?.flightNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Airline</Typography>
                      <Typography variant="body1">{selectedBooking.flightId?.airline}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Route</Typography>
                      <Typography variant="body1">
                        {selectedBooking.flightId?.source} → {selectedBooking.flightId?.destination}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Travel Date</Typography>
                      <Typography variant="body1">{formatDate(selectedBooking.travelDate)}</Typography>
                    </Grid>
                    {selectedBooking.seatNumber && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Seat Number</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {selectedBooking.seatNumber}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Passenger Information */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Passenger Information
              </Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">
                        {selectedBooking.passengerId?.firstName} {selectedBooking.passengerId?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{selectedBooking.passengerId?.email}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{selectedBooking.passengerId?.phone}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">{selectedBooking.passengerId?.gender}</Typography>
                    </Grid>
                    {selectedBooking.passengerId?.passportNumber && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Passport Number</Typography>
                        <Typography variant="body1">{selectedBooking.passengerId.passportNumber}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment /> Payment Information
              </Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Booking ID</Typography>
                      <Typography variant="body1">{selectedBooking.bookingId}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                      <Typography variant="body1">{selectedBooking.paymentStatus}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Flight Amount</Typography>
                      <Typography variant="body1">${selectedBooking.flightAmount?.toFixed(2)}</Typography>
                    </Grid>
                    {selectedBooking.insuranceAmount > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Insurance Amount</Typography>
                        <Typography variant="body1">${selectedBooking.insuranceAmount?.toFixed(2)}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h6" color="primary">${selectedBooking.totalAmount?.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Contact Email</Typography>
                      <Typography variant="body1">{selectedBooking.contactEmail}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Contact Phone</Typography>
                      <Typography variant="body1">{selectedBooking.contactPhone}</Typography>
                    </Grid>
                    {selectedBooking.specialRequests && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Special Requests</Typography>
                        <Typography variant="body1">{selectedBooking.specialRequests}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Insurance Information */}
              {selectedBooking.insuranceId && (
                <>
                  <Typography variant="h6" gutterBottom>Insurance Information</Typography>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="body1">{selectedBooking.insuranceId.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBooking.insuranceId.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Coverage: {selectedBooking.insuranceId.coverage}
                      </Typography>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Booking Timeline */}
              <Typography variant="h6" gutterBottom>Booking Timeline</Typography>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Booking Created</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(selectedBooking.createdAt)}
                      </Typography>
                    </Box>
                    {selectedBooking.updatedAt && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Last Updated</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(selectedBooking.updatedAt)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
