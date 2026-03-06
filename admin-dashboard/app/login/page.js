'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (response.data.user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Store auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 6 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                <Box component="img"
                  src="/images/tnstc-logo.png" 
                  alt="TNSTC Logo" 
                  sx={{ 
                    height: '100px', 
                    width: 'auto',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = document.getElementById('logo-fallback-icon');
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <DirectionsBusIcon 
                  id="logo-fallback-icon"
                  sx={{ fontSize: 80, color: '#1565C0', display: 'none' }} 
                />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1565C0' }}>
                FLOW Admin Portal
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1565C0', mb: 1 }}>
                Tamil Nadu State Transport Corporation Ltd.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                A Government of Tamil Nadu Undertaking
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoComplete="email"
                autoFocus
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                  Demo Credentials:
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Email: admin@smartbus.com
                </Typography>
                <Typography variant="caption" display="block">
                  Password: admin123
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
