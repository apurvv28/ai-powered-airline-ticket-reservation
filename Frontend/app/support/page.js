'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Tab,
  Tabs,
  MenuItem
} from "@mui/material";
import {
  Flight,
  ExpandMore,
  ContactSupport,
  Phone,
  Email,
  Chat,
  Schedule,
  Security,
  Payment,
  Help,
  SmartToy,
  Bookmark,
  AccountCircle,
  Send,
  CheckCircle,
  LocalAirport,
  Luggage,
  CalendarToday,
  CreditCard
} from "@mui/icons-material";
import { useRouter } from 'next/navigation';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`support-tabpanel-${index}`}
      aria-labelledby={`support-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SupportPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitStatus('success');
    setTimeout(() => {
      setSubmitStatus(null);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    }, 3000);
  };

  const faqCategories = [
    {
      title: "Booking & Reservations",
      icon: <Bookmark />,
      questions: [
        {
          question: "How do I book a flight?",
          answer: "You can book flights through our website or mobile app. Simply enter your departure and destination cities, select travel dates, choose your preferred flight, and complete the payment process."
        },
        {
          question: "Can I modify my booking after confirmation?",
          answer: "Yes, you can modify your booking up to 24 hours before departure. Changes may be subject to fare differences and change fees. Visit 'My Bookings' section to make modifications."
        },
        {
          question: "What is your cancellation policy?",
          answer: "Cancellations made 48 hours or more before departure are eligible for a full refund. Cancellations within 48 hours may incur charges. Please check the fare rules for specific details."
        }
      ]
    },
    {
      title: "Payments & Refunds",
      icon: <Payment />,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit/debit cards (Visa, MasterCard, American Express), net banking, UPI payments, and digital wallets like PayPal and Google Pay."
        },
        {
          question: "How long do refunds take to process?",
          answer: "Refunds are typically processed within 7-10 business days. The time may vary depending on your bank or payment method."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We are PCI DSS compliant and never store your complete payment details."
        }
      ]
    },
    {
      title: "Flight Information",
      icon: <LocalAirport />,
      questions: [
        {
          question: "What is the baggage allowance?",
          answer: "Baggage allowance varies by airline and fare class. Typically, economy class includes 1 carry-on (7kg) and 1 checked bag (15-20kg). Please check your specific flight details for exact allowances."
        },
        {
          question: "How do I check my flight status?",
          answer: "You can check flight status in the 'My Bookings' section, or use our flight status tracker on the homepage. Real-time updates are also sent via email and SMS."
        },
        {
          question: "What documents do I need for travel?",
          answer: "For domestic flights: Government-issued photo ID. For international flights: Valid passport and visa (if required). Always check specific requirements for your destination."
        }
      ]
    },
    {
      title: "Account & Technical",
      icon: <AccountCircle />,
      questions: [
        {
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the login page. Enter your registered email address and follow the instructions sent to your email to reset your password."
        },
        {
          question: "Can I use the same account on multiple devices?",
          answer: "Yes, you can access your account from multiple devices. For security, we recommend logging out from shared devices."
        },
        {
          question: "The website/app is not working properly. What should I do?",
          answer: "Try clearing your browser cache and cookies, or update to the latest version of our app. If issues persist, contact our technical support team."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: <Phone sx={{ fontSize: 40 }} />,
      title: "24/7 Phone Support",
      description: "Call us anytime for immediate assistance",
      contact: "+1 (800) SKY-WINGS",
      availability: "24/7",
      color: "primary"
    },
    {
      icon: <Email sx={{ fontSize: 40 }} />,
      title: "Email Support",
      description: "Send us an email and we'll respond within 2 hours",
      contact: "support@skywings.com",
      availability: "24/7",
      color: "secondary"
    },
    {
      icon: <Chat sx={{ fontSize: 40 }} />,
      title: "Live Chat",
      description: "Chat with our support agents in real-time",
      contact: "Available on website",
      availability: "6 AM - 12 AM EST",
      color: "info"
    },
    {
      icon: <SmartToy sx={{ fontSize: 40 }} />,
      title: "AI Assistant",
      description: "Get instant answers from our AI helper",
      contact: "Chat with SkyAI",
      availability: "24/7",
      color: "success"
    }
  ];

  const quickActions = [
    {
      title: "Manage Booking",
      description: "Modify or cancel your reservation",
      icon: <CalendarToday />,
      action: () => router.push('/bookings')
    },
    {
      title: "Flight Status",
      description: "Check real-time flight information",
      icon: <Flight />,
      action: () => router.push('/flight-status')
    },
    {
      title: "Payment Issues",
      description: "Resolve payment-related problems",
      icon: <CreditCard />,
      action: () => setTabValue(1)
    },
    {
      title: "Baggage Support",
      description: "Lost luggage or baggage queries",
      icon: <Luggage />,
      action: () => setTabValue(2)
    }
  ];

  const SupportCard = ({ icon, title, description, contact, availability, color = "primary" }) => (
    <Grow in={loaded} timeout={600}>
      <Card sx={{ height: '100%', width: '17vw', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)' } }}>
        <CardContent sx={{ textAlign: 'center', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: `${theme.palette[color].main}20`, color: theme.palette[color].main, mb: 2, width: 60, height: 60 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="h3" gutterBottom sx={{ color: theme.palette.text.primary }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            {description}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette[color].main, fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
            {contact}
          </Typography>
          <Chip 
            label={availability} 
            size="small" 
            color={color}
            variant="outlined"
          />
        </CardContent>
      </Card>
    </Grow>
  );

  const QuickActionCard = ({ icon, title, description, action }) => (
    <Grow in={loaded} timeout={600}>
      <Card 
        sx={{ 
          height: '100%', 
          width: '17vw',
          cursor: 'pointer',
          transition: 'all 0.3s ease', 
          '&:hover': { 
            transform: 'translateY(-5px)',
            bgcolor: `${theme.palette.primary.main}05`
          } 
        }}
        onClick={action}
      >
        <CardContent sx={{ textAlign: 'center', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: `${theme.palette.primary.main}20`, color: theme.palette.primary.main, mb: 2, width: 60, height: 60 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="h3" gutterBottom sx={{ color: theme.palette.text.primary }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: theme.palette.background.default }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.palette.primary.main,
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Fade in={loaded} timeout={300}>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Chip 
                label="24/7 Support" 
                sx={{ 
                  background: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  mb: 2,
                  fontWeight: 'bold'
                }} 
              />
              <Typography variant={isMobile ? "h3" : "h2"} component="h1" gutterBottom color="white">
                How Can We Help You?
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"} component="h2" color="white" sx={{ mb: 3, opacity: 0.9 }}>
                We are here to make your travel experience seamless
              </Typography>
              <Typography variant="body1" color="white" sx={{ mb: 4, opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
                Get instant answers, connect with our support team, or explore helpful resources
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Quick Actions */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Fade in={loaded} timeout={400}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: theme.palette.text.primary }}>
              Quick Help
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Common tasks you can do right now
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ mb: 8 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <QuickActionCard {...action} />
            </Grid>
          ))}
        </Grid>

        {/* Contact Methods */}
        <Fade in={loaded} timeout={500}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: theme.palette.text.primary }}>
              Contact Support
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Multiple ways to get the help you need
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ mb: 8 }}>
          {contactMethods.map((method, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <SupportCard {...method} />
            </Grid>
          ))}
        </Grid>

        {/* Tabs Section */}
        <Paper sx={{ width: '100%', mb: 4, borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                minWidth: 'auto'
              }
            }}
          >
            <Tab icon={<Help />} label="FAQ" iconPosition="start" />
            <Tab icon={<ContactSupport />} label="Contact Form" iconPosition="start" />
            <Tab icon={<Security />} label="Travel Advisory" iconPosition="start" />
          </Tabs>

          {/* FAQ Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: theme.palette.text.primary, mb: 3, textAlign: 'center' }}>
                Frequently Asked Questions
              </Typography>
              
              {faqCategories.map((category, categoryIndex) => (
                <Box key={categoryIndex} sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom 
                    sx={{ 
                      color: theme.palette.primary.main, 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      justifyContent: { xs: 'center', md: 'flex-start' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      {category.icon}
                    </Box>
                    <Box component="span">{category.title}</Box>
                  </Typography>
                  
                  {category.questions.map((faq, faqIndex) => (
                    <Accordion key={faqIndex} sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMore />} sx={{ borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ))}
            </Box>
          </TabPanel>

          {/* Contact Form Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 600, mx: 'auto', px: { xs: 2, sm: 0 } }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: theme.palette.text.primary, mb: 3, textAlign: 'center' }}>
                Send us a Message
              </Typography>

              {submitStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! We&pos;ll get back to you within 2 hours.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      variant="outlined"
                    >
                      <MenuItem value="general">General Inquiry</MenuItem>
                      <MenuItem value="booking">Booking Issue</MenuItem>
                      <MenuItem value="payment">Payment Problem</MenuItem>
                      <MenuItem value="technical">Technical Support</MenuItem>
                      <MenuItem value="refund">Refund Request</MenuItem>
                      <MenuItem value="complaint">Complaint</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{
                        background: theme.palette.secondary.main,
                        color: theme.palette.secondary.contrastText,
                        fontWeight: 'bold',
                        px: 4,
                        minWidth: 200,
                        '&:hover': {
                          background: theme.palette.secondary.dark,
                        }
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </TabPanel>

          {/* Travel Advisory Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 0 } }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: theme.palette.text.primary, mb: 3, textAlign: 'center' }}>
                Travel Advisories & Safety Information
              </Typography>

              <List sx={{ width: '100%' }}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="COVID-19 Travel Guidelines" 
                    secondary="Check local restrictions and requirements before traveling. Masks may be required in certain airports and flights." 
                  />
                </ListItem>
                <Divider variant="fullWidth" component="li" sx={{ my: 2 }} />
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Passport Requirements" 
                    secondary="Ensure your passport is valid for at least 6 months from your travel date for international flights." 
                  />
                </ListItem>
                <Divider variant="fullWidth" component="li" sx={{ my: 2 }} />
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Weather Advisories" 
                    secondary="Monitor weather conditions at your destination. Flight delays may occur due to adverse weather." 
                  />
                </ListItem>
                <Divider variant="fullWidth" component="li" sx={{ my: 2 }} />
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Security Measures" 
                    secondary="Arrive at the airport at least 2 hours before domestic flights and 3 hours for international flights for security checks." 
                  />
                </ListItem>
              </List>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  For the latest travel advisories, always check with your local government travel advisory website and the destination country&pos;s official requirements.
                </Typography>
              </Alert>
            </Box>
          </TabPanel>
        </Paper>

        {/* Emergency Contact */}
        <Fade in={loaded} timeout={700}>
          <Card sx={{ 
            background: `${theme.palette.warning.main}10`, 
            border: `1px solid ${theme.palette.warning.main}30`,
            textAlign: 'center'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: theme.palette.warning.main }}>
                🚨 Emergency Travel Assistance
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                For urgent issues during travel including missed flights, medical emergencies, or last-minute changes
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', mb: 1 }}>
                Emergency Hotline: +1 (800) SKY-HELP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available 24/7 for genuine emergencies
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}