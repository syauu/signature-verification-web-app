import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createCustomerWithSignature } from '../apiService';

// --- Import React Bootstrap components ---
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';

function RegisterCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    national_id: '', 
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

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('national_id', formData.national_id);
    submissionData.append('signature_file', formData.signatureFile);

    try {
      const data = await createCustomerWithSignature(submissionData);
      setMessage(`${data.message}`);
      setFormData({ name: '', email: '', phone: '', national_id: '', signatureFile: null });
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ 
      minHeight: 'calc(100vh - 140px)', /* Account for navbar + spacing */
      padding: '1rem'
    }}>
      <Card className="w-100" style={{ 
        maxWidth: '600px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
        borderRadius: '16px'
      }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="mb-2">Register New Customer & Signature</h2>
            <p className="text-muted">
              Fill out the customer's details and upload their genuine reference signature.
            </p>
          </div>
          
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control type="text" name="name" onChange={handleTextChange} placeholder="Enter name" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Customer National ID</Form.Label>
              <Form.Control type="text" name="national_id" onChange={handleTextChange} placeholder="Enter National ID" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Customer Email</Form.Label>
              <Form.Control type="email" name="email" onChange={handleTextChange} placeholder="Enter email" required />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Customer Phone (Optional)</Form.Label>
              <Form.Control type="tel" name="phone" onChange={handleTextChange} placeholder="Enter phone number" />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Genuine Signature File</Form.Label>
              <Form.Control type="file" name="signatureFile" onChange={handleFileChange} required />
            </Form.Group>
            
            <Button disabled={isLoading} className="w-100 mt-3" type="submit">
              {isLoading ? 'Saving...' : 'Create Customer & Save Signature'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegisterCustomerPage;