import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Stack,
  Button
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from 'axios';
import { API_URL } from '../config';

const CampaignLogs = () => {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaignStatus, setCampaignStatus] = useState(null);
  const [stats, setStats] = useState({
    audienceSize: 0,
    sent: 0,
    failed: 0
  });
  const [retryCount, setRetryCount] = useState(0);
  const [startingCampaign, setStartingCampaign] = useState(false);

  const fetchLogs = async () => {
    if (!id) {
      setError('Campaign ID is missing');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/campaigns/${id}/logs`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setLogs(response.data.logs || []);
      setCampaignStatus(response.data.campaignStatus);
      setStats(response.data.stats || {
        audienceSize: 0,
        sent: 0,
        failed: 0
      });
      setError(null);

      // Auto-refresh if campaign is still running
      if (response.data.campaignStatus === 'running') {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      }
    } catch (err) {
      console.error('Error fetching campaign logs:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch campaign logs';
      setError(`${errorMessage}. Please try again.`);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [id, retryCount]);

  const handleStartCampaign = async () => {
    try {
      setStartingCampaign(true);
      setError(null);
      
      // First update status to running
      await axios.patch(`${API_URL}/campaigns/${id}/status`, {
        status: 'running'
      });
      
      // Then trigger message processing
      await axios.post(`${API_URL}/campaigns/${id}/send`);
      
      // Refresh logs
      fetchLogs();
    } catch (err) {
      console.error('Error starting campaign:', err);
      setError('Failed to start campaign. Please try again.');
    } finally {
      setStartingCampaign(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'SENT':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCampaignStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderProgress = () => {
    if (!stats) return null;
    
    const total = stats.audienceSize || 0;
    const completed = (stats.sent || 0) + (stats.failed || 0);
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return (
      <Box sx={{ width: '100%', mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% ({completed} of {total} messages processed)
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Campaign Delivery Logs
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Typography variant="h4">
          Campaign Delivery Logs
        </Typography>
        {campaignStatus && (
          <Chip
            label={campaignStatus.toUpperCase()}
            color={getCampaignStatusColor(campaignStatus)}
            sx={{ ml: 2 }}
          />
        )}
        {campaignStatus === 'draft' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartCampaign}
            disabled={startingCampaign}
          >
            {startingCampaign ? 'Starting...' : 'Start Campaign'}
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {campaignStatus === 'running' && renderProgress()}

      {!error && (!logs || logs.length === 0) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {campaignStatus === 'running' 
            ? 'Campaign is being processed. Messages will appear here shortly...'
            : campaignStatus === 'draft'
            ? 'Campaign has not started processing yet. Click the Start Campaign button to begin.'
            : 'No delivery logs available.'}
        </Alert>
      )}

      {logs && logs.length > 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2}>
              <Chip 
                label={`Total Messages: ${stats?.audienceSize || 0}`}
                color="default"
                variant="outlined"
              />
              <Chip 
                label={`Sent: ${stats?.sent || 0}`}
                color="success"
                variant="outlined"
              />
              <Chip 
                label={`Failed: ${stats?.failed || 0}`}
                color="error"
                variant="outlined"
              />
            </Stack>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Time</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>{log.customerId?.name || 'Unknown'}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        color={getStatusColor(log.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {log.deliveryReceipt?.timestamp
                        ? new Date(log.deliveryReceipt.timestamp).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {log.deliveryReceipt?.errorMessage || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default CampaignLogs; 