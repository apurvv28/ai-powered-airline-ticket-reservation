"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  Box,
  Paper,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import PaymentIcon from "@mui/icons-material/Payment";
import FlightIcon from "@mui/icons-material/Flight";
import ContactMailIcon from "@mui/icons-material/ContactMail";

const steps = ["Passenger Details", "Insurance & Review", "Payment"];

export default function BookFlightPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const flightId = searchParams.get("flightId");

  const [activeStep, setActiveStep] = useState(0);
  const [flight, setFlight] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Form states
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: null,
    gender: "",
    passportNumber: "",
    nationality: "",
  });

  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const fetchFlightDetails = useCallback(async () => {
    try {
      const flightData = JSON.parse(localStorage.getItem("selectedFlight"));
      const userData = JSON.parse(localStorage.getItem("user"));

      if (flightData && userData) {
        setFlight(flightData);
        // Set passenger email from logged-in user (non-editable)
        setPassengerDetails((prev) => ({
          ...prev,
          email: userData.email,
        }));
        // Set contact email from logged-in user
        setContactDetails((prev) => ({
          ...prev,
          email: userData.email,
        }));
      } else {
        router.push("/search-flights");
      }
    } catch (err) {
      console.error("Error fetching flight details:", err);
      router.push("/search-flights");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchInsurances = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/insurances");
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const data = await response.json();
      setInsurances(data);
    } catch (err) {
      console.error("Error fetching insurances:", err);
    }
  }, []);

  useEffect(() => {
    if (flightId) {
      fetchFlightDetails();
      fetchInsurances();
    }
  }, [flightId, fetchFlightDetails, fetchInsurances]);

  const validatePassengerDetails = () => {
    const newErrors = {};

    if (!passengerDetails.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!passengerDetails.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!passengerDetails.email.trim()) newErrors.email = "Email is required";
    if (!passengerDetails.phone.trim()) newErrors.phone = "Phone is required";
    if (!passengerDetails.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!passengerDetails.gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContactDetails = () => {
    const newErrors = {};

    if (!contactDetails.email.trim())
      newErrors.contactEmail = "Contact email is required";
    if (!contactDetails.phone.trim())
      newErrors.contactPhone = "Contact phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!validatePassengerDetails()) return;
    } else if (activeStep === 1) {
      if (!validateContactDetails()) return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePassengerChange = (field, value) => {
    setPassengerDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleContactChange = (field, value) => {
    setContactDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[`contact${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors((prev) => ({
        ...prev,
        [`contact${field.charAt(0).toUpperCase() + field.slice(1)}`]: "",
      }));
    }
  };

  const calculateTotal = () => {
    if (!flight) return 0;

    const flightAmount = flight.discount?.hasDiscount
      ? flight.discount.discountType === "percentage"
        ? flight.price * (1 - flight.discount.discountValue / 100)
        : Math.max(0, flight.price - flight.discount.discountValue)
      : flight.price;

    const insuranceAmount = selectedInsurance
      ? insurances.find((i) => i._id === selectedInsurance)?.price || 0
      : 0;

    return flightAmount + insuranceAmount;
  };

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Get userId from localStorage
      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("Please log in to book a flight");
      }

      // Validate insurance selection if available
      if (insurances.length > 0 && selectedInsurance) {
        const selectedInsuranceDetails = insurances.find(
          (i) => i._id === selectedInsurance
        );
        if (!selectedInsuranceDetails) {
          throw new Error("Selected insurance not found");
        }
      }

      const user = JSON.parse(userData);

      const bookingData = {
        userId: user._id,
        flightId: flight._id,
        passengerDetails,
        insuranceId: selectedInsurance || null,
        travelDate: flight.calculatedDeparture?.date || new Date(),
        contactEmail: contactDetails.email,
        contactPhone: contactDetails.phone,
        specialRequests: contactDetails.specialRequests,
      };

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();

      setBooking(data);
      setActiveStep(2); // Move to payment step
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    setPaymentLoading(true);
    setPaymentDialog(true);

    try {
      // Simulate payment processing with 4-5 second delay
      setTimeout(async () => {
        // After delay, call the payment confirmation endpoint
        const paymentResponse = await fetch(
          `http://localhost:5000/api/bookings/${booking.booking._id}/payment`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentId: `pay_sim_${Date.now()}`,
              orderId: `order_sim_${Date.now()}`,
              paymentStatus: "completed",
            }),
          }
        );

        if (!paymentResponse.ok) {
          const text = await paymentResponse.text();
          throw new Error(`HTTP ${paymentResponse.status}: ${text}`);
        }

        setSuccess(
          "Payment processed successfully! Your booking is confirmed."
        );
        setPaymentDialog(false);
        router.push("/bookings");
      }, 4500); // 4.5 seconds delay
    } catch (err) {
      setErrors({ payment: err.message });
      setPaymentLoading(false);
      setPaymentDialog(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading flight details...
        </Typography>
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          Flight not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/search-flights")}
          sx={{ mt: 2 }}
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <PersonIcon /> Passenger Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={passengerDetails.firstName}
                  onChange={(e) =>
                    handlePassengerChange("firstName", e.target.value)
                  }
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={passengerDetails.lastName}
                  onChange={(e) =>
                    handlePassengerChange("lastName", e.target.value)
                  }
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={passengerDetails.email}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Email cannot be changed (logged-in user email)"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={passengerDetails.phone}
                  onChange={(e) =>
                    handlePassengerChange("phone", e.target.value)
                  }
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={passengerDetails.dateOfBirth}
                    onChange={(date) =>
                      handlePassengerChange("dateOfBirth", date)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={passengerDetails.gender}
                    onChange={(e) =>
                      handlePassengerChange("gender", e.target.value)
                    }
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors.gender && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, ml: 2 }}
                    >
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Passport Number (Optional)"
                  value={passengerDetails.passportNumber}
                  onChange={(e) =>
                    handlePassengerChange("passportNumber", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nationality (Optional)"
                  value={passengerDetails.nationality}
                  onChange={(e) =>
                    handlePassengerChange("nationality", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <SecurityIcon /> Insurance Options
            </Typography>

            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset">
                <RadioGroup
                  value={selectedInsurance}
                  onChange={(e) => setSelectedInsurance(e.target.value)}
                >
                  <Grid container spacing={2}>
                    {insurances.map((insurance) => (
                      <Grid item xs={12} key={insurance._id}>
                        <Paper sx={{ p: 2 }}>
                          <FormControlLabel
                            value={insurance._id}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="subtitle1">
                                  {insurance.name} - ₹{insurance.price}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {insurance.description}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Coverage: {insurance.coverage}
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <FormControlLabel
                          value=""
                          control={<Radio />}
                          label="No insurance"
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </FormControl>
            </Box>

            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 4 }}
            >
              <ContactMailIcon /> Contact Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={contactDetails.email}
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="Email cannot be changed (logged-in user email)"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={contactDetails.phone}
                  onChange={(e) => handleContactChange("phone", e.target.value)}
                  error={!!errors.contactPhone}
                  helperText={errors.contactPhone}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Requests (Optional)"
                  multiline
                  rows={4}
                  value={contactDetails.specialRequests}
                  onChange={(e) =>
                    handleContactChange("specialRequests", e.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Booking Summary
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Flight Details</Typography>
                    <Typography variant="body2">
                      {flight.airline} - {flight.flightNumber}
                    </Typography>
                    <Typography variant="body2">
                      {flight.source} → {flight.destination}
                    </Typography>
                    <Typography variant="body2">
                      Departure:{" "}
                      {new Date(
                        flight.calculatedDeparture.date
                      ).toLocaleDateString()}{" "}
                      {flight.departure.time}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Passenger</Typography>
                    <Typography variant="body2">
                      {passengerDetails.firstName} {passengerDetails.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Price Breakdown</Typography>
                    <Typography variant="body2">
                      Flight Fare: ₹{flight.price}
                    </Typography>
                    {selectedInsurance && (
                      <Typography variant="body2">
                        Insurance: ₹
                        {insurances.find((i) => i._id === selectedInsurance)
                          ?.price || 0}
                      </Typography>
                    )}
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      Total Amount: ₹{calculateTotal()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <PaymentIcon /> Payment
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Booking Reference: {booking?.booking.bookingId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total Amount to Pay: ₹{calculateTotal()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click &ldquo;Complete Payment&rdquo; to proceed with the
                payment.
              </Typography>
            </Paper>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/search-flights")}
            sx={{ mb: 2 }}
          >
            Back to Search
          </Button>

          <Typography variant="h4" gutterBottom>
            Book Your Flight
          </Typography>

          {flight && (
            <Card sx={{ p: 2, background: theme.palette.primary.light + "20" }}>
              <Typography variant="h6">
                {flight.airline} - {flight.flightNumber}
              </Typography>
              <Typography>
                {flight.source} → {flight.destination} • {flight.departure.time}{" "}
                - {flight.arrival.time}
              </Typography>
            </Card>
          )}
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Messages */}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        {errors.payment && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.payment}
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Step Content */}
        <Paper sx={{ p: 4, mb: 4 }}>{renderStepContent(activeStep)}</Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={
              activeStep === steps.length - 1
                ? handlePayment
                : activeStep === 1
                ? handleCreateBooking
                : handleNext
            }
            disabled={loading}
          >
            {activeStep === steps.length - 1
              ? "Complete Payment"
              : activeStep === 1
              ? "Create Booking"
              : "Next"}
          </Button>
        </Box>

        {/* Payment Processing Dialog */}
        <Dialog open={paymentDialog} onClose={() => {}}>
          <DialogTitle>Processing Payment</DialogTitle>
          <DialogContent sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography>Processing your payment...</Typography>
            <Typography variant="body2" color="text.secondary">
              Please do not close this window
            </Typography>
          </DialogContent>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
