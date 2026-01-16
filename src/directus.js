import { createDirectus, rest, authentication } from '@directus/sdk';

const DIRECTUS_URL = 'https://db.convee.de'; 

const client = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json', {
    autoRefresh: true,
    // WICHTIG: Kein 'storage' hier! Wir machen das manuell, damit nichts kaputt geht.
  }));

export default client;