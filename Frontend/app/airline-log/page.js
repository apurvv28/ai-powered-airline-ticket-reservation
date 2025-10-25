"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import { Business } from "@mui/icons-material";

export default function AirlineLoginPage() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

    try {
      // Check for empty fields
      if (!formData.username || !formData.password) {
        throw new Error("Username and password are required");
      }

      // Make sure username follows the expected format
      if (!formData.username.endsWith('@skywings')) {
        throw new Error("Username must be in the format: airlinename@skywings");
      }

      const response = await fetch("http://localhost:5000/api/airlines/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      if (!data.airline || !data.token) {
        throw new Error("Invalid server response. Please try again.");
      }

      // Store airline info and redirect to dashboard
      localStorage.setItem("airline", JSON.stringify(data.airline));
      localStorage.setItem("airlineToken", data.token);
      localStorage.setItem("isAirlineLoggedIn", "true");
      localStorage.setItem("lastLogin", new Date().toISOString());

      // Redirect to airline dashboard
      router.push("/airline-dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
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
            Airline Login
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Access your airline admin panel
          </Typography>
        </Box>

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

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              margin="normal"
              sx={{ mb: 3 }}
              placeholder="yourname@skywings"
              helperText="Enter your airline username (e.g., airindia@skywings)"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              sx={{ mb: 4 }}
              placeholder="Enter your password"
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
                fontSize: '1.1rem',
                background: theme.palette.primary.main,
                '&:hover': {
                  background: theme.palette.primary.dark,
                }
              }}
            >
              {loading ? "Signing In..." : "Sign In to Admin Panel"}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don&pos;t have an airline account?{" "}
              <Button 
                onClick={() => router.push("/airline-reg")}
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                Register your airline
              </Button>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}