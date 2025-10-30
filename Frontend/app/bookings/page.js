"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
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
  Info,
  Print,
} from "@mui/icons-material";
import dynamic from "next/dynamic";

// ✅ Dynamically import ETicket with SSR disabled
const ETicket = dynamic(() => import("../components/ETicket"), {
  ssr: false,
  loading: () => <div>Loading ticket...</div>,
});

export default function BookingsPage() {
  const theme = useTheme();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const ticketRef = useRef(null);

  // ✅ React-to-print setup with A4 layout
  const handlePrint = useReactToPrint({
    content: () => ticketRef.current,
    documentTitle: selectedBooking
      ? `Skywings_E-Ticket_${selectedBooking.bookingId}`
      : "Skywings_E-Ticket",
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => setIsPrinting(false),
    removeAfterPrint: true,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  // ✅ Safe wrapper to avoid undefined errors
  const handleSafePrint = useCallback(() => {
    if (!selectedBooking || !ticketRef.current) {
      console.error("Print aborted: No booking or ref");
      return;
    }
    try {
      handlePrint();
    } catch (err) {
      console.error("Print error:", err);
      setIsPrinting(false);
    }
  }, [selectedBooking, handlePrint]);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const userData = localStorage.getItem("user");
      if (!userData) {
        setError("Please log in to view your bookings");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(
        `http://localhost:5000/api/users/${user._id}/bookings`
      );

      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "refunded":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle />;
      case "pending":
        return <Schedule />;
      case "cancelled":
        return <Cancel />;
      default:
        return <Info />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedBooking(null);
    setIsPrinting(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your bookings...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/home")}>
          Back to Home
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">My Bookings</Typography>
          <Button startIcon={<Refresh />} onClick={fetchUserBookings} variant="outlined">
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 && !error && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Flight sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven&apos;t made any bookings yet.
          </Typography>
          <Button variant="contained" size="large" onClick={() => router.push("/search-flights")}>
            Search Flights
          </Button>
        </Box>
      )}

      {/* Bookings List */}
      <Grid container spacing={3}>
        {bookings.map((booking) => (
          <Grid item xs={12} key={booking._id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "0.3s",
                width: { xs: "100%", sm: "100%", md: "100%", lg: "36vw" },
                "&:hover": { transform: "translateY(-4px)", boxShadow: theme.shadows[8] },
              }}
              onClick={() => handleViewDetails(booking)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                    <Typography variant="body2" color="text.secondary">
                      Route
                    </Typography>
                    <Typography variant="body1">
                      {booking.flightId?.source} → {booking.flightId?.destination}
                    </Typography>
                  </Grid>

                  {booking.seatNumber && (
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Seat
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {booking.seatNumber}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Travel Date
                    </Typography>
                    <Typography variant="body1">{formatDate(booking.travelDate)}</Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{booking.totalAmount?.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Booked on {formatDate(booking.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for booking details */}
      <Dialog open={detailsDialog} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Flight /> Booking Details
          {selectedBooking && (
            <Chip
              icon={getStatusIcon(selectedBooking.status)}
              label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              color={getStatusColor(selectedBooking.status)}
              size="small"
              sx={{ ml: "auto" }}
            />
          )}
        </DialogTitle>

        <DialogContent dividers>
          {selectedBooking && (
            <ETicket ref={ticketRef} booking={selectedBooking} />
          )}
        </DialogContent>

        <DialogActions>
          {selectedBooking && selectedBooking.status === "confirmed" && (
            <Button
              startIcon={isPrinting ? <CircularProgress size={16} /> : <Print />}
              onClick={handleSafePrint}
              color="primary"
              variant="contained"
              disabled={isPrinting}
            >
              {isPrinting ? "Preparing..." : "Print E-Ticket"}
            </Button>
          )}
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
