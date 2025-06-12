// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Checkbox, CircularProgress, FormControlLabel,
  TextField, Typography, Alert, Divider, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Google, LinkedIn, Facebook } from '@mui/icons-material';

const API_BASE_URL = '/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!email || !password) {
      setAlert({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      if (data.token) localStorage.setItem('auth_token', data.token);
      setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
      setTimeout(() => window.location.href = data.redirectUrl || '/dashboard', 1200);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Social logins
  const socialLogin = (provider: string) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f5f7fa'
    }}>
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box sx={{
              width: 90, height: 90, background: 'linear-gradient(135deg, #3498db, #2980b9)',
              borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: 36, mb: 1
            }}>AP</Box>
            <Typography variant="h5" fontWeight={600}>Alumni Portal Login</Typography>
          </Box>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} color="primary" />
                }
                label="Remember me"
              />
              <Button href="/api/auth/forgot-password" size="small">Forgot password?</Button>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ mt: 1, mb: 2 }}
            >
              Log In
            </Button>
          </form>
          <Divider sx={{ my: 2 }}>OR</Divider>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton color="error" onClick={() => socialLogin('google')}><Google /></IconButton>
            <IconButton color="primary" onClick={() => socialLogin('linkedin')}><LinkedIn /></IconButton>
            <IconButton sx={{ color: '#3b5998' }} onClick={() => socialLogin('facebook')}><Facebook /></IconButton>
          </Box>
          <Typography align="center" sx={{ mt: 2 }}>
            Don't have an account? <Button href="/api/auth/register">Register now</Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
