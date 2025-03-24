
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './AppRoutes';
import Layout from './components/Layout';
import { Toaster } from 'sonner';

import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
        <Toaster position="top-right" richColors closeButton />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
