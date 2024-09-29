import React, { useEffect } from 'react';
import FinanceDashboard from '@/components/FinanceDashboard'; // Import the dashboard
import '../app/globals.css'; 
import Head from 'next/head';
import { useRouter } from 'next/router';


export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('authenticated');
    if (!isAuthenticated && router.pathname !== '/password') {
      router.push('/password'); // Redirect to password page if not authenticated
    }
  }, [router])
  return (
    <div>
       <Head>
        <link rel="icon" href="https://img.icons8.com/?size=80&id=ejuMmK5Y9unS&format=png" type="image/png"sizes="32x32"/>
        <title>Budget Tracking</title>
      </Head>

      <FinanceDashboard /> 
    </div>
  );
}
