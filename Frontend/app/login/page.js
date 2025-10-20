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
  useTheme,
  Divider,
} from "@mui/material";
import { Flight, Login, Business } from "@mui/icons-material";

export default function LoginPage() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed" }));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const user = data.user;

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      // Dispatch login event for Navbar to update
      window.dispatchEvent(new Event("login"));

      // Redirect to home page
      router.push("/home");
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAirlineLogin = () => {
    router.push("/airline-log");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        }}
      >
        <Fade in={true} timeout={300}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              width: "100%",
              maxWidth: 400,
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
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your SkyWings account
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

              <Grow in={true} timeout={700}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your email"
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

              <Grow in={true} timeout={900}>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your password"
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
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<Login />}
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
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </Grow>

              {/* Divider with "or" */}
              <Grow in={true} timeout={1200}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                    OR
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>
              </Grow>

              {/* Airline Login Button */}
              <Grow in={true} timeout={1300}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Business />}
                  onClick={handleAirlineLogin}
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
                  Airline Partner Login
                </Button>
              </Grow>

              <Grow in={true} timeout={1400}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Don&apos;t have an account?{" "}
                    <Button
                      component="a"
                      href="/register"
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
                      Sign up here
                    </Button>
                  </Typography>
                </Box>
              </Grow>
            </Box>

            {/* Airline Registration Info */}
            <Grow in={true} timeout={1500}>
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
                      Access your airline dashboard to manage flights, bookings, and view analytics.
                      <br />
                      <Button
                        component="a"
                        href="/airline-reg"
                        variant="text"
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontSize: "inherit",
                          color: theme.palette.info.main,
                          fontWeight: "bold",
                          p: 0,
                          mt: 0.5,
                          "&:hover": {
                            background: "none",
                            color: theme.palette.info.dark,
                          },
                        }}
                      >
                        Register your airline
                      </Button>{" "}
                      If you don&pos;t have an account yet.
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