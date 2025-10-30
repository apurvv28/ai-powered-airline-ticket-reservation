"use client";

import React from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import {
  Flight,
  LocationOn,
  Person,
  CalendarToday,
  Paid,
} from "@mui/icons-material";

const ETicket = React.forwardRef(({ booking }, ref) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Paper
      ref={ref}
      elevation={3}
      sx={{
        p: 4,
        maxWidth: "850px",
        margin: "40px auto",
        bgcolor: "white",
        color: "black",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#14213dff" }}>
          ✈️ SKYWINGS
        </Typography>
        <Box textAlign="right">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            E-Ticket
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Booking ID: <b>{booking.bookingId}</b>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: booking.status === "Confirmed" ? "green" : "red",
            }}
          >
            {booking.status}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* FLIGHT DETAILS */}
      <Typography
        variant="h6"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          color: "#14213dff",
        }}
      >
        <Flight /> Flight Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              From
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {booking.flightId?.source}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              To
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {booking.flightId?.destination}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Airline & Flight No.
        </Typography>
        <Typography variant="body1">
          {booking.flightId?.airline} - {booking.flightId?.flightNumber}
        </Typography>
        {booking.seatNumber && (
          <Typography variant="body1" sx={{ mt: 1 }}>
            Seat Number:{" "}
            <b style={{ color: "#14213dff" }}>{booking.seatNumber}</b>
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* PASSENGER DETAILS */}
      <Typography
        variant="h6"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          color: "#14213dff",
        }}
      >
        <Person /> Passenger Information
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">
            Name
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {booking.passengerId?.firstName} {booking.passengerId?.lastName}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">
            Contact Number
          </Typography>
          <Typography variant="body1">
            {booking.passengerId?.phone}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* TRAVEL & PAYMENT DETAILS */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              color: "#1a73e8",
            }}
          >
            <CalendarToday /> Travel Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date & Time
          </Typography>
          <Typography variant="body1">
            {formatDate(booking.travelDate)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
              color: "#1a73e8",
            }}
          >
            <Paid /> Payment Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Amount
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            ₹{booking.totalAmount?.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>

      {/* TERMS & CONDITIONS */}
      <Box
        sx={{
          mt: 4,
          bgcolor: "#f7f9fc",
          p: 2,
          borderRadius: 1,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Important Information
        </Typography>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>Arrive at the airport at least 2 hours before departure.</li>
          <li>Carry a valid government-issued photo ID proof.</li>
          <li>
            This e-ticket is valid only for the mentioned passenger and date.
          </li>
          <li>
            For changes or cancellations, contact Skywings customer support.
          </li>
        </ul>
      </Box>

      {/* FOOTER */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Thank you for choosing <b>SKYWINGS</b>. Have a pleasant journey!
        </Typography>
        <Typography
          variant="caption"
          display="block"
          sx={{ mt: 1, color: "gray" }}
        >
          This is a computer-generated e-ticket and does not require a signature.
        </Typography>
      </Box>
    </Paper>
  );
});

ETicket.displayName = "ETicket";
export default ETicket;
