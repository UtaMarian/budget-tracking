import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'; // Adjust import paths as necessary
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Example colors for the pie slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5555'];

const ExpensePieChart = ({ transactions }) => {
  // Calculate pieData from transactions
  const pieData = transactions
    .filter(transaction => transaction.type === 'expense') // Only include expenses
    .reduce((acc, curr) => {
      const category = curr.category;
      const amount = curr.amount;

      // Check if the category already exists in the accumulator
      const existingCategory = acc.find(item => item.name === category);

      if (existingCategory) {
        // If it exists, add the current amount to the existing category
        existingCategory.value += amount;
      } else {
        // If it doesn't exist, create a new category entry
        acc.push({ name: category, value: amount });
      }
      
      return acc;
    }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip />
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              label={({ name, value }) => `${name}: ${value.toFixed(2)}`} // Display category name and value on the chart
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

       
      </CardContent>
    </Card>
  );
};

export default ExpensePieChart;
