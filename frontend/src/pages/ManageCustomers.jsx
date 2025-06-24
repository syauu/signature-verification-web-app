import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer } from '../apiService';

// --- Import React Bootstrap components ---
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // This function fetches the fresh list of customers from the backend.
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await getCustomers();
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
      } catch (err) {
        setError(err.message || 'Failed to delete customer.');
      }
    }
  };

  if (isLoading) {
    return (
        <Container className="text-center p-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Customers</h2>
        <Link to="/dashboard">
          <Button variant="secondary" className="ms-4">Back to Dashboard</Button>
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>National ID</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customer_id}>
              <td>{customer.customer_name}</td>
              <td>{customer.customer_email}</td>
              <td>{customer.national_id || 'N/A'}</td>
              <td className="text-center">
                <ButtonGroup>
                  <Link to={`/edit-customer/${customer.customer_id}`}>
                    <Button variant="primary" size="sm">Edit</Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(customer.customer_id, customer.customer_name)}
                  >
                    Delete
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ManageCustomers;