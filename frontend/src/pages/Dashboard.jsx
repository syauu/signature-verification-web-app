import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../apiService';

// --- Import React Bootstrap components ---
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // This logic does not need to change
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
      // You could add an alert here for a failed logout if needed
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '800px' }}>
        <Card.Header as="h2" className="text-center p-3">Admin's Dashboard</Card.Header>
        <Card.Body className="p-4">
          <p className="text-center text-muted">Select an administrative action to perform.</p>
          
          {/* Stack provides nice vertical spacing for the buttons */}
          <Stack gap={3} className="mx-auto mt-4">

            {/* Link is from react-router-dom, Button is from react-bootstrap */}
            <Link to="/register-customer" className="d-grid">
              <Button variant="success" size="lg">Register New Customer</Button>
            </Link>

            <Link to="/manage-customers" className="d-grid">
              <Button variant="primary" size="lg">Manage Customers</Button>
            </Link>

            <Link to="/verify-signature" className="d-grid">
              <Button variant="warning" size="lg">Verify Signature</Button>
            </Link>

          </Stack>

          <hr className="my-4" />

          <div className="d-grid">
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Dashboard;