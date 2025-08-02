import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("budget-tracking");

  if (req.method === 'GET') {
    try {
      const budgets = await db.collection('budgetCategories').aggregate([
        {
          $lookup: {
            from: 'transactions',
            let: { categoryName: '$name' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$type', 'expense'] },
                      { $eq: ['$category', '$$categoryName'] }
                    ]
                  }
                }
              },
              {
                $addFields: {
                  numericAmount: { $toDouble: "$amount" }
                }
              }
            ],
            as: 'expenses'
          }
        },
        {
          $addFields: {
            totalSpent: { $sum: '$expenses.numericAmount' }
          }
        },
        {
          $project: {
            id: '$_id',
            name: 1,
            limit: 1,
            totalSpent: 1,
            startDate: 1,
            endDate: 1,
            period: 1
          }
        }
      ]).toArray();

      res.status(200).json(budgets);
    } catch (err) {
      console.error('Error fetching budget categories:', err);
      res.status(500).json({ error: 'Error fetching budget categories' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}