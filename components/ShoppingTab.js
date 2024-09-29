import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ShoppingTab = () => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', amount: 1, importance: 'medium' });

  useEffect(() => {
    fetchShoppingList();
    fetchShoppingHistory();
  }, []);

  const fetchShoppingList = async () => {
    const res = await fetch('/api/shopping-list');
    const data = await res.json();
    setProducts(data);
  };

  const fetchShoppingHistory = async () => {
    const res = await fetch('/api/shopping-history');
    const data = await res.json();
    setHistory(data);
  };

  const addProduct = async () => {
    if (!newProduct.name) return;
    
    const res = await fetch('/api/shopping-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });

    if (res.ok) {
      fetchShoppingList(); // Refresh list after adding
      setNewProduct({ name: '', amount: 1, importance: 'medium' });
    }
  };

  const deleteProduct = async (id) => {
    const res = await fetch(`/api/shopping-list/${id}`, { method: 'DELETE' });
    if (res.ok) fetchShoppingList();
  };

  const markAsBought = async (product) => {
    const res = await fetch(`/api/shopping-list/${product.id}/buy`, { method: 'POST' });
    if (res.ok) {
      fetchShoppingList();
      fetchShoppingHistory();
    }
  };

  const updateAmount = async (id, newAmount) => {
    const res = await fetch(`/api/shopping-list/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: newAmount }),
    });

    if (res.ok) fetchShoppingList();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      {/* Add New Product Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="flex space-x-4 mt-5">

                <Input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}

                />


                <Input
                  type="number"
                  min="1"
                  value={newProduct.amount}
                  onChange={(e) => setNewProduct({ ...newProduct, amount: e.target.value })}

                />
           </div>
              <div className="flex space-x-4 mt-5">
             

                <Select 
                onValueChange={(value) => setNewProduct({ ...newProduct, importance: value })} 
                defaultValue={newProduct.importance}
                className="w-full p-2 border rounded min-w-28"
                >

                    <SelectTrigger>
                    <SelectValue placeholder="Select importance" />
                    </SelectTrigger>

                <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                </SelectContent>
                </Select>
              
              <Button onClick={addProduct}>Add Product</Button>
            </div>
         
          </form>
        </CardContent>
      </Card>


        <h2 className="text-2xl font-bold mb-4">Shopping List</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Importance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name.toUpperCase()}</TableCell>
                <TableCell>
                  <input
                    type="number"
                    value={product.amount}
                    onChange={(e) => updateAmount(product.id, e.target.value)}
                    className="border p-1 w-16"
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={product.importance === 'low' ? 'low' : product.importance === 'medium' ? 'medium' : 'destructive'}>
                    {product.importance}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button className='mr-2' variant="outline" onClick={() => markAsBought(product)}>Buy</Button>
                  <Button variant="destructive" onClick={() => deleteProduct(product.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

       
      {/* Shopping History Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Shopping History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Importance</TableCell>
              <TableCell>Bought Date</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name.toUpperCase()}</TableCell>
                <TableCell>{product.amount}</TableCell>
                <TableCell>
                  <Badge variant={product.importance === 'low' ? 'outline' : product.importance === 'medium' ? 'info' : 'destructive'}>
                    {product.importance}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(product.bought_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShoppingTab;
