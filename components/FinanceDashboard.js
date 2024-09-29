// components/FinanceDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import  DashboardTab  from '@/components/DashboardTab';
import  SettingsTab  from '@/components/SettingsTab';
import DepositTab from '@/components/DepositTab';
import ShoppingTab from '@/components/ShoppingTab';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // Options: 'dashboard', 'settings'

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Finance Dashboard</h1>

      {/* <div className="flex space-x-4 mb-4">
        <Button onClick={() => setActiveTab('dashboard')}>Dashboard</Button>
        <Button onClick={() => setActiveTab('settings')}>Settings</Button>
        <Button onClick={() => setActiveTab('deposit')}>Deposit</Button>
        <Button onClick={() => setActiveTab('shopping')}>Shopping</Button>
      </div> */}
      <Tabs defaultValue="account" >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="shopping">Shopping</TabsTrigger>
        </TabsList>
        <TabsContent value="account"><DashboardTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="deposit"><DepositTab /></TabsContent>
        <TabsContent value="shopping"><ShoppingTab /></TabsContent>
      </Tabs>
      {/* {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'deposit' && <DepositTab />}
      {activeTab === 'shopping' && <ShoppingTab />} */}
    </div>
  );
};

export default FinanceDashboard;
