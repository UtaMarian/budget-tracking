// components/TransactionForm.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


const TransactionForm = ({ categories, setTransactions, setBalance }) => {
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    category: '',
    amount: '',
    date: '',
  });

  const handleTransactionTypeChange = (e) => {
    setNewTransaction({ ...newTransaction, type: e.target.value, category: '' }); // Reset category when type changes
  };

  const handleAddTransaction = async () => {
    if (newTransaction.category && newTransaction.amount && newTransaction.date) {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });
      const data = await res.json();
      setTransactions(data.transactions);
      setBalance(data.balance);
      setNewTransaction({ type: 'income', category: '', amount: '', date: '' }); // Reset form
    }
  };

  // Filter categories based on selected transaction type
  const filteredCategories = categories.filter(category => category.type === newTransaction.type);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="transactionType">Type</Label>
              <select
                id="transactionType"
                className="w-full p-2 border rounded"
                value={newTransaction.type}
                onChange={handleTransactionTypeChange}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full p-2 border rounded"
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddTransaction}>Add Transaction</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
