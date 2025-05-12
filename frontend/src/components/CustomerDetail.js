import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Container,
  Chip,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      console.log('Fetching customer with ID:', id);
      try {
        const response = await axios.get(`${API_URL}/customers/${id}`);
        console.log('Customer data received:', response.data);
        setCustomer(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(
          err.response?.data?.error || 
          err.message || 
          'Failed to fetch customer details. Please try again.'
        );
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    } else {
      setError('No customer ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert 
            severity="error"
            sx={{ 
              '& .MuiAlert-message': {
                fontSize: '1rem'
              }
            }}
          >
            {error}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to List
          </Button>
        </Box>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">Customer not found</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back to List
          </Button>
          <Typography variant="h4" component="h1">
            Customer Details
          </Typography>
        </Stack>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="h6">
                {customer.name}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="h6">
                {customer.email}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="h6">
                {customer.phone || 'N/A'}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={customer.isActive ? 'Active' : 'Inactive'}
                color={customer.isActive ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
            </Box>

            {customer.lastPurchase && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Purchase
                  </Typography>
                  <Typography variant="h6">
                    {customer.lastPurchase}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default CustomerDetail; 