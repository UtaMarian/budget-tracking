// src/pages/api/transactions.js
import sql from '../../lib/db';

export default async function handler(req, res) {
  await sql.connect(); // Connect to the database

  if (req.method === 'GET') {
    try {
        const limit = req.query.limit || 5;
      
      // Fetch all transactions
      const result = await sql.query(`SELECT * FROM Transactions`);

      
      // Calculate the balance based on income and expenses
      const balance = await sql.query(`SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance FROM Transactions`);
      
      // Respond with transactions and balance
      res.status(200).json({
        transactions: result.recordset,
        balance: balance.recordset[0].balance,
      });
    } catch (err) {
      console.error('Error fetching transactions:', err); // Log error for debugging
      res.status(500).json({ error: 'Error fetching transactions' });
    }
  } else if (req.method === 'POST') {
    const { type, category, amount, date } = req.body;

    // Basic validation
    if (!type || !category || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Insert the new transaction into the database
      await sql.query(`INSERT INTO Transactions (type, category, amount, date) VALUES ('${type}', '${category}', '${amount}', '${date}')`);
      
      // Fetch updated transactions and balance
      const updatedResult = await sql.query(`SELECT * FROM Transactions`);
      const updatedBalance = await sql.query(`SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance FROM Transactions`);

      // Respond with updated transactions and balance
      res.status(200).json({
        transactions: updatedResult.recordset,
        balance: updatedBalance.recordset[0].balance,
      });
    } catch (err) {
      console.error('Error adding transaction:', err); // Log error for debugging
      res.status(500).json({ error: 'Error adding transaction' });
    }
  } else {
    // Method not allowed response
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
