const express = require('express');
const Campaign = require('../models/campaign');
const Segment = require('../models/segment');
const Customer = require('../models/customer');
const CommunicationLog = require('../models/communicationLog');
const vendorService = require('../services/vendorService');
const aiService = require('../services/aiService');
const mongoose = require('mongoose');

const router = express.Router();

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segment', 'name audienceSize')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Error fetching campaigns' });
  }
});

// Create a new campaign from segment
router.post('/from-segment', async (req, res) => {
  try {
    const { segmentId, name, description, messageContent } = req.body;

    // Validate segment exists
    const segment = await Segment.findById(segmentId).populate('customers');
    if (!segment) {
      return res.status(400).json({ error: 'Segment not found' });
    }

    // Create campaign - messageContent already contains the full message with placeholders
    const campaign = new Campaign({
      name,
      description,
      segment: segmentId,
      messageContent,
      status: 'draft',
      stats: {
        audienceSize: segment.customers.length,
        sent: 0,
        failed: 0,
        lastUpdated: new Date()
      }
    });

    await campaign.save();

    // Return the campaign with populated segment
    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('segment');

    res.status(201).json(populatedCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(400).json({ error: 'Error creating campaign' });
  }
});

// Generate AI message suggestions
router.post('/generate-suggestions', async (req, res) => {
  try {
    const { campaignObjective, audienceType } = req.body;
    
    if (!campaignObjective) {
      return res.status(400).json({ error: 'Campaign objective is required' });
    }

    const suggestions = await aiService.generateMessageSuggestions(campaignObjective, audienceType);
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating message suggestions:', error);
    res.status(500).json({ error: 'Failed to generate message suggestions' });
  }
});

// Convert natural language to segment rules
router.post('/generate-suggestions/convert-rules', async (req, res) => {
  try {
    const { naturalLanguage } = req.body;
    
    if (!naturalLanguage) {
      return res.status(400).json({ error: 'Natural language description is required' });
    }

    const rules = await aiService.convertToSegmentRules(naturalLanguage);
    res.json({ rules });
  } catch (error) {
    console.error('Error converting rules:', error);
    res.status(400).json({ error: 'Error converting natural language to rules' });
  }
});

// Start campaign delivery
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;

    // Get campaign and its segment
    const campaign = await Campaign.findById(id)
      .populate({
        path: 'segment',
        populate: {
          path: 'customers',
          model: 'Customer'
        }
      });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Process messages using the campaign model method
    await campaign.processMessages();

    res.json({ 
      success: true, 
      message: 'Campaign started successfully',
      campaignId: campaign._id,
      status: campaign.status
    });

  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ error: 'Failed to start campaign: ' + error.message });
  }
});

// Get a single campaign with communication logs
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segment')
      .populate({
        path: 'communicationLogs',
        populate: {
          path: 'customer',
          select: 'name email'
        }
      });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Error fetching campaign' });
  }
});

// Update campaign status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!status || !['draft', 'scheduled', 'running', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign status:', error);
    res.status(500).json({ error: 'Error updating campaign status' });
  }
});

// Get campaign communication logs
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate campaign ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid campaign ID format' });
    }

    // First check if campaign exists
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get logs with proper ObjectId conversion
    const logs = await CommunicationLog.aggregate([
      { 
        $match: { 
          campaignId: new mongoose.Types.ObjectId(id) 
        } 
      },
      { $sort: { createdAt: -1 } },
      { 
        $group: {
          _id: '$customerId',
          latestLog: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestLog' } }
    ]);
    
    // Populate customer details
    await CommunicationLog.populate(logs, {
      path: 'customerId',
      select: 'name email'
    });
    
    // Get campaign stats
    const stats = campaign.stats || {
      audienceSize: 0,
      sent: 0,
      failed: 0
    };
    
    res.json({
      logs,
      campaignStatus: campaign.status,
      stats
    });
  } catch (error) {
    console.error('Error fetching campaign logs:', error);
    res.status(500).json({ error: error.message || 'Error fetching campaign logs' });
  }
});

// Delete a campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Error deleting campaign' });
  }
});

// Segment routes
// Get all segments
router.get('/segments', async (req, res) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 });
    res.json(segments);
  } catch (error) {
    console.error('Error fetching segments:', error);
    res.status(500).json({ error: 'Error fetching segments' });
  }
});

// Get a single segment
router.get('/segments/:id', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    res.json(segment);
  } catch (error) {
    console.error('Error fetching segment:', error);
    res.status(500).json({ error: 'Error fetching segment' });
  }
});

// Create a new segment
router.post('/segments', async (req, res) => {
  try {
    const { name, description, conditions } = req.body;

    const segment = new Segment({
      name,
      description,
      conditions
    });

    // Calculate initial audience size
    await segment.updateAudienceSize();

    res.status(201).json(segment);
  } catch (error) {
    console.error('Error creating segment:', error);
    res.status(400).json({ error: 'Error creating segment' });
  }
});

// Preview segment audience size
router.post('/segments/preview', async (req, res) => {
  try {
    const { conditions } = req.body;

    const segment = new Segment({
      name: 'Preview',
      conditions
    });

    const audienceSize = await segment.updateAudienceSize();
    res.json({ audienceSize });
  } catch (error) {
    console.error('Error previewing segment:', error);
    res.status(400).json({ error: 'Error previewing segment' });
  }
});

// Update segment
router.put('/segments/:id', async (req, res) => {
  try {
    const { name, description, conditions } = req.body;
    const segment = await Segment.findByIdAndUpdate(
      req.params.id,
      { name, description, conditions },
      { new: true, runValidators: true }
    );
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Update audience size
    await segment.updateAudienceSize();

    res.json(segment);
  } catch (error) {
    console.error('Error updating segment:', error);
    res.status(400).json({ error: 'Error updating segment' });
  }
});

// Delete a segment
router.delete('/segments/:id', async (req, res) => {
  try {
    const segment = await Segment.findByIdAndDelete(req.params.id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    res.json({ message: 'Segment deleted successfully' });
  } catch (error) {
    console.error('Error deleting segment:', error);
    res.status(500).json({ error: 'Error deleting segment' });
  }
});

// Delivery receipt webhook endpoint
router.post('/api/delivery-receipt', async (req, res) => {
  try {
    const { messageId, status, timestamp, errorMessage } = req.body;
    
    const log = await CommunicationLog.findOne({ 'deliveryReceipt.messageId': messageId });
    if (!log) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    log.deliveryReceipt = {
      status,
      timestamp: new Date(timestamp),
      errorMessage
    };
    log.status = status === 'DELIVERED' ? 'SENT' : 'FAILED';
    await log.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 