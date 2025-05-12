import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Stack
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left side - CRM and Home */}
        <Stack direction="row" spacing={2} alignItems="center">

        <Button 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            startIcon={<HomeIcon />}
          >
            CRM Dashboard
          </Button>
        </Stack>

        {/* Right side - Orders, Customers, Campaigns */}
        <Stack direction="row" spacing={2}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/orders')}
            startIcon={<ShoppingCartIcon />}
          >
            Orders
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/customers')}
            startIcon={<PeopleIcon />}
          >
            Customers
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/campaigns')}
            startIcon={<CampaignIcon />}
          >
            Campaigns
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 