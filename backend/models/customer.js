// models/customerModel.js

const mongoose = require('mongoose');

// Define the schema for the customer with more fields
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  // Last visited date - to track when they last interacted
  lastVisited: {
    type: Date,
    default: Date.now
  },
  // Total purchases made by the customer
  totalPurchases: {
    type: Number,
    default: 0,
    min: [0, 'Total purchases cannot be negative']
  },
  // Total spend - how much money the customer has spent
  totalSpend: {
    type: Number,
    default: 0,
    min: [0, 'Total spend cannot be negative']
  },
  // A history of purchase items with dates and amounts
  purchaseHistory: [{
    productName: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  }],
  // A flag indicating if the customer is active or inactive
  isActive: {
    type: Boolean,
    default: true
  },
  lastPurchase: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
customerSchema.index({ email: 1 });
customerSchema.index({ name: 1 });

// Add a virtual for customer's full details
customerSchema.virtual('fullDetails').get(function() {
  return `${this.name} (${this.email}) - Total Spend: ₹${this.totalSpend}`;
});

// Pre-save middleware to ensure email is lowercase
customerSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
