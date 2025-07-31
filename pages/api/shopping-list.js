import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("budget-tracking");

  if (req.method === 'GET') {
    try {
      const items = await db.collection('shoppingList').find({ tag: { $ne: 'bought' } }).sort({ created_at: -1 }).toArray();
      res.status(200).json(items);
    } catch (err) {
      console.error('Error fetching shopping list:', err);
      res.status(500).json({ error: 'Error fetching shopping list' });
    }
  } else if (req.method === 'POST') {
    const { name, amount, importance } = req.body;
    if (!name || !amount || !importance) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await db.collection('shoppingList').insertOne({ name, amount, importance, created_at: new Date() });
      res.status(201).json({ message: 'Product added to shopping list' });
    } catch (err) {
      console.error('Error adding product to shopping list:', err);
      res.status(500).json({ error: 'Error adding product to shopping list' });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    const { amount, importance } = req.body;
    if (!amount && !importance) {
      return res.status(400).json({ error: 'Missing fields to update' });
    }

    const updateFields = {};
    if (amount) updateFields.amount = amount;
    if (importance) updateFields.importance = importance;

    try {
      await db.collection('shoppingList').updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
      res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Error updating product' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    try {
      await db.collection('shoppingList').deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Error deleting product' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
