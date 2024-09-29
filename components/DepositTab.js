// components/DepositTab.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DepositTab = ({ setBalance }) => {
  const [amount, setAmount] = useState('');
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchDepositData();
  }, []);

  // Fetch total deposit and transactions from the API
  const fetchDepositData = async () => {
    const res = await fetch('/api/deposit');
    const data = await res.json();
    setTotalDeposit(data.total);
    setTransactions(data.transactions);
  };

  // Handle adding deposit or withdraw
  const handleTransaction = async (type) => {
    if (!amount || isNaN(amount)) {
      alert('Please enter a valid amount.');
      return;
    }

    const res = await fetch('/api/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        amount: parseFloat(amount),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setAmount('');
      fetchDepositData(); // Refresh deposit data after transaction

      // Adjust the total balance in the parent component (Dashboard)
    //   if (type === 'deposit') {
    //     setBalance((prev) => prev + parseFloat(amount)); // Increase balance
    //   } else if (type === 'withdraw') {
    //     setBalance((prev) => prev - parseFloat(amount)); // Decrease balance
    //   }
    } else {
      alert('Error processing transaction.');
    }
  };

  return (
    <div>
      {/* Total Deposit and Transaction Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Deposit Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Total Deposit: {totalDeposit.toFixed(2)} LEI</h2>
          </div>
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="Enter amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button onClick={() => handleTransaction('deposit')}>Deposit</Button>
            <Button onClick={() => handleTransaction('withdraw')} variant="destructive">Withdraw</Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Deposit Transactions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Deposit Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction.id} className="flex justify-between p-2 bg-gray-100 rounded mt-2">
                <span>{transaction.type === 'deposit' ? 'Deposited' : 'Withdrew'}: {transaction.amount} LEI</span>
                <span>{new Date(transaction.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositTab;
