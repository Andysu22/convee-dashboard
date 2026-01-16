import { createDirectus, rest } from '@directus/sdk';

// Hier kommt die URL hin, wo dein Directus Backend läuft
// WICHTIG: Das ist NICHT admin-pnl.convee.de, sondern der Ort, wo die Daten liegen!
const DIRECTUS_URL = 'https://db.convee.de/'; 

const client = createDirectus(DIRECTUS_URL).with(rest());

export default client;