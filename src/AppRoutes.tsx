
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import CustomersPage from '@/pages/CustomersPage';
import OrdersPage from '@/pages/OrdersPage';
import ColorsPage from '@/pages/ColorsPage';
import LogsPage from '@/pages/LogsPage';
import NotFound from '@/pages/NotFound';
import ThankYouPage from '@/pages/ThankYouPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/customers" element={<Layout><CustomersPage /></Layout>} />
      <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
      <Route path="/colors" element={<Layout><ColorsPage /></Layout>} />
      <Route path="/logs" element={<Layout><LogsPage /></Layout>} />
      <Route path="/thank-you" element={<Layout><ThankYouPage /></Layout>} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

export default AppRoutes;
