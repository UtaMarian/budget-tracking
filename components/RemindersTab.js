import React, { useState, useEffect } from 'react';
import { format, differenceInDays, isBefore, addMonths } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select'; // Use your custom select if available

const RemindersTab = () => {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    icon: '💸',
    date: '',
    amount: '',
    repeat: 'once', // NEW
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      const now = new Date();

      const expanded = [];

      for (const r of data.reminders) {
        if (r.repeat === 'monthly') {
          let date = new Date(r.date);
          while (date <= now) {
            date = addMonths(date, 1); // push next month until future
          }
          expanded.push({ ...r, date }); // only show next due
        } else {
          expanded.push(r);
        }
      }

      // sort by date
      expanded.sort((a, b) => new Date(a.date) - new Date(b.date));

      setReminders(expanded);
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddReminder = async () => {
    if (!form.title || !form.date || !form.amount) return;

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ title: '', category: '', icon: '💸', date: '', amount: '', repeat: 'once' });
        fetchReminders();
      } else {
        console.error('Failed to add reminder');
      }
    } catch (err) {
      console.error('Error adding reminder:', err);
    }
  };

  const getBackgroundColor = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const daysLeft = differenceInDays(dueDate, today);

    if (isBefore(dueDate, today)) return 'bg-rose-100 border border-rose-300';
    if (daysLeft < 1) return 'bg-rose-100 border border-rose-300';
    if (daysLeft <= 5) return 'bg-amber-100 border border-amber-300';
    return 'bg-emerald-100 border border-emerald-300';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Reminders</h2>

      {/* Add Reminder Form */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
        <Input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <Input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />
        <Input
          name="icon"
          placeholder="Icon (e.g. 💡)"
          value={form.icon}
          onChange={handleChange}
          maxLength={2}
        />
        <Input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <select
          name="repeat"
          value={form.repeat}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        >
          <option value="once">One-time</option>
          <option value="monthly">Monthly</option>
        </select>

        <Button onClick={handleAddReminder} className="col-span-full md:col-span-1">
          Add Reminder
        </Button>
      </div>

      {/* Reminders List */}
      <div className="grid gap-4">
        {reminders.map((reminder, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl shadow-md border ${getBackgroundColor(reminder.date)}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="text-3xl">{reminder.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{reminder.title}</h3>
                  <p className="text-sm text-slate-500">{reminder.category}</p>
                  {reminder.repeat === 'monthly' && (
                    <span className="text-xs text-slate-400 italic">📅 Monthly</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">
                  {format(new Date(reminder.date), 'PPP')}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  LEI {parseFloat(reminder.amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RemindersTab;
