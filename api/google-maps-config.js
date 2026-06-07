export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

  if (!googleMapsApiKey) {
    return res.status(500).json({
      error: 'GOOGLE_MAPS_API_KEY não configurada no Vercel.'
    });
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ googleMapsApiKey });
}
