"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  Fade,
  Grow,
  Container,
  InputAdornment,
  IconButton,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Flight,
  PersonAdd,
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Lock,
  Business,
} from "@mui/icons-material";

export default function RegisterPage() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      // Create new user by calling backend register endpoint
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      });

      if (response.status === 409) {
        setError("User with this email already exists");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(errText || "Failed to register user");
      }

      const newUser = await response.json();

      setSuccess("Registration successful! Redirecting to login...");

      // Optionally store the user (server returns user without password)
      setTimeout(() => {
        try {
          localStorage.setItem("user", JSON.stringify(newUser));
          localStorage.setItem("isLoggedIn", "true");
        } catch (e) {
          // ignore storage errors
        }
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleAirlineRedirect = () => {
    router.push("/airline-reg");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        }}
      >
        <Fade in={true} timeout={300}>
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, sm: 4 },
              width: "100%",
              maxWidth: 500,
              background: theme.palette.background.default,
              borderRadius: 3,
              border: `1px solid ${theme.palette.grey[300]}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Grow in={true} timeout={500}>
                <Flight
                  sx={{
                    fontSize: 48,
                    color: theme.palette.primary.main,
                    mb: 2,
                    filter: "drop-shadow(0 0 20px rgba(20, 33, 61, 0.3))",
                  }}
                />
              </Grow>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
                color={theme.palette.text.primary}
              >
                Join SkyWings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account and start your journey
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  {success}
                </Alert>
              )}

              <Box sx={{ display: "flex", gap: 2 }}>
                <Grow in={true} timeout={700}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Enter your first name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonAdd color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                </Grow>

                <Grow in={true} timeout={800}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="Enter your last name"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                </Grow>
              </Box>

              <Grow in={true} timeout={900}>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grow>

              <Grow in={true} timeout={1000}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your phone number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grow>

              <Grow in={true} timeout={1100}>
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Create a strong password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                  helperText="Password must be at least 6 characters long"
                />
              </Grow>

              <Grow in={true} timeout={1200}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<PersonAdd />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      background: theme.palette.secondary.dark,
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 25px ${theme.palette.secondary.main}40`,
                      "&::before": {
                        transform: "translateX(100%)",
                      },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transition: "transform 0.6s ease",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Grow>

              {/* Divider with "or" */}
              <Grow in={true} timeout={1300}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                    OR
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>
              </Grow>

              {/* Airline Registration Button */}
              <Grow in={true} timeout={1400}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Business />}
                  onClick={handleAirlineRedirect}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      color: theme.palette.primary.dark,
                      backgroundColor: `${theme.palette.primary.main}10`,
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 15px ${theme.palette.primary.main}20`,
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Register Your Airline
                </Button>
              </Grow>

              <Grow in={true} timeout={1500}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Button
                      component="a"
                      href="/login"
                      variant="text"
                      sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                        "&:hover": {
                          background: "none",
                          color: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Sign in here
                    </Button>
                  </Typography>
                </Box>
              </Grow>
            </Box>

            {/* Terms and Conditions */}
            <Grow in={true} timeout={1600}>
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  By creating an account, you agree to our{" "}
                  <Button
                    component="a"
                    href="/terms"
                    variant="text"
                    sx={{
                      textTransform: "none",
                      fontSize: "inherit",
                      color: theme.palette.primary.main,
                      minWidth: "auto",
                      p: 0,
                      verticalAlign: "baseline",
                      "&:hover": {
                        background: "none",
                        color: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Terms of Service
                  </Button>{" "}
                  and{" "}
                  <Button
                    component="a"
                    href="/privacy"
                    variant="text"
                    sx={{
                      textTransform: "none",
                      fontSize: "inherit",
                      color: theme.palette.primary.main,
                      minWidth: "auto",
                      p: 0,
                      verticalAlign: "baseline",
                      "&:hover": {
                        background: "none",
                        color: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Privacy Policy
                  </Button>
                </Typography>
              </Box>
            </Grow>

            {/* Airline Registration Info */}
            <Grow in={true} timeout={1700}>
              <Paper
                variant="outlined"
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: `${theme.palette.info.main}08`,
                  borderColor: theme.palette.info.main,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Business 
                    sx={{ 
                      fontSize: 20, 
                      color: theme.palette.info.main,
                      mt: 0.25 
                    }} 
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold" color="info.main" gutterBottom>
                      Airline Partner?
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Register your airline to list flights, manage bookings, and reach thousands of travelers on our platform.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grow>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
}