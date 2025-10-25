"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const steps = ['Passenger Details', 'Insurance & Review', 'Payment'];

export default function BookFlightPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const flightId = searchParams.get('flightId');

  const [activeStep, setActiveStep] = useState(0);
  const [flight, setFlight] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Form states
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    passportNumber: '',
    nationality: ''
  });

  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [contactDetails, setContactDetails] = useState({
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (flightId) {
      fetchFlightDetails();
      fetchInsurances();
    }
  }, [flightId]);

  const fetchFlightDetails = useCallback(async () => {
    try {
      // For now, we'll get flight details from localStorage or URL params
      // In a real app, you'd fetch from API using flightId
      const flightData = JSON.parse(localStorage.getItem('selectedFlight'));
      if (flightData) {
        setFlight(flightData);
      } else {
        // Fallback: redirect back to search
        router.push('/search-flights');
      }
    } catch (err) {
      console.error('Error fetching flight details:', err);
      router.push('/search-flights');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchInsurances = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/insurances');
      const data = await response.json();
      setInsurances(data);
    } catch (err) {
      console.error('Error fetching insurances:', err);
    }
  }, []);

  const validatePassengerDetails = () => {
    const newErrors = {};

    if (!passengerDetails.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!passengerDetails.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!passengerDetails.email.trim()) newErrors.email = 'Email is required';
    if (!passengerDetails.phone.trim()) newErrors.phone = 'Phone is required';
    if (!passengerDetails.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!passengerDetails.gender) newErrors.gender = 'Gender is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContactDetails = () => {
    const newErrors = {};

    if (!contactDetails.email.trim()) newErrors.contactEmail = 'Contact email is required';
    if (!contactDetails.phone.trim()) newErrors.contactPhone = 'Contact phone is required';

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
    setPassengerDetails(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleContactChange = (field, value) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[`contact${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({
        ...prev,
        [`contact${field.charAt(0).toUpperCase() + field.slice(1)}`]: ''
      }));
    }
  };

  const calculateTotal = () => {
    if (!flight) return 0;

    const flightAmount = flight.discount?.hasDiscount
      ? (flight.discount.discountType === "percentage"
          ? flight.price * (1 - flight.discount.discountValue / 100)
          : Math.max(0, flight.price - flight.discount.discountValue))
      : flight.price;

    const insuranceAmount = selectedInsurance
      ? insurances.find(i => i._id === selectedInsurance)?.price || 0
      : 0;

    return flightAmount + insuranceAmount;
  };

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Get userId from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Please log in to book a flight');
      }

      // Validate insurance selection if available
      if (insurances.length > 0 && selectedInsurance) {
        const selectedInsuranceDetails = insurances.find(i => i._id === selectedInsurance);
        if (!selectedInsuranceDetails) {
          setErrors(prev => ({ ...prev, insurance: 'Invalid insurance selection' }));
          return;
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
        specialRequests: contactDetails.specialRequests
      };

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

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
      // Create Razorpay order first
      const orderResponse = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotal() * 100, // Razorpay expects amount in paisa
          currency: 'INR',
          bookingId: booking.booking.bookingId
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Razorpay options
      const options = {
        key: 'rzp_test_your_key_here', // Replace with your test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Airline Reservation System',
        description: `Flight Booking - ${flight.flightNumber}`,
        order_id: orderData.id,
        handler: async function (response) {
          // Payment successful
          try {
            const verifyResponse = await fetch(`http://localhost:5000/api/bookings/${booking.booking._id}/payment`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                paymentStatus: 'completed'
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              setSuccess('Payment successful! Booking confirmed.');
              setPaymentDialog(false);
              setTimeout(() => {
                router.push('/bookings');
              }, 3000);
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (err) {
            setErrors({ payment: err.message });
            setPaymentLoading(false);
            setPaymentDialog(false);
          }
        },
        prefill: {
          name: `${passengerDetails.firstName} ${passengerDetails.lastName}`,
          email: passengerDetails.email,
          contact: passengerDetails.phone,
        },
        theme: {
          color: '#1976d2',
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
            setPaymentDialog(false);
          }
        }
      };

      // Initialize Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setErrors({ payment: err.message });
      setPaymentLoading(false);
      setPaymentDialog(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading flight details...</Typography>
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Flight not found</Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/search-flights')}
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
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon /> Passenger Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={passengerDetails.firstName}
                  onChange={(e) => handlePassengerChange('firstName', e.target.value)}
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
                  onChange={(e) => handlePassengerChange('lastName', e.target.value)}
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
                  onChange={(e) => handlePassengerChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={passengerDetails.phone}
                  onChange={(e) => handlePassengerChange('phone', e.target.value)}
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
                    onChange={(date) => handlePassengerChange('dateOfBirth', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth}
                        required
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={passengerDetails.gender}
                    onChange={(e) => handlePassengerChange('gender', e.target.value)}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors.gender && <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>{errors.gender}</Typography>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Passport Number (Optional)"
                  value={passengerDetails.passportNumber}
                  onChange={(e) => handlePassengerChange('passportNumber', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nationality (Optional)"
                  value={passengerDetails.nationality}
                  onChange={(e) => handlePassengerChange('nationality', e.target.value)}
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
            <Grid container spacing={4}>
                {/* Insurance Selection */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon /> Travel Insurance (Optional)
                </Typography>

                <FormControl component="fieldset" fullWidth error={!!errors.insurance}>
                  <RadioGroup
                    value={selectedInsurance}
                    onChange={(e) => {
                      setSelectedInsurance(e.target.value);
                      setErrors((prev) => ({ ...prev, insurance: '' }));
                    }}
                  >
                    <FormControlLabel
                      value=""
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">No insurance</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Continue without travel insurance coverage
                          </Typography>
                        </Box>
                      }
                    />
                    {insurances.map((insurance) => (
                      <Card key={insurance._id} sx={{ mb: 2, border: selectedInsurance === insurance._id ? 2 : 1, borderColor: selectedInsurance === insurance._id ? 'primary.main' : 'grey.300' }}>
                        <CardContent sx={{ pb: '16px !important' }}>
                          <FormControlLabel
                            value={insurance._id}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="h6">{insurance.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{insurance.description}</Typography>
                                <Typography variant="caption" display="block">{insurance.coverage}</Typography>
                                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>${insurance.price}</Typography>
                              </Box>
                            }
                            sx={{ width: '100%', alignItems: 'flex-start' }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Contact Details & Summary */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Contact Details</Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      type="email"
                      value={contactDetails.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      error={!!errors.contactEmail}
                      helperText={errors.contactEmail}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      value={contactDetails.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
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
                      rows={3}
                      value={contactDetails.specialRequests}
                      onChange={(e) => handleContactChange('specialRequests', e.target.value)}
                      placeholder="Any special requirements or requests..."
                    />
                  </Grid>
                </Grid>

                    {/* Booking Summary */}
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Booking Summary</Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>
                        Flight ({flight.source} → {flight.destination})
                        <Typography variant="caption" display="block" color="text.secondary">
                          {flight.flightNumber}
                        </Typography>
                      </Typography>
                      <Typography>${flight.price}</Typography>
                    </Box>                    {flight.discount?.hasDiscount && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                        <Typography>Discount</Typography>
                        <Typography>
                          -${flight.discount.discountType === "percentage"
                            ? (flight.price * flight.discount.discountValue / 100).toFixed(2)
                            : flight.discount.discountValue}
                        </Typography>
                      </Box>
                    )}

                    {selectedInsurance && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Insurance</Typography>
                        <Typography>${insurances.find(i => i._id === selectedInsurance)?.price || 0}</Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="primary">${calculateTotal().toFixed(2)}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <PaymentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Complete Your Payment</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Total Amount: ${calculateTotal().toFixed(2)}
              </Typography>

              {booking && (
                <Card sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Booking Details</Typography>
                    <Typography>Booking ID: {booking.booking.bookingId}</Typography>
                    <Typography>Passenger: {passengerDetails.firstName} {passengerDetails.lastName}</Typography>
                    <Typography>Flight: {flight.flightNumber}</Typography>
                  </CardContent>
                </Card>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handlePayment}
                disabled={paymentLoading}
                sx={{ minWidth: 200 }}
              >
                {paymentLoading ? <CircularProgress size={24} /> : 'Pay Now'}
              </Button>
            </Box>
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
            onClick={() => router.push('/search-flights')}
            sx={{ mb: 2 }}
          >
            Back to Search
          </Button>

          <Typography variant="h4" gutterBottom>
            Book Your Flight
          </Typography>

          {flight && (
            <Card sx={{ p: 2, background: theme.palette.primary.light + '20' }}>
              <Typography variant="h6">
                {flight.airline} - {flight.flightNumber}
              </Typography>
              <Typography>
                {flight.source} → {flight.destination} • {flight.departure.time} - {flight.arrival.time}
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
        <Paper sx={{ p: 4, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handlePayment : activeStep === 1 ? handleCreateBooking : handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Complete Payment' : activeStep === 1 ? 'Create Booking' : 'Next'}
          </Button>
        </Box>

        {/* Payment Processing Dialog */}
        <Dialog open={paymentDialog} onClose={() => {}}>
          <DialogTitle>Processing Payment</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
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
