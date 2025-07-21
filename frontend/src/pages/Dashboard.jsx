import React from 'react';
import { Link } from 'react-router-dom';

// --- Import React Bootstrap components ---
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';

function Dashboard() {
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ 
      minHeight: 'calc(100vh - 140px)', /* Account for navbar + spacing */
      padding: '1rem'
    }}>
      <Card style={{ 
        width: '800px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
        borderRadius: '16px'
      }}>
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
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Dashboard;