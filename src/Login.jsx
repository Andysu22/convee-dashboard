import { useState } from 'react';
import { readMe } from '@directus/sdk'; 
import client from './directus';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  CircularProgress
} from '@mui/material';

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
      // 1. Login durchführen (Deine funktionierende Syntax)
      await client.login({ email, password });
      
      // 2. Session-Startzeit speichern (für den 6h Timer in directus.js)
      window.localStorage.setItem('convee_session_start', Date.now());

      // 3. Kurz prüfen, ob Token wirklich geht
      await client.request(readMe());
      
      onLoginSuccess(); 

    } catch (err) {
      console.error(err);
      setError('Anmeldung fehlgeschlagen. Bitte Daten prüfen.');
      // Aufräumen falls Login halb fehlgeschlagen
      window.localStorage.removeItem('convee_session_start');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs">
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" component="h1" fontWeight="700" gutterBottom sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                Convee Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bitte melden Sie sich an
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField
                label="E-Mail Adresse"
                type="email"
                fullWidth
                margin="normal"
                variant="outlined"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{ sx: { borderRadius: 1 } }} 
              />
              
              <TextField
                label="Passwort"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{ sx: { borderRadius: 1 } }}
              />

              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                disableElevation
                disabled={isLoading}
                sx={{ 
                  mt: 3, 
                  mb: 1, 
                  height: 44, 
                  fontWeight: 600, 
                  bgcolor: '#0f172a', 
                  borderRadius: 1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1e293b' }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Anmelden'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}