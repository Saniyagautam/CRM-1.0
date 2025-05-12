import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';
import { API_URL } from '../config';

const FIELD_OPTIONS = [
  { value: 'totalSpend', label: 'Total Spend' },
  { value: 'totalPurchases', label: 'Total Purchases' },
  { value: 'lastPurchase', label: 'Last Purchase' },
  { value: 'averageOrderValue', label: 'Average Order Value' },
  { value: 'orderFrequency', label: 'Order Frequency' },
  { value: 'paymentMethod', label: 'Payment Method' },
  { value: 'orderStatus', label: 'Order Status' }
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not Equals' },
  { value: 'greaterThan', label: 'Greater Than' },
  { value: 'lessThan', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Not Contains' },
  { value: 'in', label: 'In' },
  { value: 'notIn', label: 'Not In' }
];

const CampaignBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [audienceSize, setAudienceSize] = useState(null);
  const [campaign, setCampaign] = useState({
    name: '',
    description: '',
    messageContent: '',
    messageTemplate: 'Hi {{customerName}}, {{message}}',
    status: 'draft',
    stats: {
      audienceSize: 0,
      sent: 0,
      failed: 0
    }
  });
  const [segmentConditions, setSegmentConditions] = useState([
    {
      operator: 'AND',
      rules: [
        {
          field: '',
          operator: '',
          value: ''
        }
      ]
    }
  ]);
  const [success, setSuccess] = useState(null);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [messageSuggestions, setMessageSuggestions] = useState([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [campaignObjective, setCampaignObjective] = useState('');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [convertingRules, setConvertingRules] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await axios.get(`${API_URL}/campaigns/${id}`);
      setCampaign(response.data);
    } catch (err) {
      setError('Failed to fetch campaign details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'messageContent') {
      // Clean up any duplicate templates in the message content
      let cleanedValue = value;
      if (cleanedValue.includes('Hi {{customerName}}, Hi {{customerName}}')) {
        cleanedValue = cleanedValue.replace('Hi {{customerName}}, Hi {{customerName}}', 'Hi {{customerName}}');
      }
      setCampaign(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
    } else {
      setCampaign(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleConditionGroupChange = (groupIndex, field, value) => {
    setSegmentConditions(prev => {
      const newConditions = [...prev];
      newConditions[groupIndex] = {
        ...newConditions[groupIndex],
        [field]: value
      };
      return newConditions;
    });
  };

  const handleRuleChange = (groupIndex, ruleIndex, field, value) => {
    setSegmentConditions(prev => {
      const newConditions = [...prev];
      newConditions[groupIndex].rules[ruleIndex] = {
        ...newConditions[groupIndex].rules[ruleIndex],
        [field]: value
      };
      return newConditions;
    });
  };

  const addConditionGroup = () => {
    setSegmentConditions(prev => [
      ...prev,
      {
        operator: 'AND',
        rules: [
          {
            field: '',
            operator: '',
            value: ''
          }
        ]
      }
    ]);
  };

  const removeConditionGroup = (groupIndex) => {
    setSegmentConditions(prev => prev.filter((_, index) => index !== groupIndex));
  };

  const addRule = (groupIndex) => {
    setSegmentConditions(prev => {
      const newConditions = [...prev];
      newConditions[groupIndex].rules.push({
        field: '',
        operator: '',
        value: ''
      });
      return newConditions;
    });
  };

  const removeRule = (groupIndex, ruleIndex) => {
    setSegmentConditions(prev => {
      const newConditions = [...prev];
      newConditions[groupIndex].rules = newConditions[groupIndex].rules.filter(
        (_, index) => index !== ruleIndex
      );
      return newConditions;
    });
  };

  const previewAudience = async () => {
    try {
      setPreviewLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/campaigns/segments/preview`, {
        conditions: segmentConditions
      });
      setAudienceSize(response.data.audienceSize);
    } catch (err) {
      console.error('Error previewing audience:', err);
      setError('Failed to preview audience size. Please check your rules.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Validate required fields
      if (!campaign.name || !campaign.description || !campaign.messageContent) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate segment conditions
      if (!segmentConditions.length || !segmentConditions[0].rules.length) {
        setError('Please add at least one audience rule');
        setLoading(false);
        return;
      }

      // First create the segment
      const segmentResponse = await axios.post(`${API_URL}/campaigns/segments`, {
        name: `${campaign.name} Segment`,
        description: campaign.description,
        conditions: segmentConditions
      });

      if (!segmentResponse.data || !segmentResponse.data._id) {
        throw new Error('Failed to create segment');
      }

      // Then create the campaign
      const campaignResponse = await axios.post(`${API_URL}/campaigns/from-segment`, {
        segmentId: segmentResponse.data._id,
        name: campaign.name,
        description: campaign.description,
        messageContent: campaign.messageContent
      });

      if (!campaignResponse.data || !campaignResponse.data._id) {
        throw new Error('Failed to create campaign');
      }

      setSuccess('Campaign saved successfully!');
      
      // Wait for a short moment to show the success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to campaigns page
      navigate('/campaigns');
      
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save campaign');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const generateMessageSuggestions = async () => {
    try {
      setGeneratingSuggestions(true);
      setError(null);

      // Determine audience type based on segment conditions or default to General Audience
      let audienceType = 'General Audience';
      if (segmentConditions.length > 0 && segmentConditions[0].rules.length > 0) {
        const firstRule = segmentConditions[0].rules[0];
        if (firstRule.field === 'lastPurchase') {
          audienceType = 'Inactive Customers';
        } else if (firstRule.field === 'totalSpend') {
          audienceType = 'High-Value Customers';
        }
      }

      const response = await axios.post(`${API_URL}/campaigns/generate-suggestions`, {
        campaignObjective,
        audienceType
      });

      setMessageSuggestions(response.data);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate message suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Remove any duplicate Hi {{customerName}} if it exists in the suggestion
    let cleanedSuggestion = suggestion;
    if (cleanedSuggestion.includes('Hi {{customerName}}, Hi {{customerName}}')) {
      cleanedSuggestion = cleanedSuggestion.replace('Hi {{customerName}}, Hi {{customerName}}', 'Hi {{customerName}}');
    }
    
    setCampaign(prev => ({
      ...prev,
      messageContent: cleanedSuggestion
    }));
    setMessageSuggestions([]);
  };

  const handleNaturalLanguageConvert = async () => {
    try {
      setConvertingRules(true);
      setError(null);

      const response = await axios.post(`${API_URL}/campaigns/generate-suggestions/convert-rules`, {
        naturalLanguage: naturalLanguageInput
      });

      if (response.data && response.data.rules) {
        setSegmentConditions(response.data.rules);
        setSuccess('Successfully converted to segment rules!');
      } else {
        throw new Error('Failed to convert rules');
      }
    } catch (err) {
      console.error('Error converting rules:', err);
      setError('Failed to convert natural language to rules. Please try a different description.');
    } finally {
      setConvertingRules(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Campaign' : 'New Campaign'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Campaign Name"
                  name="name"
                  value={campaign.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={campaign.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Audience Rules
                </Typography>

                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Describe your audience in natural language
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Describe your audience"
                        value={naturalLanguageInput}
                        onChange={(e) => setNaturalLanguageInput(e.target.value)}
                        placeholder="e.g., People who haven't shopped in 6 months and spent over ₹5K"
                        helperText="Use natural language to describe your target audience"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<SmartToyIcon />}
                        onClick={handleNaturalLanguageConvert}
                        disabled={!naturalLanguageInput || convertingRules}
                      >
                        {convertingRules ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Convert to Rules'
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {segmentConditions.map((group, groupIndex) => (
                  <Card key={groupIndex} sx={{ mb: 2 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <FormControl sx={{ minWidth: 120 }}>
                          <InputLabel>Operator</InputLabel>
                          <Select
                            value={group.operator}
                            label="Operator"
                            onChange={(e) => handleConditionGroupChange(groupIndex, 'operator', e.target.value)}
                          >
                            <MenuItem value="AND">AND</MenuItem>
                            <MenuItem value="OR">OR</MenuItem>
                          </Select>
                        </FormControl>
                        <IconButton
                          color="error"
                          onClick={() => removeConditionGroup(groupIndex)}
                          disabled={segmentConditions.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>

                      {group.rules.map((rule, ruleIndex) => (
                        <Box key={ruleIndex} sx={{ mb: 2 }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel>Field</InputLabel>
                                <Select
                                  value={rule.field}
                                  label="Field"
                                  onChange={(e) => handleRuleChange(groupIndex, ruleIndex, 'field', e.target.value)}
                                >
                                  {FIELD_OPTIONS.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel>Operator</InputLabel>
                                <Select
                                  value={rule.operator}
                                  label="Operator"
                                  onChange={(e) => handleRuleChange(groupIndex, ruleIndex, 'operator', e.target.value)}
                                >
                                  {OPERATOR_OPTIONS.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={5}>
                              <TextField
                                fullWidth
                                label="Value"
                                value={rule.value}
                                onChange={(e) => handleRuleChange(groupIndex, ruleIndex, 'value', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton
                                color="error"
                                onClick={() => removeRule(groupIndex, ruleIndex)}
                                disabled={group.rules.length === 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}

                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => addRule(groupIndex)}
                        sx={{ mt: 1 }}
                      >
                        Add Rule
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  startIcon={<AddIcon />}
                  onClick={addConditionGroup}
                  sx={{ mt: 2 }}
                >
                  Add Condition Group
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    onClick={previewAudience}
                    disabled={previewLoading}
                  >
                    {previewLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Preview Audience Size'
                    )}
                  </Button>
                  {audienceSize !== null && (
                    <Typography>
                      Audience Size: {audienceSize} customers
                    </Typography>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Campaign Message
                </Typography>
                
                <TextField
                  fullWidth
                  label="Campaign Objective"
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value)}
                  placeholder="e.g., Bring back inactive users, Promote new products"
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={generateMessageSuggestions}
                  disabled={!campaignObjective || generatingSuggestions}
                  sx={{ mb: 2 }}
                >
                  {generatingSuggestions ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Generate Message Suggestions'
                  )}
                </Button>

                {messageSuggestions.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      AI-Generated Message Suggestions:
                    </Typography>
                    <Stack spacing={1}>
                      {messageSuggestions.map((suggestion, index) => (
                        <Card key={index} variant="outlined">
                          <CardContent>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              {suggestion}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              Use This Message
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Message"
                  name="messageContent"
                  value={campaign.messageContent}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  helperText="Use {{customerName}} to personalize the message"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !campaign.name || !campaign.description || !segmentConditions.length || !campaign.messageContent}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save & Send Campaign'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      <Dialog open={deliveryDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Campaign Delivery</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={2}>
            {deliveryStatus === 'preparing' && (
              <>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Preparing campaign delivery...
                </Typography>
              </>
            )}
            {deliveryStatus === 'complete' && (
              <>
                <Typography variant="h6" color="success.main">
                  Campaign delivery started!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Redirecting to delivery logs...
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliveryDialog(false)} disabled={deliveryStatus === 'preparing'}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignBuilder; 