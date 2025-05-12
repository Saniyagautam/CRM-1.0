const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.apiUrl = 'https://api.grok.ai/v1/chat/completions';
  }

  async generateMessageSuggestions(campaignObjective, audienceType) {
    try {
      // For now, return predefined suggestions based on campaign objective
      const suggestions = this.getPredefinedSuggestions(campaignObjective, audienceType);
      return suggestions;
    } catch (error) {
      console.error('Error generating message suggestions:', error);
      // Return basic fallback suggestions
      return [
        `Hi {{customerName}}, we have an exciting update for you! ${campaignObjective}`,
        `Hey {{customerName}}, don't miss out on this special opportunity! ${campaignObjective}`,
        `{{customerName}}, we've got something special just for you! ${campaignObjective}`
      ];
    }
  }

  getPredefinedSuggestions(campaignObjective, audienceType) {
    const objective = campaignObjective.toLowerCase();
    let suggestions = [];

    if (objective.includes('bring back') || objective.includes('inactive')) {
      suggestions = [
        'Hi {{customerName}}, we miss you! Come back and enjoy 20% off your next purchase.',
        'Hey {{customerName}}, it\'s been a while! Here\'s a special offer just for you.',
        '{{customerName}}, we\'ve got something special waiting for you. Come check it out!'
      ];
    } else if (objective.includes('promote') || objective.includes('new product')) {
      suggestions = [
        'Hi {{customerName}}, check out our latest collection! New arrivals are here.',
        'Hey {{customerName}}, discover our newest products with exclusive early access.',
        '{{customerName}}, be the first to explore our exciting new products!'
      ];
    } else if (objective.includes('engagement') || objective.includes('community')) {
      suggestions = [
        'Hi {{customerName}}, join our community and get exclusive benefits!',
        'Hey {{customerName}}, stay connected with us for amazing updates and offers.',
        '{{customerName}}, don\'t miss out on our latest news and special deals!'
      ];
    } else {
      suggestions = [
        `Hi {{customerName}}, we have something special for you! ${campaignObjective}`,
        `Hey {{customerName}}, check out our latest offers! ${campaignObjective}`,
        `{{customerName}}, don't miss this amazing opportunity! ${campaignObjective}`
      ];
    }

    // Add audience-specific customization
    if (audienceType === 'Inactive Customers') {
      suggestions = suggestions.map(msg => msg + ' We\'d love to see you back!');
    } else if (audienceType === 'High-Value Customers') {
      suggestions = suggestions.map(msg => msg + ' As a valued customer, you get priority access!');
    }

    return suggestions;
  }

  async generateCampaignInsights(campaignStats) {
    try {
      const deliveryRate = ((campaignStats.sent / campaignStats.audienceSize) * 100).toFixed(1);
      
      return `Campaign Summary:
• Total Audience: ${campaignStats.audienceSize} customers
• Successfully Delivered: ${campaignStats.sent} messages
• Failed Deliveries: ${campaignStats.failed} messages
• Overall Delivery Rate: ${deliveryRate}%

${deliveryRate >= 90 ? 'Excellent delivery performance!' : 
  deliveryRate >= 70 ? 'Good delivery rate, but room for improvement.' : 
  'Delivery rate needs attention. Consider reviewing your contact list.'}`;
    } catch (error) {
      console.error('Error generating campaign insights:', error);
      return 'Unable to generate campaign insights at this time.';
    }
  }

  async convertToSegmentRules(naturalLanguage) {
    try {
      // Parse common patterns in natural language
      const rules = [];
      const text = naturalLanguage.toLowerCase();

      // Check for time-based conditions
      if (text.includes('haven\'t shopped') || text.includes('not shopped') || text.includes('last purchase')) {
        const months = this.extractNumber(text);
        if (months) {
          rules.push({
            field: 'lastPurchase',
            operator: 'lessThan',
            value: `${months} months ago`
          });
        }
      }

      // Check for spending conditions
      if (text.includes('spent') || text.includes('spending') || text.includes('purchase amount')) {
        const amount = this.extractNumber(text);
        if (amount) {
          rules.push({
            field: 'totalSpend',
            operator: 'greaterThan',
            value: amount.toString()
          });
        }
      }

      // Check for purchase frequency
      if (text.includes('purchase frequency') || text.includes('order frequency')) {
        const frequency = this.extractNumber(text);
        if (frequency) {
          rules.push({
            field: 'totalPurchases',
            operator: 'greaterThan',
            value: frequency.toString()
          });
        }
      }

      // Check for average order value
      if (text.includes('average order') || text.includes('average purchase')) {
        const amount = this.extractNumber(text);
        if (amount) {
          rules.push({
            field: 'averageOrderValue',
            operator: 'greaterThan',
            value: amount.toString()
          });
        }
      }

      // If no rules were generated, return a default rule
      if (rules.length === 0) {
        return [{
          operator: 'AND',
          rules: [{
            field: 'totalSpend',
            operator: 'greaterThan',
            value: '0'
          }]
        }];
      }

      // Return the rules in the expected format
      return [{
        operator: 'AND',
        rules: rules
      }];
    } catch (error) {
      console.error('Error converting to segment rules:', error);
      return [{
        operator: 'AND',
        rules: [{
          field: 'totalSpend',
          operator: 'greaterThan',
          value: '0'
        }]
      }];
    }
  }

  extractNumber(text) {
    // Extract numbers from text, handling currency symbols and units
    const matches = text.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand|months?|years?|days?)?/i);
    if (matches) {
      let number = parseFloat(matches[1]);
      // Convert K/thousand to actual number
      if (text.includes('k') || text.includes('thousand')) {
        number *= 1000;
      }
      return number;
    }
    return null;
  }
}

module.exports = new AIService(); 