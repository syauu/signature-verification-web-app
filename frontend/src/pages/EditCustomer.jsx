import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCustomerDetails, updateCustomer } from '../apiService';

function EditCustomer() {
  // useParams() correctly reads the ':customerId' part from the URL
  const { customerId } = useParams();
  const navigate = useNavigate();
  
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    national_id: '',
  });
  const [signatureFile, setSignatureFile] = useState(null); // Keep file state separate
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await getCustomerDetails(customerId);
        setCustomerData(data);
      } catch (err) {
        setError("Failed to fetch customer details.");
      }
    };
    fetchCustomer();
  }, [customerId]);

  const handleChange = (e) => {
    setCustomerData({
      ...customerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('customer_name', customerData.customer_name);
    formData.append('customer_email', customerData.customer_email);
    formData.append('customer_phone', customerData.customer_phone);
    formData.append('national_id', customerData.national_id);
    
    if (signatureFile) {
      formData.append('signature_file', signatureFile);
    }

    try {
      // Here, customerId from useParams is passed to the API service
      const data = await updateCustomer(customerId, formData);
      setMessage(data.message);
      setTimeout(() => navigate('/manage-customers'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <Link to="/manage-customers">Back to Manage Customers</Link>
      <h2>Edit Customer: {customerData.customer_name}</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label><br />
        <input type="text" name="customer_name" value={customerData.customer_name || ''} onChange={handleChange} required /><br /><br />

        <label>Email:</label><br />
        <input type="email" name="customer_email" value={customerData.customer_email || ''} onChange={handleChange} required /><br /><br />
        
        <label>Phone:</label><br />
        <input type="tel" name="customer_phone" value={customerData.customer_phone || ''} onChange={handleChange} /><br /><br />
        
        <label>National ID:</label><br />
        <input type="text" name="national_id" value={customerData.national_id || ''} onChange={handleChange} required /><br /><br />
        
        <label>Upload New Reference Signature (Optional):</label><br/>
        <p style={{fontSize: '0.8em', margin: '0 0 5px 0'}}>If you upload a new file, it will replace the old signature.</p>
        <input type="file" name="signatureFile" onChange={handleFileChange} /><br/><br/>

        <button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default EditCustomer;