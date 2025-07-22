import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer, updateCustomer } from '../apiService';

// --- Import React Bootstrap components ---
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Offcanvas from 'react-bootstrap/Offcanvas';

function ManageCustomers() {
  const fileInputRef = useRef(null);
  
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomersList, setShowCustomersList] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    customer_email: '',
    phone: '',
    national_id: ''
  });
  const [signatureFile, setSignatureFile] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  // This function fetches the fresh list of customers from the backend.
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await getCustomers();
      console.log('Fetched customers data:', data);
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
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
    if (window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      try {
        await deleteCustomer(customerId);
        setCustomers(currentCustomers =>
          currentCustomers.filter(c => c.customer_id !== customerId)
        );
        // If deleted customer was selected, clear selection
        if (selectedCustomer?.customer_id === customerId) {
          setSelectedCustomer(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to delete customer.');
      }
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    try {
      console.log('Selected customer:', customer);
      setSelectedCustomer(customer);
      setEditFormData({
        customer_name: customer.customer_name || '',
        customer_email: customer.customer_email || '',
        phone: customer.customer_phone || customer.phone || '', // Handle both field names
        national_id: customer.national_id || ''
      });
      setShowCustomersList(false);
      setUpdateError('');
      setUpdateMessage('');
      setSignatureFile(null); // Clear signature file when selecting new customer
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setUpdateError('Failed to load customer details: ' + err.message);
      setShowCustomersList(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // Handle signature file selection
  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setUpdateError('Please select a PNG or JPEG image file.');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateError('File size must be less than 5MB.');
        e.target.value = '';
        return;
      }
      
      setSignatureFile(file);
      setUpdateError('');
    } else {
      setSignatureFile(null);
    }
  };

  // Handle form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateMessage('');

    try {
      // Create FormData with the exact field names that the backend expects
      const submissionData = new FormData();
      submissionData.append('customer_name', editFormData.customer_name);
      submissionData.append('customer_email', editFormData.customer_email);
      submissionData.append('customer_phone', editFormData.phone);
      submissionData.append('national_id', editFormData.national_id);
      
      // Add signature file if selected
      if (signatureFile) {
        submissionData.append('signature_file', signatureFile);
        console.log('Including signature file in update:', signatureFile.name);
      }

      const updatedCustomer = await updateCustomer(selectedCustomer.customer_id, submissionData);
      console.log('Updated customer response:', updatedCustomer);
      
      setUpdateMessage('Customer updated successfully!');
      
      // Update the customer in the list - ensure we have all the required fields
      if (updatedCustomer && updatedCustomer.customer_id) {
        console.log('Updating customer in list with:', updatedCustomer);
        setCustomers(currentCustomers =>
          currentCustomers.map(c => 
            c.customer_id === selectedCustomer.customer_id ? updatedCustomer : c
          )
        );
        
        // Update selected customer with the returned data
        setSelectedCustomer(updatedCustomer);
        
        // Clear signature file after successful update
        setSignatureFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Keep the form data populated with the updated values
        setEditFormData({
          customer_name: updatedCustomer.customer_name || '',
          customer_email: updatedCustomer.customer_email || '',
          phone: updatedCustomer.customer_phone || '', // Backend returns it as customer_phone
          national_id: updatedCustomer.national_id || ''
        });
      } else {
        console.log('Update response incomplete, refreshing customer list');
        // Fallback: refresh the customer list if the update response is incomplete
        await fetchCustomers();
        
        // Clear signature file after update
        setSignatureFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Keep the form data as entered by user
        setEditFormData({
          customer_name: editFormData.customer_name,
          customer_email: editFormData.customer_email,
          phone: editFormData.phone,
          national_id: editFormData.national_id
        });
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update customer.');
    }
  };

  if (isLoading) {
    return (
        <Container className="text-center" style={{ padding: '2rem' }}>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
    );
  }

  return (
    <Container style={{ 
      padding: '1rem',
      minHeight: 'calc(100vh - 140px)'
    }}>
      {/* Header with customer list toggle */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          Manage Customers
        </h2>
        <Button
          variant="outline-light"
          onClick={() => setShowCustomersList(true)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
          }}
        >
          👥 View All Customers ({customers.length})
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={12}>
          {selectedCustomer ? (
            // Edit Customer Form
            <Card style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
              borderRadius: '16px'
            }}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4>Edit Customer: {selectedCustomer.customer_name}</h4>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  ✕ Close
                </Button>
              </Card.Header>
              <Card.Body>
                {updateMessage && <Alert variant="success">{updateMessage}</Alert>}
                {updateError && <Alert variant="danger">{updateError}</Alert>}
                
                <Form onSubmit={handleUpdateSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Customer Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="customer_name"
                          value={editFormData.customer_name}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="customer_email"
                          value={editFormData.customer_email}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>National ID</Form.Label>
                        <Form.Control
                          type="text"
                          name="national_id"
                          value={editFormData.national_id}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Signature File Upload Section */}
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Update Signature (Optional)
                        </Form.Label>
                        <Form.Text className="d-block mb-2 text-muted">
                          Upload a new signature image to replace the current one. Leave empty to keep existing signature.
                        </Form.Text>
                        <Form.Control
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleSignatureFileChange}
                          className="mb-2"
                          ref={fileInputRef}
                        />
                        {signatureFile && (
                          <div className="mt-2">
                            <small className="text-success">
                              ✅ Selected: {signatureFile.name} ({(signatureFile.size / 1024).toFixed(1)} KB)
                            </small>
                          </div>
                        )}
                        <Form.Text className="text-muted">
                          Supported formats: PNG, JPEG, JPG (Max 5MB)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-between">
                    <Button variant="primary" type="submit">
                      {signatureFile ? 'Update Customer & Signature' : 'Update Customer'}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteClick(selectedCustomer.customer_id, selectedCustomer.customer_name)}
                    >
                      Delete Customer
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            // Welcome screen
            <Card style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
              borderRadius: '16px',
              textAlign: 'center',
              padding: '3rem'
            }}>
              <div>
                <h3 className="text-muted mb-4">👥 Customer Management</h3>
                <p className="lead mb-4">
                  Select a customer from the list to edit their information
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Button
                    as={Link}
                    to="/register-customer"
                    variant="success"
                    size="lg"
                  >
                    Add New Customer
                  </Button>
                </div>
                <div className="mt-4">
                  <Badge bg="info" className="fs-6">
                    {customers.length} customers registered
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Customers List Offcanvas */}
      <Offcanvas 
        show={showCustomersList} 
        onHide={() => setShowCustomersList(false)}
        placement="start"
        style={{
          backgroundColor: 'rgba(30, 60, 114, 0.95)',
          backdropFilter: 'blur(10px)',
          width: '400px'
        }}
      >
        <Offcanvas.Header closeButton style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <Offcanvas.Title style={{ color: 'white', fontWeight: 'bold' }}>
            👥 All Customers ({customers.length})
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: '0' }}>
          {customers.length === 0 ? (
            <div className="text-center p-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <p>No customers found</p>
              <Button
                as={Link}
                to="/register-customer"
                variant="outline-light"
                onClick={() => setShowCustomersList(false)}
              >
                ➕ Register First Customer
              </Button>
            </div>
          ) : (
            <ListGroup variant="flush">
              {customers.map((customer) => (
                <ListGroup.Item
                  key={customer.customer_id}
                  action
                  onClick={() => handleCustomerSelect(customer)}
                  style={{
                    backgroundColor: selectedCustomer?.customer_id === customer.customer_id 
                      ? 'rgba(97, 218, 251, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCustomer?.customer_id !== customer.customer_id) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCustomer?.customer_id !== customer.customer_id) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {customer.customer_name}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                        {customer.customer_email}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: '0.6' }}>
                        Phone: {customer.customer_phone || customer.phone || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: '0.6' }}>
                        ID: {customer.national_id || 'N/A'}
                      </div>
                    </div>
                    {selectedCustomer?.customer_id === customer.customer_id && (
                      <Badge bg="info">Selected</Badge>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}

export default ManageCustomers;