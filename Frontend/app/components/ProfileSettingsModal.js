"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Backdrop,
  Divider
} from "@mui/material";
import { Close, Save, Person } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

export default function ProfileSettingsModal() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const handleOpenModal = () => {
      setOpen(true);
      loadUserData();
    };

    window.addEventListener('openProfileSettings', handleOpenModal);
    return () => {
      window.removeEventListener('openProfileSettings', handleOpenModal);
    };
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || ''
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setMessage({ type: '', text: '' });

  try {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      throw new Error('User data not found');
    }

    const currentUser = JSON.parse(userData);
    const userId = currentUser._id || currentUser.id;

    if (!userId) {
      throw new Error('User ID not found');
    }

    console.log("Sending update request for user:", userId);
    
    const response = await fetch('http://localhost:5000/api/users/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server returned non-JSON response. Please check if the server is running.');
    }

    const result = await response.json();

    if (response.ok) {
      // Update local storage
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: updatedUser 
      }));
      
      // Close modal after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    setMessage({ 
      type: 'error', 
      text: error.message || 'Failed to update profile. Please check if the server is running on port 5000.' 
    });
  } finally {
    setSaving(false);
  }
};

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            maxWidth: '95vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 0,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              p: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Edit Profile
            </Typography>
            <IconButton 
              onClick={handleClose} 
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3, overflowY: 'auto' }}>
            {message.text && (
              <Alert 
                severity={message.type} 
                sx={{ mb: 2 }}
              >
                {message.text}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Avatar Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      mr: 2
                    }}
                  >
                    {formData.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {formData.firstName} {formData.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formData.email}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Form Fields */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={saving}
                  sx={{ mb: 2 }}
                />

                {/* <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={saving}
                  sx={{ mb: 3 }}
                /> */}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handleClose}
                    disabled={saving}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    sx={{
                      background: theme.palette.secondary.main,
                      '&:hover': {
                        background: theme.palette.secondary.dark,
                      }
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </form>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}