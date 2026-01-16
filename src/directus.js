import { createDirectus, rest, authentication } from '@directus/sdk';

const DIRECTUS_URL = 'https://db.convee.de'; 

const client = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json', {
    autoRefresh: true // Versucht, den Token automatisch frisch zu halten
  }));

export default client;