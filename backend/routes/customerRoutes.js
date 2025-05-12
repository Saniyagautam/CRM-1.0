const express = require('express');
const Customer = require('../models/customer');
const Order = require('../models/order');

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    
    // Get orders for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ customer: customer._id })
          .sort({ createdAt: -1 })
          .limit(5); // Get only the 5 most recent orders
        return {
          ...customer.toObject(),
          orders
        };
      })
    );

    res.json(customersWithOrders);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Error fetching customers' });
  }
});

// Get a single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get all orders for this customer
    const orders = await Order.find({ customer: customer._id })
      .sort({ createdAt: -1 });

    res.json({
      ...customer.toObject(),
      orders
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Error fetching customer' });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(400).json({ error: 'Error creating customer' });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({ error: 'Error updating customer' });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Error deleting customer' });
  }
});

module.exports = router;
