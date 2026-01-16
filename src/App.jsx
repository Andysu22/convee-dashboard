import { useState, useEffect, useMemo } from 'react';
import { readItems, readMe } from '@directus/sdk'; 
import client from './directus';
import Login from './Login';
import { 
  ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, 
  Button, IconButton, Container, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, LinearProgress, Stack
} from '@mui/material';
import { Refresh, Logout, Inbox } from '@mui/icons-material';

// 6 Stunden in Millisekunden
const SESSION_LIMIT = 6 * 60 * 60 * 1000;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Design: Kantig & Seriös (Enterprise Look)
  const theme = useMemo(() => createTheme({
    palette: {
      primary: { main: '#0f172a' }, // Slate 900
      background: { default: '#f8fafc', paper: '#ffffff' },
      text: { primary: '#0f172a', secondary: '#64748b' }
    },
    shape: { borderRadius: 4 }, // 4px = Sehr kantig
    typography: { fontFamily: '"Inter", -apple-system, sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiPaper: { styleOverrides: { root: { border: '1px solid #e2e8f0', boxShadow: 'none' } } }
    }
  }), []);

  // --- 1. DER WICHTIGE CHECK BEIM START ---
  useEffect(() => {
    const checkAuth = async () => {
      // A. Zeit prüfen (Harte 6-Stunden-Grenze)
      const loginTime = window.localStorage.getItem('convee_login_time');
      
      if (loginTime) {
        const now = Date.now();
        // Ist die Session älter als 6h?
        if (now - parseInt(loginTime) > SESSION_LIMIT) {
          console.log("Session abgelaufen (6h Limit). Logout wird erzwungen.");
          await performLogout();
          setIsAuthChecking(false);
          return;
        }
      } else {
        // Keine Zeit gespeichert -> Wir gehen davon aus, dass wir nicht eingeloggt sind
        // (oder es ist eine alte Session ohne Zeitstempel)
      }

      // B. Token bei Directus prüfen (Ist er noch gültig?)
      try {
        await client.request(readMe());
        // Wenn kein Fehler kommt, sind wir drin!
        setIsAuthenticated(true);
      } catch (e) {
        // Token ungültig oder abgelaufen -> Raus
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Logout Funktion
  const performLogout = async () => {
    await client.logout();
    window.localStorage.removeItem('convee_login_time'); // Zeit löschen
    setIsAuthenticated(false);
  };

  // Daten laden
  const loadData = async () => {
    setLoadingData(true);
    try {
      const result = await client.request(readItems('anfragen', { sort: ['-date_created'] }));
      setItems(result);
    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Wenn eingeloggt -> Daten laden
  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);


  // --- RENDERING ---

  // Ladebildschirm beim Start (damit es nicht flackert)
  if (isAuthChecking) return <Box sx={{ height: '100vh', bgcolor: '#f8fafc' }} />;

  // Login anzeigen
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  // Dashboard anzeigen
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* Navbar */}
        <AppBar position="static" color="default" sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inbox sx={{ color: '#0f172a' }} /> Convee Admin
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button color="inherit" onClick={loadData} startIcon={<Refresh />} disabled={loadingData}>
                Refresh
              </Button>
              <IconButton color="error" onClick={performLogout} title="Abmelden">
                <Logout />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Inhalt */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Eingegangene Anfragen</Typography>
          
          {loadingData && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Nachricht</strong></TableCell>
                  <TableCell><strong>Datum</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && !loadingData ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Keine Daten gefunden.</TableCell></TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                      <TableCell sx={{ color: 'primary.main' }}>{row.email}</TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'text.secondary' }}>
                        {row.message}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>
                        {new Date(row.date_created).toLocaleDateString('de-DE', {
                           day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </ThemeProvider>
  );
}