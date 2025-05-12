import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Stack,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

        {/* Center - Navigation */}
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

        {/* Right side - User Profile */}
        <Stack direction="row" spacing={2} alignItems="center">
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={user.picture}
                  alt={user.name}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="body2" color="inherit">
                  {user.name}
                </Typography>
              </Box>
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 