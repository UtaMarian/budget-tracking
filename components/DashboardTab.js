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
import { set } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardTab = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]); // State for budgets
  const [categories, setCategories] = useState([]);
  const [currency, setCurrency] = useState('LEI'); // Default to 
  
  //reminders
  const [redReminders, setRedReminders] = useState([]);
  const [hideReminderBox, setHideReminderBox] = useState(false);

  // Euro
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

  useEffect(() => {
    fetchRedReminders();
  }, []);

//   const fetchAccountBalance = async () => {
//     const res = await fetch('/api/transactions/balance'); // Assuming this endpoint returns the total balance
//     const data = await res.json();
//     setBalance(data.totalBalance);
//   };
  
  // const fetchTransactions = async () => {
  //   const res = await fetch('/api/transactions');
  //   const data = await res.json();
  //   setTransactions(data.transactions);
  //   setBalance(data.balance);
  // };
  const fetchTransactions = async () => {
    const res = await fetch('/api/transactions');
    const data = await res.json();

    // Filter transactions to show only those from the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    setTransactions(data.transactions); // Store all transactions
    const monthlyTransactions = data.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    setMonthlyTransactions(monthlyTransactions);
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
    setBudgets(data); 
    
  };

  const fetchRedReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();

      const today = new Date();
      const red = data.reminders.filter(r => {
        const due = new Date(r.date);
        const diff = (due - today) / (1000 * 60 * 60 * 24);
        return diff < 1;
      });

      setRedReminders(red);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWithdraws = transactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + (t.amount || 0), 0);


