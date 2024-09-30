// components/DashboardTab.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'; 
import { Label } from '@/components/ui/label';
import TransactionForm from '@/components/TransactionForm'; // Import the transaction form
import ExpensePieChart from '@/components/ExpensePieChart'; 
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const DashboardTab = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]); // State for budgets
  const [categories, setCategories] = useState([]);
  const [currency, setCurrency] = useState('LEI'); // Default to Euro
  const conversionRate = 5; // 1 Euro = 5 Lei
  const [isRevealed, setIsRevealed] = useState(false);
  const toggleText = () => {
        setIsRevealed(!isRevealed);
    };
  
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchBudgets(); // Fetch budgets when the component mounts
   // fetchAccountBalance();
  }, []);

//   const fetchAccountBalance = async () => {
//     const res = await fetch('/api/transactions/balance'); // Assuming this endpoint returns the total balance
//     const data = await res.json();
//     setBalance(data.totalBalance);
//   };
  
  const fetchTransactions = async () => {
    const res = await fetch('/api/transactions?limit=5');
    const data = await res.json();
    setTransactions(data.transactions);
    setBalance(data.balance);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/transaction-categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchBudgets = async () => {
    const res = await fetch('/api/budgets'); // Your API endpoint to fetch budgets
    const data = await res.json();
    setBudgets(data); // Assuming data is an array of budget objects
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWithdraws = transactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <>
      {/* Currency Switch */}
      <div className="flex items-center mb-4">
        <Label className="mr-2">Currency:</Label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border rounded p-2"
        >
          <option value="EUR">Euro (€)</option>
          <option value="LEI">Leu (lei)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {currency === 'EUR' ? '€' : 'LEI '}{(balance / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
            </div>
            <div className="flex justify-between items-center text-sm">
              <Badge variant="outline" className="bg-green-100 text-green-600">
                Income: {currency === 'EUR' ? '€' : 'lei'}{(totalIncome / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-600">
                Expenses: {currency === 'EUR' ? '€' : 'lei'}{(totalExpenses / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
              </Badge>
            </div>
            <Separator className="my-2" />
            <div className='pace-y-1.5'>
              <CardTitle className='mt-2 mb-4'>Deposit</CardTitle>
            </div>
            <div className="text-4xl font-bold mb-4">
              {currency === 'EUR' ? '€' : 'LEI '}{((totalDeposits+totalWithdraws) / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-600">
                Deposits: {currency === 'EUR' ? '€' : 'lei'}{(totalDeposits / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-600">
                Withdraws: {currency === 'EUR' ? '€' : 'lei'}{(totalWithdraws / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
              </Badge>
            </div>
            <Separator className="my-2" />
            <div className='pace-y-1.5'>
              <CardTitle className='mt-2 mb-4'>Total</CardTitle>
            </div>
            <div className="text-4xl font-bold flex">
                <div className={`relative transition duration-300 ${isRevealed ? 'filter-none' : 'filter blur-sm'}`}>
                <p className={`absolute inset-0 bg-zinc-700 opacity-75 ${isRevealed ? 'hidden' : ''}`}></p>
                <p className={`relative z-10 ${isRevealed ? '' : 'blur'}`}>
                {currency === 'EUR' ? '€' : 'LEI '}{((totalDeposits+totalWithdraws+balance) / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
              </p>
            </div>
              <button
                onClick={toggleText}
                className="transition">
                  {isRevealed ? <VisibilityIcon/> : <VisibilityOffIcon/>}
              </button>
            </div>

          </CardContent>
        </Card>

        {/* Income vs Expenses PieChart */}
        <ExpensePieChart transactions={transactions} />
       
      </div>

      {/* Display Budgets with Progress Bars */}
    <div className="mt-6">
        <Card>
            <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
            {budgets.map((budget) => {
                const spent = transactions
                .filter((t) => t.category === budget.name && t.type === 'expense') // Use budget.name instead of budget.category
                .reduce((sum, t) => sum + (t.amount || 0), 0);

                const progress = (budget.totalSpent / budget.limit) * 100;

                // Determine the progress bar color based on the progress
                const progressColor = progress > 100 ? 'bg-red-500' : 'bg-green-500'; // Red if over budget, green otherwise

                return (
                <div key={budget.id} className="mb-4">
                    <Label className="font-bold">{budget.name}</Label>
                    <div className={`relative h-4 bg-gray-200 rounded`}>
                    <div className={`${progressColor} h-full rounded`} style={{ width: `${progress > 100 ? 100 : progress}%` }} />
                    </div>
                    <div className="flex justify-between text-sm">
                    <span>{currency === 'EUR' ? '€' : 'lei'}{(budget.totalSpent / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}/ {currency === 'EUR' ? '€' : 'lei'}{budget.limit.toFixed(2)}</span>
                    
                    <span>{progress.toFixed(2)}%</span>
                    </div>
                </div>
                );
            })}
            </CardContent>
        </Card>
    </div>


      {/* Add New Transaction Form */}
      <TransactionForm categories={categories} setTransactions={setTransactions} setBalance={setBalance} />

      {/* Display All Transactions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {transaction.type === 'income' ? (
                        <p className="text-green-500">Income</p>
                    ) : transaction.type === 'expense' ? (
                        <p className="text-red-500">Expense</p>
                    ) : transaction.type === 'deposit' ? (
                        <p className="text-blue-500">Deposit</p>
                    ) : transaction.type === 'withdraw' ? (
                        <p className="text-yellow-500">Withdraw</p>
                    ) : null}
                  </TableCell>

                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>
                    {currency === 'EUR' ? '€' : 'lei'}{(transaction.amount / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
                  </TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardTab;
