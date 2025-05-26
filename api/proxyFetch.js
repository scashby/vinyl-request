// File: /api/proxyFetch.js

export default async function handler(req, res) {
    const { url } = req.query;
  
    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }
  
    try {
      const fetchResponse = await fetch(url, {
        headers: {
          'User-Agent': 'vinyl-request-system', // Discogs/iTunes/Musicbrainz sometimes require this
          'Accept': 'application/json',
        },
      });
  
      if (!fetchResponse.ok) {
        return res.status(fetchResponse.status).json({ error: 'Failed to fetch target URL' });
      }
  
      const data = await fetchResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Proxy fetch error:', error);
      return res.status(500).json({ error: 'Internal proxy error' });
    }
  }
  