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
      const { name, limit, period = 'month' } = req.body;

      if (!name || limit === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const numericLimit = Number(limit);
      if (isNaN(numericLimit)) {
        return res.status(400).json({ error: 'Limit must be a number' });
      }

      const now = new Date();
      const startDate = new Date(now);
      const endDate = new Date(now);

      if (period === 'month') {
        startDate.setDate(1); // beginning of month
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // end of month
      } else if (period === 'week') {
        const day = now.getDay(); // 0 = Sunday
        startDate.setDate(now.getDate() - day);
        endDate.setDate(startDate.getDate() + 6);
      }

      // Aggregate expenses from "transactions" collection
      const totalSpentAgg = await db.collection('transactions').aggregate([
        {
          $match: {
            type: 'expense',
            category: name,
            date: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $addFields: {
            numericAmount: { $toDouble: "$amount" } // Convert string to number
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$numericAmount" }
          }
        }
      ]).toArray();

      const totalSpent = totalSpentAgg[0]?.total || 0;

      try {
        await db.collection('budgetCategories').insertOne({
          name,
          limit: numericLimit,
          period,
          startDate,
          endDate,
          totalSpent
        });
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
