import { useState } from 'react';
import { readMe } from '@directus/sdk'; 
import client from './directus';
import { 
  Box, Button, Container, TextField, Typography, Card, CardContent, 
  Alert, CircularProgress, InputAdornment, Fade, Stack
} from '@mui/material';
import { AlternateEmail, VpnKeyOutlined, LoginRounded, HexagonTwoTone } from '@mui/icons-material';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await client.login({ email: email.trim(), password });
      if (response && response.access_token) {
        window.localStorage.setItem('convee_manual_token', response.access_token);
        window.localStorage.setItem('convee_login_time', Date.now().toString());
      }
      await client.request(readMe());
      setTimeout(() => onLoginSuccess(), 400); // Kurzer Delay für sanften Übergang
    } catch (err) {
      const msg = err?.errors?.[0]?.message;
      setError(msg === 'Invalid user credentials.' ? 'Die Zugangsdaten sind nicht korrekt.' : 'Ein Verbindungsproblem ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f8fafc', // Moderner Hintergrund
      p: 2
    }}>
      <Fade in={true} timeout={600}>
        <Container maxWidth="xs">
          <Card elevation={0} sx={{ 
            borderRadius: 4, // Moderne 16px Rundung
            bgcolor: 'white',
            // Hochwertiger, weicher Schatten ("schwebend")
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.02)',
          }}>
            <CardContent sx={{ p: 5 }}>
              
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mb: 4 }}>
                {/* Akzentfarbe Indigo */}
                <HexagonTwoTone sx={{ color: '#4f46e5', fontSize: 32 }} />
                <Typography variant="h5" fontWeight="800" color="#1e293b" sx={{ letterSpacing: '-0.5px' }}>
                  Convee Admin
                </Typography>
              </Stack>

              <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                 Willkommen zurück. Bitte melden Sie sich an.
              </Typography>

              {error && (
                <Fade in={true}>
                  <Alert severity="error" variant="standard" sx={{ mb: 3, borderRadius: 2, bgcolor: '#fef2f2', color: '#991b1b' }}>{error}</Alert>
                </Fade>
              )}

              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="E-Mail Adresse"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><AlternateEmail color="action" fontSize="small" /></InputAdornment>,
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: 2.5, backgroundColor: '#f9fafb' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Passwort"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><VpnKeyOutlined color="action" fontSize="small" /></InputAdornment>,
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': { borderRadius: 2.5, backgroundColor: '#f9fafb' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                  }}
                />

                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  disabled={isLoading}
                  size="large"
                  endIcon={!isLoading && <LoginRounded />}
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2.5, 
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    bgcolor: '#4f46e5', // Indigo Akzent
                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)', // Farbiger Schatten
                    '&:hover': { bgcolor: '#4338ca', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Anmelden'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Fade>
    </Box>
  );
}