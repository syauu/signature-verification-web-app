// frontend/src/pages/RegisterCustomerPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createCustomerWithSignature } from '../apiService';

function RegisterCustomerPage() {
  // Use a single state object to hold all form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationa_id: '',
    signatureFile: null,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTextChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      signatureFile: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    // Create a FormData object to send text and file together
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('signature_file', formData.signatureFile);
    submissionData.append('national_id', formData.national_id);

    try {
      const data = await createCustomerWithSignature(submissionData);
      setMessage(`${data.message}`);
      // Clear form on success
      setFormData({ name: '', email: '', phone: '', signatureFile: null });
      e.target.reset(); // This clears the file input
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard">Back to Dashboard</Link>
      <h2>Register New Customer & Signature</h2>
      <p>Fill out the customer's details and upload their genuine reference signature in one step.</p>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Customer Name:</label><br />
        <input type="text" name="name" onChange={handleTextChange} placeholder="name" required /><br /><br />

        <label>Customer National ID:</label><br />
        <input type="text" name="national_id" onChange={handleTextChange} placeholder="National ID" required /><br /><br />

        <label>Customer Email:</label><br />
        <input type="email" name="email" onChange={handleTextChange} placeholder="email" required /><br /><br />
        
        <label>Customer Phone:</label><br />
        <input type="tel" name="phone" onChange={handleTextChange} placeholder="phone number" /><br /><br />
        
        <label>Genuine Signature File:</label><br />
        <input type="file" name="signatureFile" onChange={handleFileChange} required /><br /><br />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Create Customer & Save Signature'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default RegisterCustomerPage;