// اتجاهات API + السماح بالـ CORS للتطوير المحلي
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  res.status(200).json({ api: 'leyaka', endpoints: ['/api/login', '/api/data', '/api/stats', '/api/users'], time: Date.now() });
}
export const config = { api: { bodyParser: true } };