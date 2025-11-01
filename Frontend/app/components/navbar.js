"use client";
import ProfileSettingsModal from "./ProfileSettingsModal";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Modal,
  Avatar,
  Divider,
  MenuItem,
  Fade,
  Backdrop,
  Menu,
  Collapse,
} from "@mui/material";
import {
  Flight,
  Close,
  AccountCircle,
  Notifications,
  Logout,
  Person,
  Settings,
  Bookmark,
  SmartToy,
  ExpandMore,
  ExpandLess,
  AccountBalanceWallet,
  Map,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [aiMenuAnchor, setAiMenuAnchor] = useState(null);
  const [mobileAiMenuOpen, setMobileAiMenuOpen] = useState(false);

  // Function to check and update login status
  const checkLoginStatus = () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userData = localStorage.getItem("user");

    setIsLoggedIn(loggedIn);
    if (loggedIn && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    // Check login status on component mount
    checkLoginStatus();

    // Listen for storage changes (for login/logout from other tabs)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    // Listen for custom login event
    const handleLoginEvent = () => {
      checkLoginStatus();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("login", handleLoginEvent);

    // Set up interval to check login status (fallback)
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("login", handleLoginEvent);
      clearInterval(interval);
    };
  }, []);

  // Also check login status when pathname changes (page navigation)
  useEffect(() => {
    checkLoginStatus();
  }, [pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileModalOpen = () => {
    setProfileModalOpen(true);
  };

  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
  };

  const handleAiMenuOpen = (event) => {
    setAiMenuAnchor(event.currentTarget);
  };

  const handleAiMenuClose = () => {
    setAiMenuAnchor(null);
  };

  const handleMobileAiMenuToggle = () => {
    setMobileAiMenuOpen(!mobileAiMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    setIsLoggedIn(false);
    setProfileModalOpen(false);

    // Dispatch logout event for other components
    window.dispatchEvent(new Event("logout"));
    router.push("/");
  };

  const navigationItems = [
    { label: "Home", href: "/home" },
    { label: "Search Flights", href: "/search-flights" },
    { label: "My Bookings", href: "/bookings" },
    { label: "Support", href: "/support" },
  ];

  const authItems = [
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
  ];

  const aiFeatures = [
    {
      label: "AI Budget Planner",
      href: "/budget-planner",
      icon: <AccountBalanceWallet sx={{ fontSize: 20, mr: 1 }} />,
      description: "Smart travel cost estimation"
    },
    {
      label: "AI Itinerary Planner",
      href: "/itinerary-planner",
      icon: <Map sx={{ fontSize: 20, mr: 1 }} />,
      description: "Personalized travel plans"
    },
  ];

  const drawer = (
    <Box sx={{ textAlign: "center", pt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Flight sx={{ mr: 1, color: theme.palette.primary.main }} />
          SkyWings
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <List>
        {/* Show navigation items only when logged in */}
        {isLoggedIn ? (
          <>
            {navigationItems.map((item) => (
              <ListItem
                key={item.label}
                component={Link}
                href={item.href}
                onClick={handleDrawerToggle}
                sx={{
                  color: "text.primary",
                  textDecoration: "none",
                  "&:hover": {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            
            {/* AI Features Dropdown in Mobile */}
            <ListItem 
              onClick={handleMobileAiMenuToggle}
              sx={{
                color: "text.primary",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: `${theme.palette.primary.main}15`,
                },
              }}
            >
              <ListItemText 
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <SmartToy sx={{ mr: 1, fontSize: 20, color: theme.palette.secondary.main }} />
                      AI Features
                    </Box>
                    {mobileAiMenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                } 
              />
            </ListItem>
            
            <Collapse in={mobileAiMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {aiFeatures.map((feature) => (
                  <ListItem
                    key={feature.label}
                    component={Link}
                    href={feature.href}
                    onClick={() => {
                      handleDrawerToggle();
                      setMobileAiMenuOpen(false);
                    }}
                    sx={{
                      pl: 4,
                      color: "text.primary",
                      textDecoration: "none",
                      "&:hover": {
                        backgroundColor: `${theme.palette.secondary.main}15`,
                      },
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {feature.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        ) : (
          <ListItem
            component={Link}
            href="/"
            onClick={handleDrawerToggle}
            sx={{
              color: "text.primary",
              textDecoration: "none",
              "&:hover": {
                backgroundColor: `${theme.palette.primary.main}15`,
              },
            }}
          >
            <ListItemText primary="Home" />
          </ListItem>
        )}

        {/* Show auth items when not logged in */}
        {!isLoggedIn && (
          <Box sx={{ mt: 2, borderTop: 1, borderColor: "divider", pt: 1 }}>
            {authItems.map((item) => (
              <ListItem
                key={item.label}
                component={Link}
                href={item.href}
                onClick={handleDrawerToggle}
                sx={{
                  color: "text.primary",
                  textDecoration: "none",
                  "&:hover": {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </Box>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.primary.main,
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow: scrolled ? 4 : 1,
          transition: "all 0.3s ease",
          py: 0.5,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            href={isLoggedIn ? "/home" : "/"}
            sx={{
              flexGrow: isMobile ? 0 : 1,
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              mr: 4,
            }}
          >
            <Flight
              sx={{
                mr: 1,
                animation: scrolled ? "none" : "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
                  "50%": { transform: "translateY(-3px) rotate(5deg)" },
                },
              }}
            />
            SkyWings
          </Typography>

          {!isMobile && (
            <Box sx={{ display: "flex", flexGrow: 1, gap: 1 }}>
              {/* Show navigation items only when logged in */}
              {isLoggedIn ? (
                <>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.label}
                      color="inherit"
                      component={Link}
                      href={item.href}
                      sx={{
                        mx: 0.5,
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          width: pathname === item.href ? "100%" : "0%",
                          height: "2px",
                          background: "white",
                          transition: "all 0.3s ease",
                          transform: "translateX(-50%)",
                        },
                        "&:hover::after": {
                          width: "100%",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                  
                  {/* AI Features Dropdown */}
                  <Button
                    color="inherit"
                    onClick={handleAiMenuOpen}
                    endIcon={<ExpandMore />}
                    sx={{
                      mx: 0.5,
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        width: aiFeatures.some(f => pathname === f.href) ? "100%" : "0%",
                        height: "2px",
                        background: theme.palette.secondary.main,
                        transition: "all 0.3s ease",
                        transform: "translateX(-50%)",
                      },
                      "&:hover::after": {
                        width: "100%",
                      },
                    }}
                  >
                    AI Features
                  </Button>

                  {/* AI Features Menu */}
                  <Menu
                    anchorEl={aiMenuAnchor}
                    open={Boolean(aiMenuAnchor)}
                    onClose={handleAiMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        minWidth: 240,
                        borderRadius: 2,
                        boxShadow: 4,
                      }
                    }}
                  >
                    {aiFeatures.map((feature) => (
                      <MenuItem
                        key={feature.label}
                        component={Link}
                        href={feature.href}
                        onClick={handleAiMenuClose}
                        sx={{
                          py: 1.5,
                          px: 2,
                          "&:hover": {
                            backgroundColor: `${theme.palette.secondary.main}15`,
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                          <Box sx={{ color: theme.palette.secondary.main, mt: 0.25 }}>
                            {feature.icon}
                          </Box>
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {feature.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {feature.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                // Show only Home button when not logged in
                <Button
                  color="inherit"
                  component={Link}
                  href="/"
                  sx={{
                    mx: 0.5,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      width: pathname === "/" ? "100%" : "0%",
                      height: "2px",
                      background: "white",
                      transition: "all 0.3s ease",
                      transform: "translateX(-50%)",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  Home
                </Button>
              )}
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Show notifications only when logged in */}
              {isLoggedIn && (
                <IconButton color="inherit" size="small">
                  <Notifications />
                </IconButton>
              )}

              {isLoggedIn ? (
                <>
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={handleProfileModalOpen}
                    sx={{
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <AccountCircle />
                  </IconButton>
                </>
              ) : (
                // Show login/register buttons when not logged in
                authItems.map((item) => (
                  <Button
                    key={item.label}
                    color="inherit"
                    component={Link}
                    href={item.href}
                    variant={item.label === "Login" ? "outlined" : "contained"}
                    sx={{
                      ml: 1,
                      borderColor: "white",
                      color:
                        item.label === "Login"
                          ? "white"
                          : theme.palette.primary.main,
                      backgroundColor:
                        item.label === "Register"
                          ? theme.palette.secondary.main
                          : "transparent",
                      "&:hover": {
                        backgroundColor:
                          item.label === "Login"
                            ? "rgba(255,255,255,0.1)"
                            : theme.palette.secondary.dark,
                        color:
                          item.label === "Login"
                            ? "white"
                            : theme.palette.secondary.contrastText,
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.label}
                  </Button>
                ))
              )}
            </Box>
          )}

          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ ml: "auto" }}
            >
              <Menu />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Profile Modal - Only show when logged in */}
      {isLoggedIn && (
        <Modal
          open={profileModalOpen}
          onClose={handleProfileModalClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={profileModalOpen}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                maxWidth: "90vw",
                bgcolor: "background.paper",
                borderRadius: 3,
                boxShadow: 24,
                p: 0,
                overflow: "hidden",
              }}
            >
              {/* Header - Using theme colors */}
              <Box
                sx={{
                  background: theme.palette.secondary.main,
                  color: "white",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "white",
                    color: theme.palette.primary.main,
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {user?.firstName || "User"} {user?.lastName || ""}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user?.email || "user@example.com"}
                </Typography>
              </Box>

              {/* Menu Items */}
              <Box sx={{ p: 2 }}>
                <MenuItem
                  onClick={() => {
                    router.push("/bookings");
                    handleProfileModalClose();
                  }}
                  sx={{ py: 1.5, borderRadius: 1 }}
                >
                  <Bookmark sx={{ mr: 2, color: "text.secondary" }} />
                  <Typography variant="body1">My Bookings</Typography>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleProfileModalClose();
                    // We'll open the profile settings modal here
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("openProfileSettings")
                      );
                    }, 300);
                  }}
                  sx={{ py: 1.5, borderRadius: 1 }}
                >
                  <Settings sx={{ mr: 2, color: "text.secondary" }} />
                  <Typography variant="body1">Account Settings</Typography>
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    borderRadius: 1,
                    color: "error.main",
                    "&:hover": {
                      bgcolor: "error.light",
                      color: "white",
                    },
                  }}
                >
                  <Logout sx={{ mr: 2 }} />
                  <Typography variant="body1">Logout</Typography>
                </MenuItem>
              </Box>
            </Box>
          </Fade>
        </Modal>
      )}

      {/* Mobile Drawer */}
      <nav>
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 280,
              background: theme.palette.background.default,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <ProfileSettingsModal />
      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
}