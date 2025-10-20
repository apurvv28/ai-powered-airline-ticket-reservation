'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  Fade,
  Grow,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  Flight, 
  SmartToy, 
  AccountBalanceWallet, 
  Map, 
  Recommend,
  Security,
  Speed,
  Analytics,
  TrendingUp,
  Schedule,
  Person
} from "@mui/icons-material";

export default function Index() {
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

  const aiFeatures = [
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 48 }} />,
      title: "AI Budget Planner",
      description: "Intelligent cost optimization that finds the best deals within your budget constraints",
      features: ["Smart price prediction", "Cost optimization", "Budget tracking", "Deal alerts"],
      color: theme.palette.primary.main
    },
    {
      icon: <Map sx={{ fontSize: 48 }} />,
      title: "AI Itinerary Planner",
      description: "Personalized travel plans that maximize your experience while minimizing hassles",
      features: ["Smart routing", "Time optimization", "Activity suggestions", "Real-time updates"],
      color: theme.palette.secondary.main
    },
    {
      icon: <Recommend sx={{ fontSize: 48 }} />,
      title: "AI Recommendations",
      description: "Advanced algorithms that suggest flights tailored to your preferences and history",
      features: ["Personalized deals", "Trend analysis", "Preference learning", "Smart alerts"],
      color: theme.palette.primary.light
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Travelers", icon: <Person /> },
    { number: "95%", label: "Satisfaction Rate", icon: <TrendingUp /> },
    { number: "24/7", label: "AI Support", icon: <SmartToy /> },
    { number: "5M+", label: "Routes Analyzed", icon: <Schedule /> }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hero Section with Techy Background */}
      <Box
        sx={{
          background: theme.palette.primary.main,
          color: 'white',
          py: { xs: 8, md: 12 },
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

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
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
                    label="AI Powered Platform" 
                    sx={{ 
                      background: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      mb: 3,
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      py: 1,
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
                    gutterBottom
                    className="content-glow"
                    sx={{ 
                      fontWeight: 'bold',
                      lineHeight: 1.2,
                      mb: 3,
                      color: 'white',
                      transition: 'text-shadow 0.3s ease'
                    }}
                  >
                    Intelligent Flight Booking for Modern Travelers
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      mb: 4, 
                      opacity: 0.9,
                      fontWeight: 400,
                      lineHeight: 1.6,
                      color: 'white'
                    }}
                  >
                    Experience the future of air travel with advanced AI technology that understands your needs
                  </Typography>
                  
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={2} 
                    sx={{ mb: 6 }}
                  >
                    <Grow in={loaded} timeout={500}>
                      <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        href="/register"
                        sx={{
                          px: 4,
                          py: 2,
                          background: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          borderRadius: 2,
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
                        Get Started Free
                      </Button>
                    </Grow>
                    <Grow in={loaded} timeout={700}>
                      <Button
                        variant="outlined"
                        size="large"
                        component={Link}
                        href="/login"
                        sx={{
                          px: 4,
                          py: 2,
                          borderColor: 'white',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          borderRadius: 2,
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
                        Sign In
                      </Button>
                    </Grow>
                  </Stack>

                  {/* Stats */}
                  <Grid container spacing={3}>
                    {stats.map((stat, index) => (
                      <Grid item xs={6} sm={3} key={index}>
                        <Grow in={loaded} timeout={900 + index * 100}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography 
                              variant="h4" 
                              component="div" 
                              fontWeight="bold"
                              sx={{ mb: 0.5, color: 'white' }}
                            >
                              {stat.number}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ opacity: 0.8, fontSize: '0.8rem', color: 'white' }}
                            >
                              {stat.label}
                            </Typography>
                          </Box>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Fade in={loaded} timeout={1100}>
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

      {/* AI Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Fade in={loaded} timeout={400}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography 
                variant="h3" 
                component="h2" 
                gutterBottom
                sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
              >
                Advanced AI Features
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
              >
                Powered by cutting-edge artificial intelligence to transform your travel experience
              </Typography>
            </Box>
          </Fade>

          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
                lg: 'repeat(3, 1fr)'
              },
              alignItems: 'stretch'
            }}
          >
            {aiFeatures.map((feature, index) => (
              <Box key={index}>
                <Grow in={loaded} timeout={600 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'white',
                      border: `1px solid ${theme.palette.grey[300]}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      transition: 'all 0.4s ease',
                      borderRadius: 3,
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          color: feature.color,
                          mb: 3,
                          textAlign: 'center',
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h5" 
                        component="h3" 
                        gutterBottom 
                        textAlign="center"
                        sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.text.primary }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: 3, lineHeight: 1.6, flex: 1 }}
                      >
                        {feature.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {feature.features.map((item, idx) => (
                          <Chip
                            key={idx}
                            label={item}
                            size="small"
                            sx={{
                              background: `${feature.color}15`,
                              color: feature.color,
                              fontWeight: 500,
                              fontSize: '0.75rem'
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

      {/* Benefits Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Fade in={loaded} timeout={800}>
                <Box>
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    gutterBottom
                    sx={{ fontWeight: 'bold', mb: 3, textAlign: { xs: 'center', md: 'center' } }}
                  >
                    Why Choose SkyWings AI?
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.6, textAlign: { xs: 'center', md: 'center' } }}
                  >
                    Our intelligent platform combines advanced machine learning with user-friendly design to deliver unparalleled travel experiences.
                  </Typography>
                  
                  <Stack spacing={3}>
                    {[
                      { icon: <SmartToy />, title: "AI Powered Intelligence", desc: "Advanced algorithms that learn your preferences" },
                      { icon: <Security />, title: "Bank-Level Security", desc: "Your data and payments are 100% protected" },
                      { icon: <Speed />, title: "Lightning Fast Results", desc: "Get the best deals in seconds, not hours" },
                      { icon: <Analytics />, title: "Smart Analytics", desc: "Data-driven insights for better travel decisions" }
                    ].map((item, index) => (
                      <Grow in={loaded} timeout={1000 + index * 200} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center',justifyContent: 'center', gap: 2, textAlign: { xs: 'center', md: 'center' } }}>
                          <Box sx={{ color: theme.palette.primary.main, mt: 0.5 }}>
                            {item.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </Grow>
                    ))}
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Fade in={loaded} timeout={1000}>
                <Box
                  sx={{
                    background: theme.palette.primary.main,
                    borderRadius: 4,
                    p: 4,
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(20, 33, 61, 0.3)'
                  }}
                >
                  <Typography variant="h4" component="h3" color='white' gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Ready to Transform Your Travel Experience?
                  </Typography>
                  <Typography variant="body1" color='white' sx={{ mb: 4, opacity: 0.9 }}>
                    Join thousands of smart travelers who trust our AI-powered platform
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    href="/register"
                    sx={{
                      px: 4,
                      py: 1.5,
                      background: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      '&:hover': {
                        background: theme.palette.secondary.dark,
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Start Your Journey
                  </Button>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: theme.palette.primary.main, color: 'white' }}>
        <Container maxWidth="md">
          <Fade in={loaded} timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="h2" color="white" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Experience the Future of Travel Today
              </Typography>
              <Typography variant="h6" color="white" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
                Join SkyWings Airlines and discover how AI can make your travel smarter, faster, and more enjoyable
              </Typography>
              <Stack direction={isMobile ? "column" : "row"} spacing={2} justifyContent="center">
                <Grow in={loaded} timeout={1000}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    href="/register"
                    sx={{
                      px: 4,
                      py: 2,
                      background: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      '&:hover': {
                        background: theme.palette.secondary.dark,
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Create Free Account
                  </Button>
                </Grow>
                <Grow in={loaded} timeout={1200}>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    href="/login"
                    sx={{
                      px: 4,
                      py: 2,
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Sign In to Account
                  </Button>
                </Grow>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
}