// File: pages/api/shopping-list/[id].js
import sql from '../../../lib/db'; // Adjust the path according to your project structure

export default async function handler(req, res) {
  const { id } = req.query; // Get the product ID from the query

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    try {
      await sql.query(`DELETE FROM ShoppingList WHERE id = ${id}`);
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Error deleting product' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
