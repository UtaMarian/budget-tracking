import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SettingsTab = () => {
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [newBudget, setNewBudget] = useState({ name: '', limit: '' }); // Changed 'name' to 'categoryId'
  const [categories, setCategories] = useState([]);
  const [newTransactionCategory, setNewTransactionCategory] = useState({ name: '', type: 'income' });

  useEffect(() => {
    fetchBudgetCategories();
    fetchCategories();
  }, []);

  const fetchBudgetCategories = async () => {
    const res = await fetch('/api/budget-categories');
    const data = await res.json();
    setBudgetCategories(data);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/transaction-categories');
    const data = await res.json();
    setCategories(data);
  };

  const addBudgetCategory = async () => {
    if (newBudget.name && newBudget.limit) { // Check for categoryId
      const res = await fetch('/api/budget-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBudget),
      });
      if (res.ok) {
        fetchBudgetCategories();
        setNewBudget({ name: '', limit: '' }); // Reset categoryId and limit
      }
    }
  };

  const deleteBudgetCategory = async (id) => {
    await fetch('/api/budget-categories', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    fetchBudgetCategories();
  };

  const addTransactionCategory = async () => {
    const res = await fetch('/api/transaction-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTransactionCategory),
    });
    if (res.ok) {
      fetchCategories();
      setNewTransactionCategory({ name: '', type: 'income' });
    }
  };

  const deleteTransactionCategory = async (id) => {
    await fetch('/api/transaction-categories', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    fetchCategories();
  };

  return (
    <>
      {/* Manage Budget Categories */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Manage Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="expenseCategory">Expense Category</Label>
                <select
                  id="expenseCategory"
                  className="w-full p-2 border rounded"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })} // Update categoryId
                >
                  <option value="">Select Expense Category</option>
                  {categories
                    .filter(category => category.type === 'expense') // Filter for expense categories
                    .map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex-1">
                <Label htmlFor="budgetLimit">Budget Limit</Label>
                <Input
                  id="budgetLimit"
                  type="number"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={addBudgetCategory}>Add Budget Category</Button>
          </form>
          <ul className="mt-4">
            {budgetCategories.map(category => (
              <li key={category.id} className="flex justify-between items-center p-2 bg-gray-100 rounded mt-1">
                <span>{category.name} - {category.limit} LEI</span>
                <Button variant="destructive" onClick={() => deleteBudgetCategory(category.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Manage Transaction Categories */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Manage Transaction Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="transactionCatName">Category Name</Label>
                <Input
                  id="transactionCatName"
                  value={newTransactionCategory.name}
                  onChange={(e) => setNewTransactionCategory({ ...newTransactionCategory, name: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="transactionType">Type</Label>
                <select
                  id="transactionType"
                  className="w-full p-2 border rounded"
                  value={newTransactionCategory.type}
                  onChange={(e) => setNewTransactionCategory({ ...newTransactionCategory, type: e.target.value })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <Button onClick={addTransactionCategory}>Add Transaction Category</Button>
          </form>
          <ul className="mt-4">
            {categories.map(category => (
              <li key={category.id} className="flex justify-between items-center p-2 bg-gray-100 rounded mt-1">
                <span>{category.name} - {category.type}</span>
                <Button variant="destructive" onClick={() => deleteTransactionCategory(category.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
};

export default SettingsTab;
