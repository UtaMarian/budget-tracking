// components/FinanceDashboard.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import DashboardTab from '@/components/DashboardTab';
import SettingsTab from '@/components/SettingsTab';
import DepositTab from '@/components/DepositTab';
import ShoppingTab from '@/components/ShoppingTab';
import RemindersTab from '@/components/RemindersTab';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const FinanceDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Finance Dashboard</h1>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="shopping">Shopping</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="account"><DashboardTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="deposit"><DepositTab /></TabsContent>
        <TabsContent value="shopping"><ShoppingTab /></TabsContent>
        <TabsContent value="reminders"><RemindersTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;
