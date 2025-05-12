import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Dashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Campaigns',
      description: 'Create and manage your marketing campaigns. Reach out to your customers effectively.',
      icon: <CampaignIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/campaigns'),
      color: '#4A90E2',
      gradient: 'linear-gradient(135deg, #4A90E2 0%, #67B8F7 100%)',
      lightColor: '#EBF3FC'
    },
    {
      title: 'Customers',
      description: 'View and manage your customer base. Keep track of customer information and interactions.',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/customers'),
      color: '#50B794',
      gradient: 'linear-gradient(135deg, #50B794 0%, #69D4AE 100%)',
      lightColor: '#ECF9F5'
    },
    {
      title: 'Orders',
      description: 'Track and manage customer orders. Monitor sales and order fulfillment.',
      icon: <ShoppingCartIcon sx={{ fontSize: 48 }} />,
      action: () => navigate('/orders'),
      color: '#E6704B',
      gradient: 'linear-gradient(135deg, #E6704B 0%, #FF8F6B 100%)',
      lightColor: '#FEF2EF'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 6, mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 4,
            background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Welcome to Your CRM Dashboard
        </Typography>
        
        <Grid container spacing={4}>
          {cards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  backgroundColor: card.lightColor,
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                    backgroundColor: card.lightColor,
                    '& .icon-box': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                <CardContent sx={{ 
                  flexGrow: 1, 
                  textAlign: 'center',
                  p: 4
                }}>
                  <Box 
                    className="icon-box"
                    sx={{ 
                      mb: 3,
                      color: card.color,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '80px',
                      transition: 'transform 0.2s',
                      '& svg': {
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                      }
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography 
                    gutterBottom 
                    variant="h4" 
                    component="h2"
                    sx={{ 
                      mb: 2,
                      fontWeight: 'bold',
                      color: card.color
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '1.1rem',
                      opacity: 0.85
                    }}
                  >
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    size="large" 
                    fullWidth 
                    variant="contained"
                    onClick={card.action}
                    sx={{ 
                      background: card.gradient,
                      py: 1.5,
                      border: 'none',
                      '&:hover': {
                        background: card.gradient,
                        opacity: 0.9,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    View {card.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 