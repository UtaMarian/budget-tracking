import sql from '../../lib/db';

export default async function handler(req, res) {
  await sql.connect();

  if (req.method === 'GET') {
    try {
      // Query to get budgets along with total spends for each category
      const result = await sql.query(`
        SELECT bc.id, bc.name, bc.limit, 
               ISNULL(SUM(t.amount), 0) AS total_spent
        FROM BudgetCategories bc
        LEFT JOIN Transactions t ON t.category = bc.name AND t.type = 'expense'
        GROUP BY bc.id, bc.name, bc.limit
      `);

      const budgets = result.recordset.map(budget => ({
        id: budget.id,
        name: budget.name,
        limit: budget.limit,
        totalSpent: budget.total_spent,
      }));

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
