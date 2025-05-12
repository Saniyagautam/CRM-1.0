import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  FormControlLabel,
  Switch,
  Container,
  Divider,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form data
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/customers`, formData);
      if (response.data) {
        navigate('/');
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      setError(err.response?.data?.message || 'Failed to add customer. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <IconButton onClick={() => navigate('/')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Add New Customer
          </Typography>
        </Stack>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="Enter customer name"
                error={error && !formData.name.trim()}
                helperText={error && !formData.name.trim() ? 'Name is required' : ''}
              />

              <TextField
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="Enter customer email"
                error={error && (!formData.email.trim() || !formData.email.includes('@'))}
                helperText={error && !formData.email.includes('@') ? 'Please enter a valid email address' : ''}
              />

              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                placeholder="Enter phone number (optional)"
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1">
                    Active Customer
                  </Typography>
                }
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  size="large"
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem'
                  }}
                >
                  {loading ? 'Adding Customer...' : 'Add Customer'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  size="large"
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem'
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddCustomer; 