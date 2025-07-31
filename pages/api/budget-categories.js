import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("budget-tracking");

  if (req.method === 'GET') {
    try {
      const categories = await db.collection('budgetCategories').find({}).toArray();
      res.status(200).json(categories);
    } catch (err) {
      console.error('Error fetching budget categories:', err);
      res.status(500).json({ error: 'Error fetching budget categories' });
    }
  } else if (req.method === 'POST') {
    const { name, limit } = req.body;
    if (!name || !limit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await db.collection('budgetCategories').insertOne({ name, limit });
      res.status(201).json({ message: 'Budget category added' });
    } catch (err) {
      console.error('Error adding budget category:', err);
      res.status(500).json({ error: 'Error adding budget category' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      await db.collection('budgetCategories').deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: 'Budget category deleted' });
    } catch (err) {
      console.error('Error deleting budget category:', err);
      res.status(500).json({ error: 'Error deleting budget category' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
