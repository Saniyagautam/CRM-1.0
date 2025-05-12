import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Container,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'default';
    case 'scheduled':
      return 'info';
    case 'running':
      return 'warning';
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const CampaignHistory = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/campaigns`);
      setCampaigns(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleViewCampaign = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };

  const handleCreateCampaign = () => {
    navigate('/campaign/new');
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/campaigns/${campaignToDelete._id}`);
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
      // Refresh the campaigns list
      fetchCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign. Please try again later.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
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
              onClick={fetchCampaigns}
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
            Campaigns
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCampaign}
            size="large"
            sx={{ 
              py: 1.5,
              px: 4,
              fontSize: '1.1rem'
            }}
          >
            Create Campaign
          </Button>
        </Stack>

        {campaigns.length === 0 ? (
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
              No campaigns found. Create your first campaign!
            </Alert>
          </Paper>
        ) : (
          <TableContainer 
            component={Paper}
            elevation={3}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Audience Size</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Stats</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow 
                    key={campaign._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="subtitle1">
                        {campaign.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {campaign.stats.audienceSize}
                    </TableCell>
                    <TableCell sx={{ width: '200px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(campaign.stats.sent / campaign.stats.audienceSize) * 100}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round((campaign.stats.sent / campaign.stats.audienceSize) * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={`Sent: ${campaign.stats.sent}`}
                          color="success"
                          size="small"
                        />
                        <Chip 
                          label={`Failed: ${campaign.stats.failed}`}
                          color="error"
                          size="small"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          color="secondary" 
                          onClick={() => navigate(`/campaign/${campaign._id}/logs`)}
                          title="View Logs"
                        >
                          <HistoryIcon />
                        </IconButton>
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteClick(campaign)}
                          title="Delete Campaign"
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
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the campaign "{campaignToDelete?.name}"? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignHistory; 