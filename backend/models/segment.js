const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    enum: [
      'totalSpend',
      'totalPurchases',
      'lastPurchase',
      'averageOrderValue',
      'orderFrequency',
      'paymentMethod',
      'orderStatus'
    ]
  },
  operator: {
    type: String,
    required: true,
    enum: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'contains', 'notContains', 'in', 'notIn']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const conditionGroupSchema = new mongoose.Schema({
  operator: {
    type: String,
    required: true,
    enum: ['AND', 'OR']
  },
  rules: [ruleSchema]
});

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  conditions: [conditionGroupSchema],
  customers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  audienceSize: {
    type: Number,
    default: 0
  },
  lastEvaluated: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to evaluate a customer against segment rules
segmentSchema.methods.evaluateCustomer = async function(customerId) {
  const Customer = mongoose.model('Customer');
  const Order = mongoose.model('Order');
  
  const customer = await Customer.findById(customerId);
  if (!customer) return false;

  // Get customer's orders for evaluation
  const orders = await Order.find({ customer: customerId });

  // Calculate customer metrics
  const metrics = {
    totalSpend: customer.totalSpend || 0,
    totalPurchases: customer.totalPurchases || 0,
    lastPurchase: customer.lastPurchase,
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
      : 0,
    orderFrequency: orders.length > 0 
      ? (new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24 * orders.length)
      : 0
  };

  // Evaluate each condition group
  for (const group of this.conditions) {
    const groupResults = await Promise.all(
      group.rules.map(rule => this.evaluateRule(rule, metrics, orders))
    );

    if (group.operator === 'AND' && groupResults.some(result => !result)) {
      return false;
    }
    if (group.operator === 'OR' && !groupResults.some(result => result)) {
      return false;
    }
  }

  return true;
};

// Helper method to evaluate a single rule
segmentSchema.methods.evaluateRule = function(rule, metrics, orders) {
  const value = rule.value;
  const fieldValue = metrics[rule.field];

  switch (rule.operator) {
    case 'equals':
      return fieldValue === value;
    case 'notEquals':
      return fieldValue !== value;
    case 'greaterThan':
      return fieldValue > value;
    case 'lessThan':
      return fieldValue < value;
    case 'contains':
      return fieldValue.includes(value);
    case 'notContains':
      return !fieldValue.includes(value);
    case 'in':
      return value.includes(fieldValue);
    case 'notIn':
      return !value.includes(fieldValue);
    default:
      return false;
  }
};

// Method to update audience size
segmentSchema.methods.updateAudienceSize = async function() {
  const Customer = mongoose.model('Customer');
  const customers = await Customer.find();
  
  // Reset customers array
  this.customers = [];
  let count = 0;

  for (const customer of customers) {
    if (await this.evaluateCustomer(customer._id)) {
      count++;
      this.customers.push(customer._id);
    }
  }

  this.audienceSize = count;
  this.lastEvaluated = new Date();
  await this.save();
  
  return count;
};

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment; 