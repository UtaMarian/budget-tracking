// api/deposit.js
import sql from '../../lib/db';

export default async function handler(req, res) {
  await sql.connect();

  if (req.method === 'GET') {
    try {
      const result = await sql.query(`SELECT * FROM DepositTransactions ORDER BY date DESC`);
      const total = await sql.query(`SELECT SUM(amount) as totalDeposit FROM DepositTransactions`);

      res.status(200).json({
        transactions: result.recordset,
        total: total.recordset[0].totalDeposit || 0,
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
    const transactionAmount = type === 'deposit' ? amount : -amount; // Withdraw will subtract from balance

    try {
      // Insert into DepositTransactions
      await sql.query(`
        INSERT INTO DepositTransactions (type, amount, date)
        VALUES ('${transactionType}', ${transactionAmount}, GETDATE())
      `);

      // Insert a normal transaction in the Transactions table to adjust balance
      await sql.query(`
        INSERT INTO Transactions (type, category, amount, date)
        VALUES ('${transactionType}', 'Deposit/Withdraw', ${transactionAmount}, GETDATE())
      `);

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
