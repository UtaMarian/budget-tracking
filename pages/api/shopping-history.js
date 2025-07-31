import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db("budget-tracking");
      const history = await db.collection('shoppingHistory').find({}).sort({ bought_at: -1 }).toArray();
      res.status(200).json(history);
    } catch (err) {
      console.error('Error fetching shopping history:', err);
      res.status(500).json({ error: 'Error fetching shopping history' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
