import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createCustomerWithSignature } from '../apiService';
import SignatureCanvas from '../components/SignatureCanvas';

// --- Import React Bootstrap components ---
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

function RegisterCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    national_id: '', 
    signatureFile: null,
  });
  const [signatureInputMethod, setSignatureInputMethod] = useState('upload'); // 'upload' or 'draw'
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

  const handleSignatureDrawn = (drawnSignatureFile) => {
    setFormData({
      ...formData,
      signatureFile: drawnSignatureFile,
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
    <Container fluid style={{ 
      padding: '1rem',
      minHeight: 'calc(100vh - 140px)'
    }}>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>
          <Card style={{ 
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
            borderRadius: '16px'
          }}>
          <Card.Header className="text-center p-4" style={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: '#2c3e50',
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              Register New Customer
            </h2>
            <p className="text-muted mb-0 mt-2">
              Add a new customer with their signature to the verification system
            </p>
          </Card.Header>
          <Card.Body className="p-4">
          
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Customer Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name" 
                      onChange={handleTextChange} 
                      placeholder="Enter full name" 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>National ID</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="national_id" 
                      onChange={handleTextChange} 
                      placeholder="Enter National ID" 
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      onChange={handleTextChange} 
                      placeholder="Enter email address" 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number (Optional)</Form.Label>
                    <Form.Control 
                      type="tel" 
                      name="phone" 
                      onChange={handleTextChange} 
                      placeholder="Enter phone number" 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  Genuine Signature
                </Form.Label>
                <Form.Text className="d-block mb-3 text-muted">
                  Provide the customer's authentic signature for verification purposes.
                </Form.Text>
                
                {/* Signature Input Method Selection */}
                <div className="mb-3">
                  <ButtonGroup className="w-100">
                    <Button
                      variant={signatureInputMethod === 'upload' ? 'primary' : 'outline-primary'}
                      onClick={() => {
                        setSignatureInputMethod('upload');
                        setFormData({...formData, signatureFile: null});
                      }}
                    >
                      📁 Upload Image
                    </Button>
                    <Button
                      variant={signatureInputMethod === 'draw' ? 'primary' : 'outline-primary'}
                      onClick={() => {
                        setSignatureInputMethod('draw');
                        setFormData({...formData, signatureFile: null});
                      }}
                    >
                      ✏️ Draw Signature
                    </Button>
                  </ButtonGroup>
                </div>

                {/* File Upload Section */}
                {signatureInputMethod === 'upload' && (
                  <div>
                    <Form.Control 
                      type="file" 
                      name="signatureFile" 
                      onChange={handleFileChange} 
                      accept="image/png,image/jpeg,image/jpg"
                      className="mb-2"
                      required 
                    />
                    {formData.signatureFile && (
                      <div className="mt-2">
                        <small className="text-success">
                          ✅ Selected: {formData.signatureFile.name} ({(formData.signatureFile.size / 1024).toFixed(1)} KB)
                        </small>
                      </div>
                    )}
                    <Form.Text className="text-muted">
                      Supported formats: PNG, JPEG, JPG (Max 5MB)
                    </Form.Text>
                  </div>
                )}

                {/* Signature Drawing Section */}
                {signatureInputMethod === 'draw' && (
                  <div>
                    <SignatureCanvas
                      onSignatureChange={handleSignatureDrawn}
                      width={500}
                      height={500}
                    />
                    <Form.Text className="text-muted mt-2 d-block">
                      Use your Huion tablet with pressure sensitivity for the best signature quality.
                    </Form.Text>
                  </div>
                )}
              </Form.Group>
              
              <div className="d-flex justify-content-between gap-3">
                <Button 
                  as={Link} 
                  to="/dashboard" 
                  variant="outline-secondary"
                  size="lg"
                  style={{ width: '150px' }}
                >
                  ← Back
                </Button>
                <Button 
                  disabled={isLoading} 
                  type="submit"
                  variant="success"
                  size="lg"
                  style={{ 
                    flex: 1,
                    backgroundColor: 'rgba(40, 167, 69, 0.9)',
                    border: '1px solid rgba(40, 167, 69, 0.5)',
                    fontWeight: 'bold'
                  }}
                >
                  {isLoading ? '🔄 Creating Customer...' : 'Create Customer & Save Signature'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterCustomerPage;