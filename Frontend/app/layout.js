"use client";

import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import theme from "./theme/theme";
import { usePathname } from "next/navigation";
import Script from 'next/script';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Define routes where navbar and footer should be hidden
  const hideNavbarFooterRoutes = [
    '/airline-login',
    '/airline-dashboard',
    '/airline-registration'
  ];
  
  const shouldHideNavbarFooter = hideNavbarFooterRoutes.some(route => 
    pathname?.startsWith(route)
  );

  return (
    <html lang="en">
      <head>
        <title>SkyWings Airlines - AI Powered Flight Booking</title>
        <meta name="description" content="Experience the future of air travel with SkyWings AI-powered flight reservation system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          
          {/* Navbar - hidden on airline admin pages */}
          {!shouldHideNavbarFooter && <Navbar />}
          
          {/* Main Content */}
          <Box 
            component="main"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: shouldHideNavbarFooter ? '100vh' : 'calc(100vh - 120px)',
            }}
          >
            {children}
          </Box>
          
          {/* Footer - hidden on airline admin pages */}
          {!shouldHideNavbarFooter && <Footer />}
        </ThemeProvider>
      </body>
    </html>
  );
}