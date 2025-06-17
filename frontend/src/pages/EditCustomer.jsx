// frontend/src/pages/EditCustomer.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerDetails, updateCustomer } from '../apiService';

function EditCustomer() {
  const { customerId } = useParams(); // Gets the ID from the URL (e.g., /edit-customer/5)
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    national_id: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await getCustomerDetails(customerId);
        setCustomer(data);
      } catch (err) {
        setError("Failed to fetch customer details.");
      }
    };
    fetchCustomer();
  }, [customerId]);

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await updateCustomer(customerId, customer);
      setMessage(data.message);
      // Navigate back to the manage page after a short delay
      setTimeout(() => navigate('/manage-customers', { state: { refresh: true } }), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Edit Customer: {customer.customer_name}</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label><br />
        <input type="text" name="customer_name" value={customer.customer_name} onChange={handleChange} required /><br /><br />

        <label>Email:</label><br />
        <input type="email" name="customer_email" value={customer.customer_email} onChange={handleChange} required /><br /><br />
        
        <label>Phone:</label><br />
        <input type="tel" name="customer_phone" value={customer.customer_phone || ''} onChange={handleChange} /><br /><br />
        
        <label>National ID:</label><br />
        <input type="text" name="national_id" value={customer.national_id || ''} onChange={handleChange} required /><br /><br />

        <button type="submit">Save Changes</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default EditCustomer;