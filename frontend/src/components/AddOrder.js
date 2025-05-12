import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Container,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AddOrder = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    orderDate: new Date().toISOString().split('T')[0],
    items: [{
      name: '',
      quantity: 1,
      price: 0
    }],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${API_URL}/customers`);
        setCustomers(response.data);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to fetch customers. Please try again.');
      }
    };
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value
      }
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { street, city, state, zipCode, country } = formData.shippingAddress;
      if (!street || !city || !state || !zipCode || !country) {
        throw new Error('All shipping address fields are required');
      }

      const orderData = {
        ...formData,
        totalAmount: calculateTotal()
      };

      const response = await axios.post(`${API_URL}/orders`, orderData);
      console.log('Order created:', response.data);
      navigate('/orders');
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Order
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Order Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Order Date"
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Customer Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    required
                    label="Customer"
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Items */}
              {formData.items.map((item, index) => (
                <Grid item xs={12} key={index} container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Item Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      required
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      required
                      InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                    />
                  </Grid>
                </Grid>
              ))}

              {/* Add/Remove Item Buttons */}
              <Grid item xs={12}>
                <Button type="button" onClick={addItem} variant="outlined" sx={{ mr: 1 }}>
                  Add Item
                </Button>
                {formData.items.length > 1 && (
                  <Button type="button" onClick={() => removeItem(formData.items.length - 1)} color="error" variant="outlined">
                    Remove Last Item
                  </Button>
                )}
              </Grid>

              {/* Shipping Address */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Shipping Address
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="street"
                  value={formData.shippingAddress.street}
                  onChange={handleShippingAddressChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.shippingAddress.city}
                  onChange={handleShippingAddressChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.shippingAddress.state}
                  onChange={handleShippingAddressChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.shippingAddress.zipCode}
                  onChange={handleShippingAddressChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.shippingAddress.country}
                  onChange={handleShippingAddressChange}
                  required
                />
              </Grid>

              {/* Order Status */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Order Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    label="Order Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Payment Status */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleInputChange}
                    required
                    label="Payment Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Payment Method */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Total Amount Display */}
              <Grid item xs={12}>
                <Typography variant="h5" align="right" sx={{ mt: 2, fontWeight: 'bold' }}>
                  Total Amount: ₹{calculateTotal().toFixed(2)}
                </Typography>
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/orders')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Order'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddOrder; 