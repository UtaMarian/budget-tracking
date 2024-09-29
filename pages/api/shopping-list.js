import sql from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await sql.query(`SELECT * FROM ShoppingList where tag!='bought' ORDER BY created_at DESC`);
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('Error fetching shopping list:', err);
      res.status(500).json({ error: 'Error fetching shopping list' });
    }
  }else if (req.method === 'POST') {
    const { name, amount, importance } = req.body;
    if (!name || !amount || !importance) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await sql.query(`
        INSERT INTO ShoppingList (name, amount, importance)
        VALUES ('${name}', ${amount}, '${importance}')
      `);
      res.status(201).json({ message: 'Product added to shopping list' });
    } catch (err) {
      console.error('Error adding product to shopping list:', err);
      res.status(500).json({ error: 'Error adding product to shopping list' });
    }
  }else if (req.method === 'PUT') {
    const { id } = req.query;
    const { amount, importance } = req.body;
    if (!amount && !importance) {
      return res.status(400).json({ error: 'Missing fields to update' });
    }

    let updateQuery = '';
    if (amount) updateQuery += `amount = ${amount}`;
    if (importance) updateQuery += `${updateQuery ? ', ' : ''}importance = '${importance}'`;

    try {
      await sql.query(`
        UPDATE ShoppingList
        SET ${updateQuery}
        WHERE id = ${id}
      `);
      res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Error updating product' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    try {
      await sql.query(`DELETE FROM ShoppingList WHERE id = @id`, { id });
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Error deleting product' });
    }
  }  
  else if (req.method === 'POST' && req.url.includes('/buy')) {
    const { id } = req.query;
    try {
      await sql.query(`UPDATE ShoppingList SET bought = 1 WHERE id = @id`, { id });
      res.status(200).json({ message: 'Product marked as bought' });
    } catch (err) {
      console.error('Error marking product as bought:', err);
      res.status(500).json({ error: 'Error marking product as bought' });
    }
  }  
   else {
    res.status(405).json({ message: 'Method not allowed' });
  } 

}
