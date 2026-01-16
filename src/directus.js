import { createDirectus, rest, authentication } from '@directus/sdk';

// Deine Directus URL (wo das Backend liegt)
const DIRECTUS_URL = 'https://db.convee.de'; 

const client = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json')); // 'json' speichert den Login im Speicher, 'session' im Cookie

export default client;