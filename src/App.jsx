import { useState, useEffect, useMemo } from 'react';
import { readItems, readMe } from '@directus/sdk'; 
import client from './directus';
import Login from './Login';

// Material UI Imports
import { 
  ThemeProvider, createTheme, CssBaseline,
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  Grid, Card, CardContent, Button, TextField, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Stack, FormControl, InputLabel, LinearProgress, Alert
} from '@mui/material';

// Icons (Seriöser Stil)
import {
  DashboardOutlined,
  InboxOutlined,
  PeopleOutline,
  LogoutOutlined,
  Menu as MenuIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Brightness4, Brightness7,
  ArrowForward
} from '@mui/icons-material';

const drawerWidth = 250;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // App State
  const [mode, setMode] = useState('light');
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Data State
  const [items, setItems] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // --- THEME CONFIG (Kantig & Seriös) ---
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#0f172a' }, // Slate 900 (Fast Schwarz)
      secondary: { main: '#64748b' }, // Slate 500
      background: { 
        default: mode === 'light' ? '#f8fafc' : '#020617', 
        paper: mode === 'light' ? '#ffffff' : '#0f172a' 
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#64748b' : '#94a3b8',
      }
    },
    shape: { borderRadius: 2 }, // Sehr kleine Rundungen (kantig)
    typography: { 
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
      h6: { fontWeight: 600 }
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiCard: { styleOverrides: { root: { border: '1px solid', borderColor: mode === 'light' ? '#e2e8f0' : '#1e293b', boxShadow: 'none' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiTableCell: { styleOverrides: { root: { borderBottom: '1px solid', borderColor: mode === 'light' ? '#f1f5f9' : '#1e293b' } } }
    }
  }), [mode]);

  // 1. Auth Check beim Start (Nutzt deinen Adapter)
  useEffect(() => {
    const initAuth = async () => {
      try {
        await client.request(readMe());
        setIsAuthenticated(true);
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    initAuth();
  }, []);

  // 2. Daten laden
  useEffect(() => {
    if (!isAuthenticated || activePage === 'dashboard') return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        // Lädt immer Anfragen, da wir nur diese Tabelle haben. 
        // Für 'kunden' später einfach Collection ändern.
        const result = await client.request(readItems('anfragen', { 
          limit: 100, 
          sort: ['-date_created'] 
        }));
        setItems(result);
      } catch (error) {
        console.error("Ladefehler:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [activePage, isAuthenticated]);

  // Filterung
  const filteredItems = useMemo(() => {
    let res = [...items];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      res = res.filter(i => 
        i.name?.toLowerCase().includes(lower) || 
        i.email?.toLowerCase().includes(lower) ||
        i.message?.toLowerCase().includes(lower)
      );
    }
    return res.sort((a, b) => sortOrder === 'newest' 
      ? new Date(b.date_created) - new Date(a.date_created) 
      : new Date(a.date_created) - new Date(b.date_created));
  }, [items, searchTerm, sortOrder]);


  // --- RENDERING ---

  if (isAuthChecking) return <Box sx={{ height: '100vh', bgcolor: 'background.default' }} />;

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ px: 2, minHeight: 64 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '-0.5px' }}>
          Convee Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ p: 2 }}>
        {[
          { id: 'dashboard', icon: <DashboardOutlined />, label: 'Übersicht' },
          { id: 'anfragen', icon: <InboxOutlined />, label: 'Anfragen' },
          { id: 'kunden', icon: <PeopleOutline />, label: 'Kunden' },
        ].map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              selected={activePage === item.id}
              onClick={() => setActivePage(item.id)}
              sx={{ 
                borderRadius: 1, 
                py: 1,
                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '& .MuiListItemIcon-root': { color: 'white' } } 
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: activePage === item.id ? 'white' : 'text.secondary' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          color="inherit" 
          startIcon={<LogoutOutlined />} 
          onClick={() => { client.logout(); setIsAuthenticated(false); }}
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        >
          Abmelden
        </Button>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        
        {/* Header */}
        <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}><MenuIcon /></IconButton>
            <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {activePage === 'dashboard' ? 'Dashboard' : activePage === 'anfragen' ? 'Eingegangene Anfragen' : 'Kundenverwaltung'}
            </Typography>
            <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} color="inherit">
              {mode === 'light' ? <Brightness4 fontSize="small" /> : <Brightness7 fontSize="small" />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
            {drawerContent}
          </Drawer>
          <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }} open>
            {drawerContent}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8, maxWidth: '1600px', mx: 'auto' }}>
          
          {/* VIEW: Dashboard */}
          {activePage === 'dashboard' && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { title: 'Offene Anfragen', val: '12', sub: 'Zu bearbeiten' },
                  { title: 'Kunden Gesamt', val: '148', sub: '+3 diese Woche' },
                  { title: 'Status', val: 'Aktiv', sub: 'System läuft', color: 'success.main' }
                ].map((stat, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Card>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">{stat.title}</Typography>
                        <Typography variant="h4" sx={{ my: 1, color: stat.color || 'text.primary' }}>{stat.val}</Typography>
                        <Typography variant="body2" color="text.secondary">{stat.sub}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Alert 
                severity="info" 
                variant="outlined" 
                sx={{ borderRadius: 1, bgcolor: 'background.paper', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                onClick={() => setActivePage('anfragen')}
                icon={<ArrowForward fontSize="inherit" />}
              >
                <b>Anfragen verwalten:</b> Klicken Sie hier, um zu den Nachrichten zu gelangen.
              </Alert>
            </Box>
          )}

          {/* VIEW: Listen (Anfragen / Kunden) */}
          {activePage !== 'dashboard' && (
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
                <TextField 
                  size="small" 
                  placeholder="Suchen..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  sx={{ flexGrow: 1, width: '100%', bgcolor: 'background.paper' }}
                />
                <Stack direction="row" spacing={1}>
                   <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'background.paper' }}>
                    <InputLabel>Sortierung</InputLabel>
                    <Select value={sortOrder} label="Sortierung" onChange={(e) => setSortOrder(e.target.value)}>
                      <MenuItem value="newest">Neueste</MenuItem>
                      <MenuItem value="oldest">Älteste</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={() => { setActivePage('dashboard'); setTimeout(() => setActivePage(activePage), 50); }}>
                    Refresh
                  </Button>
                </Stack>
              </Stack>

              {isLoadingData ? (
                <LinearProgress sx={{ borderRadius: 1 }} />
              ) : filteredItems.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider' }}>
                  Keine Daten gefunden.
                </Paper>
              ) : (
                <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <Table size="medium">
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>NAME</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>EMAIL</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>NACHRICHT</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>DATUM</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.05em' }}>AKTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                          <TableCell>
                            <Typography variant="body2" component="a" href={`mailto:${item.email}`} sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                              {item.email}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 350, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'text.secondary' }}>
                            {item.message}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.875rem' }}>
                            {item.date_created ? new Date(item.date_created).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-'}
                          </TableCell>
                          <TableCell align="right">
                             <Button size="small" variant="text" color="primary">Öffnen</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

        </Box>
      </Box>
    </ThemeProvider>
  );
}