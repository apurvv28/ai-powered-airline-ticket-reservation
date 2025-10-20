'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Paper
} from "@mui/material";
import { 
  Flight, 
  Search, 
  TrendingUp,
  Security,
  Speed,
  AccountBalanceWallet,
  Map,
  Recommend,
  SmartToy
} from "@mui/icons-material";

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loaded, setLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const features = [
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: "Smart Search",
      description: "AI-powered flight recommendations based on your preferences and travel history"
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: "Instant Booking",
      description: "Book your flights in seconds with our streamlined reservation process"
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: "Best Prices",
      description: "Real-time price comparison and exclusive deals for our members"
    }
  ];

  const aiFeatures = [
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
      title: "AI Budget Planner",
      description: "Intelligent cost optimization that finds the best deals within your budget",
      features: ["Smart price prediction", "Cost optimization", "Budget tracking"]
    },
    {
      icon: <Map sx={{ fontSize: 40 }} />,
      title: "AI Itinerary Planner",
      description: "Personalized travel plans that maximize your experience",
      features: ["Smart routing", "Time optimization", "Activity suggestions"]
    },
    {
      icon: <Recommend sx={{ fontSize: 40 }} />,
      title: "AI Recommendations",
      description: "Advanced algorithms suggesting flights tailored to you",
      features: ["Personalized deals", "Trend analysis", "Preference learning"]
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section with Techy Background */}
      <Box
        sx={{
          background: theme.palette.primary.main,
          color: 'white',
          py: { xs: 8, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          cursor: 'none',
          '&:hover': {
            '& .tech-grid': {
              opacity: 0.8,
              transform: 'scale(1.02)',
            },
            '& .floating-icon': {
              transform: 'translateY(-10px) scale(1.1)',
            },
            '& .pulse-dot': {
              animation: 'pulse 2s infinite',
            }
          }
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Animated Tech Grid Background */}
        <Box
          className="tech-grid"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(90deg, rgba(20, 33, 61, 0.9) 1px, transparent 1px),
              linear-gradient(180deg, rgba(20, 33, 61, 0.9) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3,
            transition: 'all 0.5s ease',
            transform: 'scale(1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(252, 163, 17, 0.1) 0%, 
                transparent 50%)`,
              transition: 'background 0.1s ease',
            }
          }}
        />

        {/* Animated Circuit Lines */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(90deg, transparent 49%, rgba(252, 163, 17, 0.3) 50%, transparent 51%),
              linear-gradient(180deg, transparent 49%, rgba(252, 163, 17, 0.3) 50%, transparent 51%)
            `,
            backgroundSize: '100px 100px',
            animation: 'circuitFlow 20s linear infinite',
            opacity: 0.1,
            '@keyframes circuitFlow': {
              '0%': { backgroundPosition: '0 0' },
              '100%': { backgroundPosition: '100px 100px' }
            }
          }}
        />

        {/* Floating Tech Elements */}
        <Box
          className="floating-icon"
          sx={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            fontSize: 60,
            color: theme.palette.secondary.main,
            opacity: 0.1,
            animation: 'float 6s ease-in-out infinite',
            transition: 'all 0.3s ease',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' }
            }
          }}
        >
          <SmartToy />
        </Box>

        <Box
          className="floating-icon"
          sx={{
            position: 'absolute',
            bottom: '30%',
            left: '5%',
            fontSize: 40,
            color: theme.palette.secondary.main,
            opacity: 0.1,
            animation: 'float 8s ease-in-out infinite 1s',
            transition: 'all 0.3s ease',
          }}
        >
          <AccountBalanceWallet />
        </Box>

        {/* Pulsing Dots */}
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            className="pulse-dot"
            sx={{
              position: 'absolute',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: theme.palette.secondary.main,
              opacity: 0.6,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `pulse 3s infinite ${i * 0.5}s`,
              transition: 'all 0.3s ease',
              '@keyframes pulse': {
                '0%, 100%': { 
                  transform: 'scale(1)',
                  opacity: 0.6
                },
                '50%': { 
                  transform: 'scale(2)',
                  opacity: 0.2
                }
              }
            }}
          />
        ))}

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={loaded} timeout={300}>
                <Box
                  sx={{
                    transform: 'translateZ(0)',
                    '&:hover': {
                      '& .content-glow': {
                        textShadow: '0 0 20px rgba(252, 163, 17, 0.5)',
                      }
                    }
                  }}
                >
                  <Chip 
                    label="AI Powered" 
                    sx={{ 
                      background: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      mb: 2,
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 0 20px ${theme.palette.secondary.main}`
                      }
                    }} 
                  />
                  <Typography 
                    variant={isMobile ? "h3" : "h2"} 
                    component="h1"
                    color='white' 
                    gutterBottom
                    className="content-glow"
                    sx={{ 
                      fontWeight: 'bold',
                      transition: 'text-shadow 0.3s ease'
                    }}
                  >
                    Welcome to SkyWings
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="h2" 
                    color='white'
                    gutterBottom
                    sx={{ mb: 3, opacity: 0.9 }}
                  >
                    Your AI-Powered Travel Companion
                  </Typography>
                  <Typography 
                    variant="body1"
                    color='white' 
                    sx={{ 
                      mb: 4, 
                      fontSize: '1.1rem',
                      opacity: 0.8,
                      maxWidth: 500
                    }}
                  >
                    Discover the future of air travel with intelligent recommendations, 
                    seamless booking, and personalized journey planning.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Grow in={loaded} timeout={500}>
                      <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        href="/search-flights"
                        sx={{
                          px: 4,
                          py: 1.5,
                          background: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                          fontWeight: 'bold',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            background: theme.palette.secondary.dark,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${theme.palette.secondary.main}40`,
                            '&::before': {
                              transform: 'translateX(100%)',
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            transition: 'transform 0.6s ease',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Search Flights
                      </Button>
                    </Grow>
                    <Grow in={loaded} timeout={700}>
                      <Button
                        variant="outlined"
                        size="large"
                        component={Link}
                        href="/ai"
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderColor: 'white',
                          color: 'white',
                          fontWeight: 'bold',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-2px)',
                            borderColor: theme.palette.secondary.main,
                            color: theme.palette.secondary.main,
                            '&::after': {
                              transform: 'translateX(0)',
                            }
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: `2px solid ${theme.palette.secondary.main}`,
                            borderRadius: 'inherit',
                            transform: 'translateX(-100%)',
                            transition: 'transform 0.3s ease',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Plan a Trip with AI
                      </Button>
                    </Grow>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Fade in={loaded} timeout={900}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  <Flight 
                    sx={{ 
                      fontSize: 200, 
                      color: theme.palette.secondary.main,
                      filter: 'drop-shadow(0 0 20px rgba(252, 163, 17, 0.3))',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(10deg)',
                        filter: 'drop-shadow(0 0 30px rgba(252, 163, 17, 0.6))',
                      }
                    }} 
                  />
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box sx={{ 
        py: 8, 
        background: theme.palette.background.default // White
      }}>
        <Container maxWidth="lg">
          <Fade in={loaded} timeout={400}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography 
                variant="h3" 
                component="h2" 
                gutterBottom
                sx={{ fontWeight: 'bold', color: theme.palette.text.primary }} // Black
              >
                Advanced AI Features
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                Powered by cutting-edge artificial intelligence for smarter travel
              </Typography>
            </Box>
          </Fade>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'center',
              alignItems: 'stretch'
            }}
          >
            {aiFeatures.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  flexBasis: { xs: '100%', md: '48%', lg: '30%' },
                  display: 'flex'
                }}
              >
                <Grow in={loaded} timeout={600 + index * 100} style={{ width: '100%' }}>
                  <Card
                    sx={{
                      height: '100%',
                      width: '100%',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 4,
                      },
                      border: `1px solid ${theme.palette.grey[300]}` // Platinum
                    }}
                  >
                    <CardContent sx={{ 
                      p: 4, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      flexGrow: 1, 
                      justifyContent: 'space-between' 
                    }}>
                      <Box>
                        <Box sx={{ 
                          color: theme.palette.primary.main, // Oxford Blue
                          mb: 2 
                        }}>
                          {feature.icon}
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          gutterBottom
                          sx={{ color: theme.palette.text.primary }} // Black
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ mb: 2 }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5, 
                        justifyContent: 'center', 
                        mt: 2 
                      }}>
                        {feature.features.map((item, idx) => (
                          <Chip
                            key={idx}
                            label={item}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              m: 0.2, 
                              fontSize: '0.7rem',
                              borderColor: theme.palette.primary.main, // Oxford Blue
                              color: theme.palette.primary.main // Oxford Blue
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section - Updated with theme colors */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in={loaded} timeout={400}>
          <Typography 
            variant="h3" 
            component="h2" 
            textAlign="center" 
            gutterBottom
            sx={{ 
              mb: 6,
              color: theme.palette.text.primary // Black
            }}
          >
            Why Choose SkyWings?
          </Typography>
        </Fade>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 4, 
          justifyContent: 'center', 
          alignItems: 'stretch' 
        }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ 
              flexBasis: { xs: '100%', sm: '48%', md: '24%' }, 
              display: 'flex' 
            }}>
              <Grow in={loaded} timeout={600 + index * 100} style={{ width: '100%' }}>
                <Card
                  sx={{
                    height: '100%',
                    width: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 4,
                    },
                    border: `1px solid ${theme.palette.grey[300]}` // Platinum
                  }}
                >
                  <CardContent sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1, 
                    justifyContent: 'flex-start' 
                  }}>
                    <Box sx={{ 
                      color: theme.palette.primary.main, // Oxford Blue
                      mb: 2 
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ color: theme.palette.text.primary }} // Black
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Stats Section - Updated with theme colors */}
      <Box sx={{ 
        py: 8, 
        background: theme.palette.background.default // White
      }}>
        <Container maxWidth="lg">
          <Fade in={loaded} timeout={400}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography 
                variant="h3" 
                component="h2" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.text.primary // Black
                }}
              >
                Trusted by Travelers Worldwide
              </Typography>
            </Box>
          </Fade>
          <Grid container spacing={4} justifyContent="center">
            {[
              { number: '50K+', label: 'Happy Travelers' },
              { number: '95%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'AI Support' },
              { number: '5M+', label: 'Routes Analyzed' }
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Grow in={loaded} timeout={600 + index * 100}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      fontWeight="bold" 
                      sx={{ color: theme.palette.primary.main }} // Oxford Blue
                    >
                      {stat.number}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: theme.palette.text.secondary }} // Oxford Blue
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section - Added with theme colors */}
      <Box sx={{ 
        py: 8, 
        background: theme.palette.primary.main, // Oxford Blue
        color: 'white'
      }}>
        <Container maxWidth="md">
          <Fade in={loaded} timeout={400}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h3" 
                component="h2" 
                gutterBottom
                color='white'
                sx={{ fontWeight: 'bold', mb: 3 }}
              >
                Ready to Start Your Journey?
              </Typography>
              <Typography 
                variant="h6" 
                color='white'
                sx={{ mb: 4, opacity: 0.9 }}
              >
                Experience the future of travel with our AI-powered platform
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/search-flights"
                sx={{
                  px: 4,
                  py: 2,
                  background: theme.palette.secondary.main, // Orange Web
                  color: theme.palette.secondary.contrastText, // Black
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: theme.palette.secondary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Book Your Flight Now
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
}