// --- Monthly totals aggregation (all years combined) ---
const monthlyStats = React.useMemo(() => {
  const map = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const month = date.toLocaleString('default', { month: 'short' }); // e.g. "Jan"
    
    if (!map[month]) {
      map[month] = { income: 0, expense: 0 };
    }

    if (t.type === 'income') {
      map[month].income += t.amount || 0;
    } else if (t.type === 'expense') {
      map[month].expense += t.amount || 0;
    }
  });

  // Convert map to sorted array (Jan → Dec)
  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return monthOrder.map(m => ({
    month: m,
    income: map[m]?.income || 0,
    expense: map[m]?.expense || 0
  }));
}, [transactions]);

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
            <div className="text-4xl font-bold mb-4 flex">
                <div className={`relative transition duration-300 ${isRevealed ? 'filter-none' : 'filter blur-sm'}`}>
                  <p className={`absolute inset-0 bg-zinc-700 opacity-75 ${isRevealed ? 'hidden' : ''}`}></p>
                  <p className={`relative z-10 ${isRevealed ? '' : 'blur'}`}>
                    {currency === 'EUR' ? '€' : 'LEI '}{((totalDeposits+totalWithdraws) / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
                  </p>
                </div>
              <button
                onClick={toggleText}
                className="transition ml-2">
                  {isRevealed ? <VisibilityIcon/> : <VisibilityOffIcon/>}
              </button>
              
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
                className="transition ml-2">
                  {isRevealed ? <VisibilityIcon/> : <VisibilityOffIcon/>}
              </button>
            </div>

          </CardContent>
        </Card>

        {/* Income vs Expenses PieChart */}
        <ExpensePieChart transactions={monthlyTransactions} />
       
      </div>
     {/**CURS BNR */}
     <div className="mt-6 flex justify-center">
      <iframe
        style={{ width: 400, height: 125 }}
        src="https://www.cursbnr.ro/insert/cursvalutar.php?w=300&b=ffffff&bl=fffff&ttc=0a6eab&tc=000000&diff=1&ron=1&cb=0&pics=1"
        title="Curs Valutar BNR"
      />
    </div>
       {/* Reminders*/}
     {!hideReminderBox && redReminders.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-5 rounded-xl shadow-sm mb-6 relative my-6">
          <button
            onClick={() => setHideReminderBox(true)}
            className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 transition"
            aria-label="Dismiss alert"
          >
            ✖
          </button>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span> Urgent Reminders
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-1 text-sm">
            {redReminders.map((r, index) => (
              <li key={index}>
                <span className="font-medium">{r.icon} {r.title}</span> – {r.category} – 
                <span className="font-semibold text-rose-700 ml-1">LEI {parseFloat(r.amount).toFixed(2)}</span> due on 
                <span className="italic ml-1">{new Date(r.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    {/* Display Budgets with Progress Bars */}
    <div className="mt-6">
        <Card>
            <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
            {budgets.map((budget) => {
                const spent = monthlyTransactions
                .filter((t) => t.category === budget.name && t.type === 'expense') // Use budget.name instead of budget.category
                .reduce((sum, t) => sum + (t.amount || 0), 0);

                budget.totalSpent = spent; 
                const progress = (budget.totalSpent / budget.limit) * 100;

                // Determine the progress bar color based on the progress
                const progressColor = progress > 100 ? 'bg-red-500' : 'bg-green-500'; // Red if over budget, green otherwise

                return (
                 <div key={budget.id} className="mb-4">
                    <Label className="font-bold">{budget.name}</Label>

                    {/* Period & Date Range Display */}
                    <div className="text-xs text-gray-500 mb-1">
                       {budget.period?.charAt(0).toUpperCase() + budget.period?.slice(1)}
                      {' '}
                      ({new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()})
                    </div>

                    <div className="relative h-4 bg-gray-200 rounded">
                      <div
                        className={`${progressColor} h-full rounded`}
                        style={{ width: `${progress > 100 ? 100 : progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>
                        {currency === 'EUR' ? '€' : 'lei'}
                        {(budget.totalSpent / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
                        /
                        {currency === 'EUR' ? '€' : 'lei'}
                         {(budget.limit / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
                        
                      </span>
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
              {monthlyTransactions.map(transaction => (
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
      {/* Monthly Income vs Expenses (All Years Combined) */}
      {/* Global Monthly Spend vs Income Summary */}
{/* Global Monthly Spend vs Income Summary */}
<div className="bg-white border p-4 rounded-xl mb-6 mt-6 shadow-sm">
  <p className="text-lg font-semibold mb-3">Overall Monthly Balance</p>
  {(() => {
    const totalIncomeAll = monthlyStats.reduce((s, m) => s + m.income, 0);
    const totalExpenseAll = monthlyStats.reduce((s, m) => s + m.expense, 0);
    const net = totalIncomeAll - totalExpenseAll;

    // Percentage of expense relative to income
    const expensePercent = totalIncomeAll
      ? (totalExpenseAll / totalIncomeAll) * 100
      : 0;

    // Limit to 150% for overspend visualization
    const clampedExpensePercent = Math.min(expensePercent, 150);

    const isOver = totalExpenseAll > totalIncomeAll;

    return (
      <>
        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden mb-2">
          {/* Income section (background) */}
          <div
            className="absolute left-0 top-0 h-full bg-green-400 opacity-60"
            style={{ width: '100%' }}
          />

          {/* Expense overlay */}
          <div
            className="absolute left-0 top-0 h-full bg-red-500"
            style={{
              width: `${Math.min(expensePercent, 100)}%`,
              opacity: 0.8,
            }}
          />

          {/* Net label */}
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
            {isOver ? (
              <span className="text-red-600">
                Overspent {currency === 'EUR' ? '€' : 'lei'}
                {Math.abs(net / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
              </span>
            ) : (
              <span className="text-black">
                Saved {currency === 'EUR' ? '€' : 'lei'}
                {(net / (currency === 'LEI' ? 1 : conversionRate)).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Legend & totals */}
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-sm" /> Income:
            {currency === 'EUR' ? '€' : 'lei'}
            {(totalIncomeAll / (currency === 'LEI' ? 1 : conversionRate)).toFixed(0)}
          </span>

          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-sm" /> Expense:
            {currency === 'EUR' ? '€' : 'lei'}
            {(totalExpenseAll / (currency === 'LEI' ? 1 : conversionRate)).toFixed(0)}
          </span>

          <span className={isOver ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
            {isOver
              ? `-${expensePercent.toFixed(1)}%`
              : `${(100 - expensePercent).toFixed(1)}% saved`}
          </span>
        </div>
      </>
    );
  })()}
</div>


{/* Mobile-Friendly Monthly Overview */}
<div className="mt-10">
  <Card>
    <CardHeader>
      <CardTitle>Monthly Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory scrollbar-thin">
        {monthlyStats.map((m, index) => {
          const income = m.income;
          const expense = m.expense;
          const net = income - expense;
          const progress = income ? (expense / income) * 100 : 0;

          const isOver = expense > income;
          const progressColor = isOver ? "bg-red-500" : "bg-green-500";
          if (income === 0 && expense === 0) {
            return null; // Skip months with no activity
          }else{
          return (
            <div
  key={index}
  className="min-w-[200px] snap-start bg-white border rounded-2xl p-4 shadow-sm flex-shrink-0"
>
  <p className="font-semibold text-center text-sm text-gray-700 mb-1">{m.month}</p>

  {/* Income and Expense amounts */}
  <div className="text-xs text-gray-500 mb-1">
    Income: <span className="text-green-600 font-medium">
      {currency === 'EUR' ? '€' : 'lei'}{(income / (currency === 'LEI' ? 1 : conversionRate)).toFixed(0)}
    </span>
  </div>
  <div className="text-xs text-gray-500 mb-2">
    Expense: <span className="text-red-600 font-medium">
      {currency === 'EUR' ? '€' : 'lei'}{(expense / (currency === 'LEI' ? 1 : conversionRate)).toFixed(0)}
    </span>
  </div>

  {/* Dual progress bar */}
  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
    <div
      className="absolute left-0 top-0 h-full bg-green-400"
      style={{
        width: `${Math.min((income / Math.max(income, expense)) * 100, 100)}%`,
        opacity: 0.7,
      }}
    />
    <div
      className="absolute left-0 top-0 h-full bg-red-500"
      style={{
        width: `${Math.min((expense / Math.max(income, expense)) * 100, 100)}%`,
      }}
    />
  </div>

  {/* Text summary */}
  {net >= 0 ? (
    <p className="text-xs font-semibold text-green-600 text-center">
      Saved {currency === 'EUR' ? '€' : 'lei'}{(net / (currency === 'LEI' ? 1 : conversionRate)).toFixed(0)} 👍
    </p>
  ) : (
    <p className="text-xs font-semibold text-red-500 text-center">
      Overspent {currency === 'EUR' ? '€' : 'lei'}{(Math.abs(net) / (currency === 'LEI' ? 1 : conversionRate)).toFixed(0)} ⚠️
    </p>
  )}
</div>

          );
        }
        })}
      </div>
    </CardContent>
  </Card>
</div>


    </>
  );
};

export default DashboardTab;
