import { useState } from 'react';
import { readMe } from '@directus/sdk'; 
import client from './directus';
import { 
  Box, Button, Container, TextField, Typography, Card, CardContent, Alert, CircularProgress 
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
      // 1. Dein funktionierender Login (Objekt-Syntax für SDK v21)
      await client.login({ email: email.trim(), password });
      
      // 2. WICHTIG: Startzeit für die 6-Stunden-Session setzen
      window.localStorage.setItem('convee_login_time', Date.now().toString());

      // 3. Prüfen ob der Token wirklich geht
      await client.request(readMe());
      
      onLoginSuccess(); 

    } catch (err) {
      console.error("Login Fehler:", err);
      // Fehler genauer anzeigen
      const serverMsg = err?.errors?.[0]?.message;
      if (serverMsg === 'Invalid user credentials.') {
        setError('E-Mail oder Passwort falsch. (Oder CORS fehlt am Server)');
      } else {
        setError('Anmeldung fehlgeschlagen.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9' }}>
      <Container maxWidth="xs">
        <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: '#0f172a' }}>
                Convee Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bitte melden Sie sich an
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField
                label="E-Mail"
                type="email"
                fullWidth
                margin="normal"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
              
              <TextField
                label="Passwort"
                type="password"
                fullWidth
                margin="normal"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />

              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                disableElevation
                disabled={isLoading}
                sx={{ 
                  mt: 3, mb: 1, height: 44, fontWeight: 600, 
                  bgcolor: '#0f172a', borderRadius: 1, textTransform: 'none',
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