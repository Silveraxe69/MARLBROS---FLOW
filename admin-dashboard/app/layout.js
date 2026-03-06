'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '../lib/auth';
import { useState } from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0', // TNSTC Official Blue
    },
    secondary: {
      main: '#0D47A1', // Dark Blue
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
});

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
  { text: 'Fleet Monitor', icon: <DirectionsBusIcon />, href: '/fleet' },
  { text: 'Routes', icon: <RouteIcon />, href: '/routes' },
  { text: 'Live Map', icon: <MapIcon />, href: '/map' },
  { text: 'Analytics', icon: <AnalyticsIcon />, href: '/analytics' },
];

function LayoutContent({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  // Show only children for login page
  if (pathname === '/login') {
    return children;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1565C0' }}>
        <Toolbar>
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <Box component="img"
              src="/images/tnstc-logo.png" 
              alt="TNSTC Logo" 
              sx={{ 
                height: '40px', 
                width: 'auto',
                display: 'block'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.getElementById('header-logo-fallback');
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <DirectionsBusIcon 
              id="header-logo-fallback"
              sx={{ fontSize: 32, display: 'none' }} 
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              Tamil Nadu State Transport Corporation Ltd.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              FLOW - Real-Time Bus Management System
            </Typography>
          </Box>
          
          {user && (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.email}
              </Typography>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={pathname === item.href}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
