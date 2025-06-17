// frontend/src/pages/ManageCustomers.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../apiService';

function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // This function fetches the fresh list of customers from the backend.
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await getCustomers();
      // Ensure the data is an array before setting it
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]); // Set to empty array if data is not as expected
      }
      setError('');
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setIsLoading(false);
    }
  };

  // This hook runs once when the component is first loaded.
  useEffect(() => {
    fetchCustomers();
  }, []);

  // This function handles the delete action.
  const handleDeleteClick = async (customerId, customerName) => {
    // Confirmation dialog is a good practice.
    if (window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      try {
        await deleteCustomer(customerId);
        // After deleting from the DB, filter the customer out of the local state
        // to instantly update the UI without a page reload.
        setCustomers(currentCustomers =>
          currentCustomers.filter(c => c.customer_id !== customerId)
        );
      } catch (err) {
        setError(err.message || 'Failed to delete customer.');
      }
    }
  };

  if (isLoading) {
    return <div>Loading customers...</div>;
  }

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
              {/* This will now display the national_id from the API, or 'N/A' if it's null */}
              <td style={{ padding: '8px' }}>{customer.national_id || 'N/A'}</td>
              <td style={{ padding: '8px' }}>
                <Link to={`/edit-customer/${customer.customer_id}`}>
                  <button style={{ marginRight: '10px' }}>Edit</button>
                </Link>
                {/* The onClick handler calls our delete function with the correct arguments */}
                <button onClick={() => handleDeleteClick(customer.customer_id, customer.customer_name)}>
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