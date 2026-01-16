import { useState } from 'react';
import { readMe } from '@directus/sdk'; // <--- WICHTIG: readMe muss hier importiert sein!
import client from './directus';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. FIX: Email und Passwort als OBJEKT übergeben
      await client.login({ email, password });
      
      // 2. User-Daten laden (mit der importierten readMe Funktion)
      const user = await client.request(readMe());
      
      console.log("Erfolgreich eingeloggt als:", user);
      onLoginSuccess(); 

    } catch (err) {
      console.error("Login Fehler:", err);
      setError('Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <form onSubmit={handleLogin} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minWidth: '300px' }}>
        <h2>Dashboard Login</h2>
        
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <div style={{ marginBottom: '15px' }}>
          <label style={{display: 'block', marginBottom: '5px'}}>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{display: 'block', marginBottom: '5px'}}>Passwort:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Anmelden
        </button>
      </form>
    </div>
  );
}