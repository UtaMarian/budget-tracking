import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("budget-tracking");

  const getTransactionsAndBalance = async () => {
    const transactions = await db.collection('transactions').find({}).toArray();
    const balanceResult = await db.collection('transactions').aggregate([
      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $cond: [
                { $eq: ["$type", "income"] },
                { $toDouble: "$amount" },
                { $multiply: [{ $toDouble: "$amount" }, -1] }
              ]
            }
          }
        }
      }
    ]).toArray();
    console.log('Transactions:', balanceResult);
    return {
      transactions,
      balance: balanceResult.length > 0 ? balanceResult[0].balance : 0,
    };
  };

  if (req.method === 'GET') {
    try {
      const { transactions, balance } = await getTransactionsAndBalance();
      res.status(200).json({ transactions, balance });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      res.status(500).json({ error: 'Error fetching transactions' });
    }
  } else if (req.method === 'POST') {
    const { type, category, amount, date } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
     await db.collection('transactions').insertOne({
        type,
        category,
        amount: Number(amount),
        date: new Date(date)
      });
      const { transactions, balance } = await getTransactionsAndBalance();
      res.status(200).json({ transactions, balance });
    } catch (err) {
      console.error('Error adding transaction:', err);
      res.status(500).json({ error: 'Error adding transaction' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
