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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReplayIcon from '@mui/icons-material/Replay';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders`, {
        timeout: 5000
      });
      console.log('Orders data:', response.data);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check if the backend server is running.');
      } else if (!err.response) {
        setError('Network error. Please check if the backend server is running at http://localhost:5000');
      } else {
        setError('Failed to fetch orders. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleAddOrder = () => {
    navigate('/order/new');
  };

  const handleRetryPayment = async (orderId) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/orders/${orderId}/retry-payment`);
      await fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error retrying payment:', error);
      setError('Failed to retry payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/orders/${orderToDelete}`);
      await fetchOrders(); // Refresh the list
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (orderId) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleEditOrder = (orderId) => {
    navigate(`/order/edit/${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
              onClick={fetchOrders}
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
            Orders
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddOrder}
            size="large"
            sx={{ 
              py: 1.5,
              px: 4,
              fontSize: '1.1rem'
            }}
          >
            Add Order
          </Button>
        </Stack>

        {orders.length === 0 ? (
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
              No orders found. Add your first order!
            </Alert>
          </Paper>
        ) : (
          <TableContainer 
            component={Paper}
            elevation={3}
            sx={{ 
              borderRadius: 2,
              overflow: 'auto',
              maxWidth: '100%',
              '& .MuiTable-root': {
                minWidth: 800
              }
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow 
                    key={order._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.paymentMethod.replace('_', ' ').toUpperCase()}
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={order.paymentStatus}
                          color={order.paymentStatus === 'paid' ? 'success' : 
                                 order.paymentStatus === 'failed' ? 'error' : 'warning'}
                          size="small"
                        />
                        {order.paymentStatus !== 'paid' && (
                          <IconButton
                            size="small"
                            onClick={() => handleRetryPayment(order._id)}
                            title="Retry Payment"
                          >
                            <ReplayIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        
                        <IconButton
                          color="info"
                          onClick={() => handleEditOrder(order._id)}
                          title="Edit Order"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteDialog(order._id)}
                          title="Delete Order"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteOrder} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OrderList; 