import { useState, useEffect, useMemo } from 'react';
import { readItems, readMe } from '@directus/sdk'; 
import client from './directus';
import Login from './Login';
import { 
  ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, 
  Button, IconButton, Container, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, LinearProgress, Stack, Chip, Avatar, Tooltip, Fade, 
  CircularProgress // <--- HIER WAR DER FEHLER: Das hat gefehlt!
} from '@mui/material';
import { 
  RefreshRounded, LogoutRounded, HexagonTwoTone, CalendarTodayRounded, MailOutlineRounded
} from '@mui/icons-material';

// 6 Stunden
const SESSION_LIMIT = 6 * 60 * 60 * 1000;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // --- MODERNES SAAS THEME ---
  const theme = useMemo(() => createTheme({
    palette: {
      primary: { main: '#4f46e5', light: '#818cf8', dark: '#3730a3' }, // Indigo
      secondary: { main: '#64748b' }, // Slate Gray
      background: { default: '#f8fafc', paper: '#ffffff' },
      text: { primary: '#1e293b', secondary: '#475569' },
      divider: '#e2e8f0'
    },
    shape: { borderRadius: 12 }, 
    typography: { 
      fontFamily: '"Inter", "Roboto", sans-serif', 
      h6: { fontWeight: 700, letterSpacing: '-0.5px', color: '#1e293b' },
      button: { textTransform: 'none', fontWeight: 600 },
      body2: { lineHeight: 1.6 }
    },
    components: {
      MuiButton: { 
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8, padding: '8px 20px' } }
      },
      MuiPaper: { 
        styleOverrides: { 
          root: { backgroundImage: 'none' },
          elevation1: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }
        } 
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 600, backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
          root: { borderBottom: '1px solid #f1f5f9', paddingBlock: '16px' }
        }
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500, borderRadius: 6 } }
      }
    }
  }), []);

  // --- AUTH LOGIK ---
  useEffect(() => {
    const checkAuth = async () => {
      const loginTime = window.localStorage.getItem('convee_login_time');
      if (loginTime && (Date.now() - parseInt(loginTime) > SESSION_LIMIT)) {
        performLogout(); setIsAuthChecking(false); return;
      }
      const storedToken = window.localStorage.getItem('convee_manual_token');
      if (storedToken) { await client.setToken(storedToken); }
      try { await client.request(readMe()); setIsAuthenticated(true); } catch (e) { performLogout(); } finally { setIsAuthChecking(false); }
    };
    checkAuth();
  }, []);

  const performLogout = async () => {
    try { await client.logout(); } catch(e) {}
    window.localStorage.removeItem('convee_login_time');
    window.localStorage.removeItem('convee_manual_token');
    try { await client.setToken(null); } catch(e) {}
    setIsAuthenticated(false);
  };

  const loadData = async () => {
    setLoadingData(true);
    try {
      const result = await client.request(readItems('anfragen', { sort: ['-date_created'] }));
      setItems(result);
    } catch (err) { if(err?.response?.status === 401) performLogout(); } finally { setLoadingData(false); }
  };

  useEffect(() => { if (isAuthenticated) loadData(); }, [isAuthenticated]);

  if (isAuthChecking) return <Box sx={{ height: '100vh', bgcolor: 'background.default' }} />;

  if (!isAuthenticated) {
    return <ThemeProvider theme={theme}><CssBaseline /><Login onLoginSuccess={() => setIsAuthenticated(true)} /></ThemeProvider>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* Navbar */}
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.02)' }}>
          <Toolbar sx={{ py: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                  <HexagonTwoTone sx={{ color: 'white', fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6">
                Convee <span style={{ fontWeight: 400, color: theme.palette.text.secondary }}>Admin</span>
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Hier wird CircularProgress verwendet */}
              {loadingData && <Fade in={true}><CircularProgress size={20} thickness={5} sx={{ color: 'text.secondary', mr: 1 }} /></Fade>}
              
              <Button 
                onClick={loadData} 
                disabled={loadingData}
                startIcon={<RefreshRounded />}
                variant="text"
                sx={{ color: 'text.secondary', '&:hover': { bgcolor: '#f1f5f9', color: 'primary.main' } }}
              >
                Aktualisieren
              </Button>
              <Tooltip title="Abmelden">
                <IconButton onClick={performLogout} sx={{ color: 'text.secondary', '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' } }}>
                  <LogoutRounded />
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
          
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
             <Box>
               <Typography variant="h5" fontWeight={700} color="#1e293b" gutterBottom>
                 Eingegangene Anfragen
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 Übersicht aller Kontaktformulareinträge.
               </Typography>
             </Box>
             <Chip 
                label={`${items.length} Gesamt`} 
                sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, height: 32 }} 
             />
          </Stack>
          
          {loadingData && <LinearProgress sx={{ mb: 2, borderRadius: 4, height: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} />}

          <Paper elevation={1} sx={{ overflow: 'hidden', border: '1px solid', borderColor: '#e2e8f0', borderRadius: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>Absender</TableCell>
                    <TableCell>Kontakt</TableCell>
                    <TableCell>Nachricht</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>Eingang</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 && !loadingData ? (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary' }}>Keine Anfragen gefunden.</TableCell></TableRow>
                  ) : (
                    items.map((row) => (
                      <Fade in={true} key={row.id}>
                        <TableRow hover sx={{ '&:hover': { bgcolor: '#f8fafc !important' } }}>
                          <TableCell sx={{ pl: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ bgcolor: '#e0e7ff', color: 'primary.main', fontWeight: 700, width: 40, height: 40, fontSize: '0.9rem' }}>
                                {row.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography fontWeight={600} variant="body2" color="text.primary">{row.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                             <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                                <MailOutlineRounded fontSize="small" sx={{ opacity: 0.7 }} />
                                <Typography variant="body2" fontWeight={500}>{row.email}</Typography>
                             </Stack>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 380 }}>
                            <Tooltip title={row.message} placement="top-start" arrow>
                               <Typography variant="body2" color="text.secondary" noWrap sx={{ cursor: 'default' }}>
                                 {row.message}
                               </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3 }}>
                            <Chip 
                              icon={<CalendarTodayRounded sx={{ fontSize: '0.9rem !important' }} />}
                              label={new Date(row.date_created).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                              size="small"
                              sx={{ bgcolor: '#f1f5f9', color: 'text.secondary', fontWeight: 500, borderRadius: '6px', '& .MuiChip-icon': { color: 'text.secondary', opacity: 0.7 } }}
                            />
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}