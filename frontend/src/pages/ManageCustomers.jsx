// frontend/src/pages/ManageCustomers.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../apiService';

function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const location = useLocation();

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers.');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [location.state]);

  const handleDelete = async (customerId, customerName) => {
    // A confirmation dialog is a good practice to prevent accidental deletions
    if (window.confirm(`Are you sure you want to delete ${customerName} and all their related data? This action cannot be undone.`)) {
      try {
        await deleteCustomer(customerId);
        // Refresh the customer list after a successful deletion
        fetchCustomers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div>
      <Link to="/dashboard">Back to Dashboard</Link>
      <h2>Manage Customers</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid white' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>National ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customer_id} style={{ borderBottom: '1px solid grey' }}>
              <td style={{ padding: '8px' }}>{customer.customer_name}</td>
              <td style={{ padding: '8px' }}>{customer.customer_email}</td>
              <td style={{ padding: '8px' }}>{customer.national_id}</td>
              <td style={{ padding: '8px' }}>
                <Link to={`/edit-customer/${customer.customer_id}`}>
                  <button style={{ marginRight: '10px' }}>Edit</button>
                </Link>
                <button onClick={() => handleDelete(customer.customer_id, customer.customer_name)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCustomers;