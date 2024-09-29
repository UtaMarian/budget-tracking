import sql from '../../lib/db';

export default async function handler(req, res) {
  await sql.connect();

  if (req.method === 'GET') {
    try {
      const result = await sql.query(`SELECT * FROM BudgetCategories`);
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('Error fetching budget categories:', err);
      res.status(500).json({ error: 'Error fetching budget categories' });
    }
  } else if (req.method === 'POST') {
    const { name, limit } = req.body;
    console.error(name);
    console.error(limit);
    if (!name || !limit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await sql.query(`INSERT INTO BudgetCategories (name, limit) VALUES ('${name}', '${limit}')`);
      res.status(201).json({ message: 'Budget category added' });
    } catch (err) {
      console.error('Error adding budget category:', err);
      res.status(500).json({ error: 'Error adding budget category' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    try {
      await sql.query(`DELETE FROM BudgetCategories WHERE id = ${id}`);
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
