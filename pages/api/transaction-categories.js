import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/db';

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db("budget-tracking");

    if (req.method === 'GET') {
        try {
            const categories = await db.collection('transactionCategories').find({}).toArray();
            res.status(200).json(categories);
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
            const result = await db.collection('transactionCategories').insertOne({ name, type });
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
            await db.collection('transactionCategories').deleteOne({ _id: new ObjectId(id) });
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
