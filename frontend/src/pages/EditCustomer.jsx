import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCustomerDetails, updateCustomer } from '../apiService';

// --- Import React Bootstrap components ---
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

function EditCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
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
    setMessage('');
    setError('');
    
    const formData = new FormData();
    formData.append('customer_name', customerData.customer_name);
    formData.append('customer_email', customerData.customer_email);
    formData.append('customer_phone', customerData.customer_phone);
    formData.append('national_id', customerData.national_id);
    
    if (signatureFile) {
      formData.append('signature_file', signatureFile);
    }

    try {
      const data = await updateCustomer(customerId, formData);
      setMessage(data.message);
      setTimeout(() => navigate('/manage-customers'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  // Display a loading spinner while fetching initial data
  if (!customerData) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" />
        <p>Loading Customer Details...</p>
      </Container>
    );
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="w-100" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="mb-2">Edit Customer: {customerData.customer_name}</h2>
            <Link to="/manage-customers">Back to Manage Customers</Link>
          </div>
          
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="customer_name" value={customerData.customer_name || ''} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="customer_email" value={customerData.customer_email || ''} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>National ID</Form.Label>
              <Form.Control type="text" name="national_id" value={customerData.national_id || ''} onChange={handleChange} required />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="tel" name="customer_phone" value={customerData.customer_phone || ''} onChange={handleChange} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Upload New Reference Signature (Optional)</Form.Label>
              <Form.Text className="d-block mb-2">
                If you upload a new file, it will replace the old signature.
              </Form.Text>
              <Form.Control type="file" name="signatureFile" onChange={handleFileChange} />
            </Form.Group>

            <Button disabled={isLoading} className="w-100 mt-3" type="submit">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditCustomer;