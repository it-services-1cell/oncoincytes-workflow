import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import TestOrders from './pages/TestOrders';
import TestOrderDetail from './pages/TestOrderDetail';
import NewTestOrder from './pages/NewTestOrder';
import CPCWorkflow from './pages/CPCWorkflow';
import Batches from './pages/Batches';
import CreateBatch from './pages/CreateBatch';
import BatchDetail from './pages/BatchDetail';
import Reports from './pages/Reports';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/test-orders" replace />} />
          <Route path="test-orders" element={<TestOrders />} />
          <Route path="test-orders/new" element={<NewTestOrder />} />
          <Route path="test-orders/:id" element={<TestOrderDetail />} />
          <Route path="cpc-workflow" element={<CPCWorkflow />} />
          <Route path="batches" element={<Batches />} />
          <Route path="batches/new" element={<CreateBatch />} />
          <Route path="batches/:id" element={<BatchDetail />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
