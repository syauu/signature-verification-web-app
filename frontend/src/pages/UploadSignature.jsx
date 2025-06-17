// frontend/src/pages/UploadSignature.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, uploadReferenceSignature } from '../apiService';

function UploadSignature() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch the list of customers when the component loads
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        setError('Failed to load customers.');
      }
    };
    fetchCustomers();
  }, []);

  const handleFileChange = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !signatureFile) {
      setError('Please select a customer and a signature file.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await uploadReferenceSignature(selectedCustomer, signatureFile);
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard">Back to Dashboard</Link>
      <h2>Upload Genuine Reference Signature</h2>
      <p>Upload a known-good signature for a customer. This will be used as the reference for future verifications.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="customer-select">Select Customer:</label>
        <select
          id="customer-select"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          required
        >
          <option value="" disabled>--Please choose a customer--</option>
          {customers.map((customer) => (
            <option key={customer.customer_id} value={customer.customer_id}>
              {customer.customer_name} ({customer.customer_email})
            </option>
          ))}
        </select>
        <br /><br />
        <label htmlFor="sig-file">Genuine Signature File:</label> <br />
        <input type="file" id="sig-file" onChange={handleFileChange} required />
        <br /><br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload and Save Signature'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default UploadSignature;