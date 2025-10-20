"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import {
  Flight,
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Support", href: "/support" },
    { label: "FAQ", href: "/faq" },
  ];

  const services = [
    { label: "Flight Booking", href: "/search-flights" },
    { label: "Hotel Booking", href: "/hotels" },
    { label: "Car Rental", href: "/car-rental" },
    { label: "Travel Insurance", href: "/insurance" },
  ];

  const legal = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: theme.palette.primary.main, // Oxford Blue
        color: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Flight sx={{ 
                mr: 1, 
                fontSize: 32,
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                  '50%': { transform: 'translateY(-3px) rotate(5deg)' },
                }
              }} />
              <Typography variant="h6" component="div" fontWeight="bold" color="white">
                SkyWings Airlines
              </Typography>
            </Box>
            <Typography variant="body2" color="white" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6, maxWidth: 700 }}>
              Experience the future of air travel with our AI-powered flight reservation system. 
              Smart recommendations, seamless booking, and personalized journey planning.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                sx={{ 
                  color: 'white', 
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-3px) scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'white', 
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-3px) scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'white', 
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-3px) scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                sx={{ 
                  color: 'white', 
                  background: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-3px) scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="white" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  color="inherit"
                  underline="none"
                  sx={{
                    opacity: 0.8,
                    fontSize: '0.95rem',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateX(5px)',
                      color: 'white',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::before': {
                      content: '"›"',
                      position: 'absolute',
                      left: -15,
                      opacity: 0,
                      transition: 'all 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                      left: -10,
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="white" sx={{ mb: 2 }}>
              Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {services.map((service) => (
                <Link
                  key={service.label}
                  href={service.href}
                  color="inherit"
                  underline="none"
                  sx={{
                    opacity: 0.8,
                    fontSize: '0.95rem',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateX(5px)',
                      color: 'white',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::before': {
                      content: '"›"',
                      position: 'absolute',
                      left: -15,
                      opacity: 0,
                      transition: 'all 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                      left: -10,
                    }
                  }}
                >
                  {service.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Legal */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="white" sx={{ mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {legal.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  color="inherit"
                  underline="none"
                  sx={{
                    opacity: 0.8,
                    fontSize: '0.95rem',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateX(5px)',
                      color: 'white',
                    },
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::before': {
                      content: '"›"',
                      position: 'absolute',
                      left: -15,
                      opacity: 0,
                      transition: 'all 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                      left: -10,
                    }
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.3)',
            mt: 4,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ 
            opacity: 0.9,
            fontSize: '0.9rem',
            letterSpacing: '0.5px',
            color: 'white'
          }}>
            © 2025 SkyWings Airlines. All rights reserved. | AI-Powered Flight Reservation System
          </Typography>
          <Typography variant="caption" sx={{ 
            mt: 1, 
            display: 'block', 
            opacity: 0.7,
            fontSize: '0.8rem',
            letterSpacing: '1px',
            color: 'white'
          }}>
            Secure • Fast • Intelligent
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}