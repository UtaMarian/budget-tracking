import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  const client = await clientPromise;
  const db = client.db("budget-tracking");

  if (req.method === 'POST') {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const product = await db.collection('shoppingList').findOne({ _id: new ObjectId(id) }, { session });
        if (!product) {
          throw new Error('Product not found');
        }

        await db.collection('shoppingList').updateOne({ _id: new ObjectId(id) }, { $set: { tag: 'bought' } }, { session });

        await db.collection('shoppingHistory').insertOne(
          { ...product, tag: 'bought', bought_at: new Date() },
          { session }
        );
      });
      session.endSession();
      return res.status(200).json({ message: 'Product marked as bought and added to history' });
    } catch (err) {
      session.endSession();
      console.error('Error processing buy request:', err);
      if (err.message === 'Product not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Error processing buy request' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
