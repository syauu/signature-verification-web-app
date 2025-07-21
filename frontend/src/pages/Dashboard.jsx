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
            Admin Dashboard
          </h2>
          <p className="text-muted mb-0 mt-2">
            Signature verification system management
          </p>
        </Card.Header>
        <Card.Body className="p-4">
          <p className="text-center text-muted mb-4" style={{ fontSize: '1.1rem' }}>
            Select an administrative action to perform
          </p>
          
          {/* Stack provides nice vertical spacing for the buttons */}
          <Stack gap={3} className="mx-auto mt-4" style={{ maxWidth: '400px' }}>

            {/* Link is from react-router-dom, Button is from react-bootstrap */}
            <Link to="/register-customer" className="d-grid">
              <Button 
                variant="primary" 
                size="lg"
                className="dashboard-btn"
                style={{
                  backgroundColor: 'rgba(13, 110, 253, 0.9)',
                  border: '1px solid rgba(13, 110, 253, 0.5)',
                  backdropFilter: 'blur(5px)',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(13, 110, 253, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Register New Customer
              </Button>
            </Link>

            <Link to="/manage-customers" className="d-grid">
              <Button 
                variant="primary" 
                size="lg"
                className="dashboard-btn"
                style={{
                  backgroundColor: 'rgba(13, 110, 253, 0.9)',
                  border: '1px solid rgba(13, 110, 253, 0.5)',
                  backdropFilter: 'blur(5px)',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(13, 110, 253, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Manage Customers
              </Button>
            </Link>

            <Link to="/verify-signature" className="d-grid">
              <Button 
                variant="primary" 
                size="lg"
                className="dashboard-btn"
                style={{
                  backgroundColor: 'rgba(13, 110, 253, 0.9)',
                  border: '1px solid rgba(13, 110, 253, 0.5)',
                  backdropFilter: 'blur(5px)',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(13, 110, 253, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Verify Signature
              </Button>
            </Link>

          </Stack>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Dashboard;