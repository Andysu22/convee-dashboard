import { createDirectus, rest, authentication } from '@directus/sdk';

const DIRECTUS_URL = 'https://db.convee.de'; 
const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 Stunden

// Ein sicherer Adapter, der localStorage mit Directus verbindet
const storageAdapter = {
  get: (key) => {
    try {
      // 1. Prüfen: Ist die Session abgelaufen?
      const sessionStart = window.localStorage.getItem('convee_session_start');
      if (sessionStart) {
        const now = Date.now();
        // Wenn älter als 6 Stunden -> Logout erzwingen
        if (now - parseInt(sessionStart) > SESSION_DURATION) {
          console.log("Session abgelaufen. Logout.");
          window.localStorage.removeItem(key);
          window.localStorage.removeItem('convee_session_start');
          return null;
        }
      }
      
      // 2. Token laden
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  set: (key, value) => {
    // Speichert den Token als Text
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  delete: (key) => {
    // Löscht alles beim Logout
    window.localStorage.removeItem(key);
    window.localStorage.removeItem('convee_session_start');
  }
};

const client = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json', { 
    storage: storageAdapter, // Das hält dich eingeloggt!
    autoRefresh: true 
  }));

export default client;