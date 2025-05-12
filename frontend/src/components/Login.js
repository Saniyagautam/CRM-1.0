import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Add this line for debugging
  console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log('Decoded token:', decoded);
    login({
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      token: credentialResponse.credential,
    });
    
    // Redirect to the previous page or dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
  };

  const handleGoogleError = () => {
    console.error('Login Failed');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to CRM
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please sign in to access campaigns
        </Typography>
        
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
        />
      </Paper>
    </Box>
  );
};

export default Login; 