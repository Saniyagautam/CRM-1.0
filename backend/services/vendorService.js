const axios = require('axios');

class VendorService {
  constructor() {
    // No need for Twilio initialization
  }

  async sendMessage(message, customer, campaignId) {
    try {
      // Call the internal vendor API endpoint
      const response = await axios.post('http://localhost:5000/api/vendor/send', {
        message,
        customerId: customer._id,
        customerName: customer.name,
        campaignId
      });

      // Simulate delivery receipt
      const deliveryReceipt = await this.simulateDeliveryReceipt(response.data.logId);
      
      // Update the message status based on delivery simulation
      await axios.post('http://localhost:5000/api/vendor/delivery-receipt', {
        logId: response.data.logId,
        status: deliveryReceipt.status,
        errorMessage: deliveryReceipt.errorMessage
      });

      return {
        success: deliveryReceipt.status === 'DELIVERED',
        messageId: response.data.logId,
        timestamp: deliveryReceipt.timestamp,
        status: deliveryReceipt.status
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async simulateDeliveryReceipt(messageId) {
    // Simulate 95% delivery success rate
    const isDelivered = Math.random() < 0.95;
    
    return {
      messageId,
      status: isDelivered ? 'DELIVERED' : 'FAILED',
      timestamp: new Date(),
      errorMessage: isDelivered ? null : 'Simulated delivery failure'
    };
  }

  mapTwilioStatus(twilioStatus) {
    // Keep this for future Twilio integration
    const statusMap = {
      'queued': 'PENDING',
      'sending': 'PENDING',
      'sent': 'SENT',
      'delivered': 'DELIVERED',
      'undelivered': 'FAILED',
      'failed': 'FAILED'
    };
    return statusMap[twilioStatus] || 'UNKNOWN';
  }
}

module.exports = new VendorService(); 