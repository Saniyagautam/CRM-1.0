const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/communicationLog');
const Campaign = require('../models/campaign');

// Simulate vendor API for sending messages
router.post('/send', async (req, res) => {
  try {
    const { message, customerId, customerName, campaignId } = req.body;

    // Validate required fields
    if (!customerId || !message || !campaignId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find existing communication log
    const log = await CommunicationLog.findOne({
      campaignId,
      customerId,
      status: 'PENDING'
    });

    if (!log) {
      return res.status(404).json({ error: 'Communication log not found' });
    }

    res.json({
      success: true,
      message: 'Message queued for delivery',
      logId: log._id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Delivery receipt endpoint
router.post('/delivery-receipt', async (req, res) => {
  try {
    const { logId, status, errorMessage } = req.body;

    // Find the communication log
    const log = await CommunicationLog.findById(logId);
    if (!log) {
      return res.status(404).json({ error: 'Communication log not found' });
    }

    // Only update if the log is in PENDING status
    if (log.status === 'PENDING') {
      // Update log status
      log.status = status === 'DELIVERED' ? 'SENT' : 'FAILED';
      log.deliveryReceipt = {
        status,
        timestamp: new Date(),
        errorMessage
      };
      await log.save();

      // Update campaign stats
      const campaign = await Campaign.findById(log.campaignId);
      if (campaign) {
        // Get current stats from all logs
        const stats = await CommunicationLog.aggregate([
          { $match: { campaignId: log.campaignId } },
          { $group: {
            _id: null,
            sent: { $sum: { $cond: [{ $eq: ['$status', 'SENT'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } }
          }}
        ]);

        if (stats.length > 0) {
          campaign.stats.sent = stats[0].sent;
          campaign.stats.failed = stats[0].failed;
          campaign.stats.lastUpdated = new Date();
          await campaign.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Delivery receipt processed',
      log
    });
  } catch (error) {
    console.error('Error processing delivery receipt:', error);
    res.status(500).json({ error: 'Error processing delivery receipt' });
  }
});

module.exports = router; 