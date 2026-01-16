import { useState, useEffect } from 'react';
import { readItems, readMe } from '@directus/sdk'; // WICHTIG: readItems importieren
import client from './directus';
import Login from './Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState([]); // Hier speichern wir die Daten
  
  // 1. Prüfen ob wir eingeloggt sind
  useEffect(() => {
    const checkLogin = async () => {
      try {
        await client.request(readMe());
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkLogin();
  }, []);

  // 2. Wenn eingeloggt -> Daten laden
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          // ERSETZE 'anfragen' MIT DEM NAMEN DEINER TABELLE!
          const result = await client.request(readItems('anfragen'));
          setItems(result);
        } catch (error) {
          console.error("Fehler beim Laden:", error);
          alert("Darfst du diese Daten sehen? Prüf die Policy!");
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);


  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => { client.logout(); setIsAuthenticated(false); }}>
          Abmelden
        </button>
      </div>

      <h2>Neueste Anfragen</h2>
      
      {/* 3. Daten anzeigen */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {items.length === 0 ? (
          <p>Keine Daten gefunden (oder laden noch...)</p>
        ) : (
          items.map((item) => (
            <div key={item.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
              {/* Hier musst du die Feld-Namen aus deiner DB nehmen */}
              <strong>ID: {item.id}</strong>
              <p>{JSON.stringify(item)}</p> 
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;