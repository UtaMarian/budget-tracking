import sql from '../../lib/db';

export default async function handler(req, res) {
    await sql.connect();

    if (req.method === 'GET') {
        try {
            const result = await sql.query(`SELECT * FROM TransactionCategories`);
            res.status(200).json(result.recordset);
        } catch (err) {
            console.error('Error fetching transaction categories:', err.message);
            res.status(500).json({ error: 'Error fetching transaction categories' });
        }
    } else if (req.method === 'POST') {
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const result = await sql.query(`INSERT INTO TransactionCategories (name, type) VALUES ('${name}', '${type}')`);
            res.status(201).json({ message: 'Transaction category added', result });
        } catch (err) {
            console.error('Error adding transaction category:', err.message);
            res.status(500).json({ error: 'Error adding transaction category', details: err.message });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Missing required field: id' });
        }

        try {
            await sql.query(`DELETE FROM TransactionCategories WHERE id = ${id}`);
            res.status(200).json({ message: 'Transaction category deleted' });
        } catch (err) {
            console.error('Error deleting transaction category:', err.message);
            res.status(500).json({ error: 'Error deleting transaction category', details: err.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
