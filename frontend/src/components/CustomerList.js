import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Container,
  Chip,
  Collapse,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/customers`, {
        timeout: 5000 // 5 second timeout
      });
      console.log('Customers data:', response.data); // Debug log
      setCustomers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check if the backend server is running.');
      } else if (!err.response) {
        setError('Network error. Please check if the backend server is running at http://localhost:5000');
      } else {
        setError('Failed to fetch customers. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewCustomer = (customerId) => {
    console.log('Viewing customer:', customerId);
    navigate(`/customer/${customerId}`);
  };

  const handleAddCustomer = () => {
    navigate('/customer/new');
  };

  const handleAddOrder = (customerId) => {
    navigate(`/order/new?customer=${customerId}`);
  };

  const toggleCustomerExpansion = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={fetchCustomers}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Customers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCustomer}
            size="large"
            sx={{ 
              py: 1.5,
              px: 4,
              fontSize: '1.1rem'
            }}
          >
            Add Customer
          </Button>
        </Stack>

        {customers.length === 0 ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Alert 
              severity="info"
              sx={{ 
                '& .MuiAlert-message': {
                  fontSize: '1.1rem'
                }
              }}
            >
              No customers found. Add your first customer!
            </Alert>
          </Paper>
        ) : (
          <TableContainer 
            component={Paper}
            elevation={3}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              maxWidth: '900px',
              mx: 'auto'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '40px' }}></TableCell>
                  <TableCell sx={{ width: '25%' }}>Name</TableCell>
                  <TableCell sx={{ width: '30%' }}>Email</TableCell>
                  <TableCell sx={{ width: '15%' }}>Phone</TableCell>
                  <TableCell sx={{ width: '15%' }}>Status</TableCell>
                  <TableCell sx={{ width: '10%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <React.Fragment key={customer._id}>
                    <TableRow 
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleCustomerExpansion(customer._id)}
                        >
                          {expandedCustomer === customer._id ? 
                            <KeyboardArrowUpIcon /> : 
                            <KeyboardArrowDownIcon />
                          }
                        </IconButton>
                      </TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.isActive ? 'Active' : 'Inactive'}
                          color={customer.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleViewCustomer(customer._id)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            color="secondary" 
                            onClick={() => handleAddOrder(customer._id)}
                            size="small"
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={expandedCustomer === customer._id} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Recent Orders
                            </Typography>
                            <Grid container spacing={2}>
                              {customer.orders && customer.orders.length > 0 ? (
                                customer.orders.map((order) => (
                                  <Grid item xs={12} sm={6} md={4} key={order._id}>
                                    <Card>
                                      <CardContent>
                                        <Typography variant="subtitle1">
                                          Order #{order.orderNumber}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Amount: ₹{order.totalAmount.toFixed(2)}
                                        </Typography>
                                        <Stack direction="row" spacing={1} mt={1}>
                                          <Chip 
                                            label={order.status}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                          />
                                          <Chip 
                                            label={order.paymentStatus}
                                            color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                                            size="small"
                                          />
                                        </Stack>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))
                              ) : (
                                <Grid item xs={12}>
                                  <Alert severity="info">
                                    No orders found for this customer
                                  </Alert>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default CustomerList; 