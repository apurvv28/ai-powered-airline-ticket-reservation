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
  const generateETicketPDF = async (booking) => {
  try {
    // Debug: Log the booking structure to console
    console.log("Full booking structure:", JSON.stringify(booking, null, 2));
    
    let passengerData = null;
    
    // Check if passengerId is already populated (object) or just an ID (string)
    if (booking.passengerId && typeof booking.passengerId === 'object' && booking.passengerId._id) {
      // Passenger data is already populated in the booking
      passengerData = booking.passengerId;
      console.log("Using populated passenger data:", passengerData);
    } else if (booking.passengerId && typeof booking.passengerId === 'string') {
      // Fetch passenger details from the database using passengerId
      try {
        const response = await fetch(`http://localhost:5000/api/passengers/${booking.passengerId}`);
        if (response.ok) {
          passengerData = await response.json();
          console.log("Fetched passenger data:", passengerData);
        } else {
          console.error("Failed to fetch passenger data:", response.status);
        }
      } catch (fetchError) {
        console.error("Error fetching passenger data:", fetchError);
      }
    }

    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header with SkyWings branding
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('SKYWINGS', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('E-TICKET', pageWidth / 2, 25, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('ELECTRONIC TICKET', 14, 45);
    
    // Booking Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Booking Reference:', 14, 55);
    doc.setFont(undefined, 'normal');
    doc.text(booking.bookingId, 60, 55);
    
    doc.setFont(undefined, 'bold');
    doc.text('Status:', 14, 62);
    doc.setFont(undefined, 'normal');
    doc.text(booking.status.toUpperCase(), 60, 62);
    
    // Flight Details Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('FLIGHT DETAILS', 14, 75);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Airline:', 14, 85);
    doc.setFont(undefined, 'normal');
    doc.text(booking.flightId?.airline || 'N/A', 60, 85);
    
    doc.setFont(undefined, 'bold');
    doc.text('Flight Number:', 14, 92);
    doc.setFont(undefined, 'normal');
    doc.text(booking.flightId?.flightNumber || 'N/A', 60, 92);
    
    doc.setFont(undefined, 'bold');
    doc.text('Route:', 14, 99);
    doc.setFont(undefined, 'normal');
    doc.text(`${booking.flightId?.source} To ${booking.flightId?.destination}`, 60, 99);
    
    doc.setFont(undefined, 'bold');
    doc.text('Departure:', 14, 106);
    doc.setFont(undefined, 'normal');
    doc.text(booking.flightId?.departure?.time || 'N/A', 60, 106);
    
    doc.setFont(undefined, 'bold');
    doc.text('Arrival:', 14, 113);
    doc.setFont(undefined, 'normal');
    doc.text(booking.flightId?.arrival?.time || 'N/A', 60, 113);
    
    // Passenger Details Section - USING AVAILABLE PASSENGER DATA
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('PASSENGER DETAILS', 14, 130);
    
    doc.setFontSize(10);
    
    // Use available passenger data
    let passengerName = 'N/A';
    let passengerEmail = 'N/A';
    let passengerPhone = 'N/A';
    
    if (passengerData && passengerData.firstName && passengerData.lastName) {
      // Use passenger data (either populated or fetched)
      passengerName = `${passengerData.firstName} ${passengerData.lastName}`;
      passengerEmail = passengerData.email || booking.contactEmail || 'N/A';
      passengerPhone = passengerData.phone || booking.contactPhone || 'N/A';
    } else {
      // Final fallback to contact information
      passengerName = booking.passengerName || 'N/A';
      passengerEmail = booking.contactEmail || 'N/A';
      passengerPhone = booking.contactPhone || 'N/A';
    }
    
    doc.setFont(undefined, 'bold');
    doc.text('Name:', 14, 140);
    doc.setFont(undefined, 'normal');
    doc.text(passengerName, 60, 140);
    
    doc.setFont(undefined, 'bold');
    doc.text('Email:', 14, 147);
    doc.setFont(undefined, 'normal');
    doc.text(passengerEmail, 60, 147);
    
    doc.setFont(undefined, 'bold');
    doc.text('Phone:', 14, 154);
    doc.setFont(undefined, 'normal');
    doc.text(passengerPhone, 60, 154);
    
    if (booking.seatNumber) {
      doc.setFont(undefined, 'bold');
      doc.text('Seat Number:', 14, 161);
      doc.setFont(undefined, 'normal');
      doc.text(booking.seatNumber, 60, 161);
    }
    
    // Travel Details Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TRAVEL DETAILS', 14, 180);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Travel Date:', 14, 190);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(booking.travelDate).toLocaleDateString(), 60, 190);
    
    doc.setFont(undefined, 'bold');
    doc.text('Booking Date:', 14, 197);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(booking.createdAt).toLocaleDateString(), 60, 197);
    
    // Payment Details Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('PAYMENT DETAILS', 14, 215);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Total Amount:', 14, 225);
    doc.setFont(undefined, 'normal');
    doc.text(`Rs.${booking.totalAmount?.toFixed(2)}`, 60, 225);
    
    // Important Information Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('IMPORTANT INFORMATION', 14, 245);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    const importantInfo = [
      "• Arrive at the airport at least 2 hours before departure.",
      "• Carry a valid government-issued photo ID proof.",
      "• This e-ticket is valid only for the mentioned passenger and date.",
      "• For changes or cancellations, contact Skywings customer support.",
      "• Thank you for choosing SKYWINGS. Have a pleasant journey!",
      " ",
      "This is a computer-generated e-ticket and does not require a signature."
    ];
    
    let yPosition = 255;
    importantInfo.forEach(line => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 14, yPosition);
      yPosition += 6;
    });
    
    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated by SkyWings Airlines • ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' });
    
    // Save PDF
    const fileName = `SkyWings_E-Ticket_${booking.bookingId}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
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
          <Button
            startIcon={<Refresh />}
            onClick={fetchUserBookings}
            variant="outlined"
          >
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
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/search-flights")}
          >
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
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                },
              }}
              onClick={() => handleViewDetails(booking)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Flight />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {booking.flightId?.airline} -{" "}
                        {booking.flightId?.flightNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Booking ID: {booking.bookingId}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    icon={getStatusIcon(booking.status)}
                    label={
                      booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)
                    }
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
                      {booking.flightId?.source} →{" "}
                      {booking.flightId?.destination}
                    </Typography>
                  </Grid>

                  {booking.seatNumber && (
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">
                        Seat
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary"
                      >
                        {booking.seatNumber}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Travel Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(booking.travelDate)}
                    </Typography>
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

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Booked on {formatDate(booking.createdAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for booking details */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Flight /> Booking Details
          {selectedBooking && (
            <Chip
              icon={getStatusIcon(selectedBooking.status)}
              label={
                selectedBooking.status.charAt(0).toUpperCase() +
                selectedBooking.status.slice(1)
              }
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
            <>
              <Button
                startIcon={<Print />}
                onClick={() => generateETicketPDF(selectedBooking)}
                color="primary"
                variant="contained"
              >
                Download E-Ticket PDF
              </Button>
            </>
          )}
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
