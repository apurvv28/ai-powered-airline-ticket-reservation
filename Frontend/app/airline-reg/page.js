"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Card,
  CardContent,
  Grid,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";

export default function AirlineRegistration() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    airlineName: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [credentials, setCredentials] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setCredentials(null);

    try {
      const response = await fetch("http://localhost:5000/api/airlines/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess("Airline registered successfully!");
      setCredentials(data.credentials);
      setFormData({
        airlineName: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
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
            Airline Registration
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Register your airline to start listing flights
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={credentials ? 7 : 12}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              {success && !credentials && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Airline Name"
                  name="airlineName"
                  value={formData.airlineName}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  margin="normal"
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  {loading ? "Registering..." : "Register Airline"}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {credentials && (
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.info.main}15)`,
                    border: `2px solid ${theme.palette.success.main}30`,
                    borderRadius: 3
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="success.main" sx={{ fontWeight: 'bold' }}>
                      ✓ Registration Successful
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Save these credentials securely:
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Username
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          backgroundColor: 'background.default',
                          fontFamily: 'monospace',
                          fontWeight: 'bold'
                        }}
                      >
                        {credentials.username}
                      </Paper>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          backgroundColor: 'background.default',
                          fontFamily: 'monospace',
                          fontWeight: 'bold'
                        }}
                      >
                        {credentials.password}
                      </Paper>
                    </Box>

                    <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
                      Important: Save these credentials. You will need them to access your admin panel.
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Container>
  );
}