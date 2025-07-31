import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("budget-tracking");

  if (req.method === 'GET') {
    try {
      const transactions = await db.collection('depositTransactions').find({}).sort({ date: -1 }).toArray();
      const totalResult = await db.collection('depositTransactions').aggregate([
        { $group: { _id: null, totalDeposit: { $sum: "$amount" } } }
      ]).toArray();

      res.status(200).json({
        transactions,
        total: totalResult.length > 0 ? totalResult[0].totalDeposit : 0,
      });
    } catch (err) {
      console.error('Error fetching deposit transactions:', err);
      res.status(500).json({ error: 'Error fetching deposit transactions' });
    }
  } else if (req.method === 'POST') {
    const { type, amount } = req.body;

    if (!type || !amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid type or amount' });
    }

    const transactionType = type === 'deposit' ? 'deposit' : 'withdraw';
    const transactionAmount = type === 'deposit' ? amount : -amount;

    try {
      const session = client.startSession();
      await session.withTransaction(async () => {
        await db.collection('depositTransactions').insertOne({
          type: transactionType,
          amount: transactionAmount,
          date: new Date(),
        }, { session });

        await db.collection('transactions').insertOne({
          type: transactionType,
          category: 'Deposit/Withdraw',
          amount: transactionAmount,
          date: new Date(),
        }, { session });
      });
      session.endSession();

      res.status(201).json({ message: 'Transaction added' });
    } catch (err) {
      console.error('Error adding deposit transaction:', err);
      res.status(500).json({ error: 'Error adding deposit transaction' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
