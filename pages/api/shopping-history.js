import sql from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await sql.query('SELECT * FROM ShoppingHistory ORDER BY bought_at DESC');
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('Error fetching shopping history:', err);
      res.status(500).json({ error: 'Error fetching shopping history' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
