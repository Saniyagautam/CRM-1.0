import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import AddCustomer from './components/AddCustomer';
import OrderList from './components/OrderList';
import AddOrder from './components/AddOrder';
import EditOrder from './components/EditOrder';
import CampaignBuilder from './components/CampaignBuilder';
import CampaignHistory from './components/CampaignHistory';
import CampaignLogs from './components/CampaignLogs';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7E57C2',
      light: '#B085F5',
      dark: '#4D2C91',
    },
    secondary: {
      main: '#26A69A',
      light: '#51B7AE',
      dark: '#00766C',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    error: {
      main: '#FF5252',
    },
    success: {
      main: '#4CAF50',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: '#7E57C2',
            color: '#FFFFFF',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customer/:id" element={<CustomerDetail />} />
            <Route path="/customer/new" element={<AddCustomer />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/order/new" element={<AddOrder />} />
            <Route path="/order/edit/:id" element={<EditOrder />} />
            <Route path="/campaigns" element={<CampaignHistory />} />
            <Route path="/campaign/new" element={<CampaignBuilder />} />
            <Route path="/campaign/:id" element={<CampaignBuilder />} />
            <Route path="/campaign/:id/logs" element={<CampaignLogs />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
