// File: pages/api/shopping-list/[id]/buy.js
import sql from '../../../../lib/db'; // Adjust the path according to your project structure

export default async function handler(req, res) {
  const { id } = req.query; // Get the product ID from the query

  if (req.method === 'POST') {
    try {
      // First, retrieve the product details from the ShoppingList
      const productResult = await sql.query(`SELECT name, amount, importance FROM ShoppingList WHERE id = ${id}`);
      if (productResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const product = productResult.recordset[0];

      // Update the product to mark as bought
      await sql.query(`UPDATE ShoppingList SET tag = 'bought' WHERE id = ${ id }`);

      // Insert into ShoppingHistory
      await sql.query(`
        INSERT INTO ShoppingHistory (name, amount, importance, tag)
        VALUES ('${product.name}', ${product.amount}, '${product.importance}', 'bought')`
      );
      

      return res.status(200).json({ message: 'Product marked as bought and added to history' });
    } catch (err) {
      console.error('Error processing buy request:', err);
      return res.status(500).json({ error: 'Error processing buy request' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
