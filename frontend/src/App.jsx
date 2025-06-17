import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import VerifySignature from './pages/VerifySignature';
import ManageCustomers from './pages/ManageCustomers';
import EditCustomer from './pages/EditCustomer';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <Routes>
            {/* The root path redirects to the login page */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Publicly accessible login page */}
            <Route path="/login" element={<Login />} />

            {/* Admin-only pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-customer" element={<RegisterCustomerPage />} />
            <Route path="/manage-customers" element={<ManageCustomers />} /> 
            <Route path="/edit-customer/:customerId" element={<EditCustomer />} />
            <Route path="/verify-signature" element={<VerifySignature />} />

          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;