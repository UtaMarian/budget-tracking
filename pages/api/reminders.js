// pages/api/reminders.js
import clientPromise from '../../lib/db';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("budget-tracking");

  const collection = db.collection("reminders");

 if (req.method === 'GET') {
  try {
    const now = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(now.getDate() - 5);

    const reminders = await collection.find({
      date: {
        $gte: fiveDaysAgo // include reminders with date >= 5 days ago
      }
    }).sort({ date: 1 }).toArray();

    res.status(200).json({ reminders });
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
}

else if (req.method === 'POST') {
    const { title, category, icon, date, amount, repeat } = req.body;

    if (!title || !date || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    try {
      const reminder = {
        title,
        category,
        icon: icon || '💸',
        date: new Date(date),
        amount: Number(amount),
        repeat: repeat || 'once', // NEW
        createdAt: new Date(),
      };

      await collection.insertOne(reminder);
      res.status(201).json({ message: 'Reminder added', reminder });
    } catch (err) {
      console.error('Error adding reminder:', err);
      res.status(500).json({ error: 'Failed to add reminder' });
    }
  }


  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
