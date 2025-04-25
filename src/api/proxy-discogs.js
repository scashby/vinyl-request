// pages/api/proxy-discogs.js
export default async function handler(req, res) {
    const { url } = req.query;
  
    if (!url || !url.startsWith('https://api.discogs.com')) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
  
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'YourAppName/1.0 +https://yourdomain.com',
        },
      });
  
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch from Discogs' });
    }
  }
  