import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../apiService';

// --- Import React Bootstrap components ---
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';

function Navigation() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      setShowOffcanvas(false);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/register-customer', label: 'Register Customer', icon: '➕' },
    { path: '/manage-customers', label: 'Manage Customers', icon: '👥' },
    { path: '/verify-signature', label: 'Verify Signature', icon: '✍️' },
  ];

  return (
    <>
      <Navbar 
        expand={false} 
        className="mb-3"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
      >
        <Container fluid>
          <div style={{ width: '120px', display: 'flex', justifyContent: 'flex-start' }}>
            <Navbar.Toggle 
              aria-controls="offcanvasNavbar-expand-false"
              onClick={handleShowOffcanvas}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
              }}
            >
              <span style={{ color: 'white', fontSize: '1.2rem' }}>☰</span>
            </Navbar.Toggle>
          </div>
          
          <Navbar.Brand 
            href="#" 
            className="d-flex align-items-center"
            style={{ 
              color: 'white', 
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            SigNet
          </Navbar.Brand>
          
          {/* Back navigation - context-aware */}
          <div style={{ width: '120px', display: 'flex', justifyContent: 'flex-end' }}>
            {location.pathname !== '/dashboard' && (
              <div className="d-flex align-items-center gap-2">
                {location.pathname.startsWith('/edit-customer') ? (
                  // For edit customer, show back to manage customers
                  <Button
                    as={Link}
                    to="/manage-customers"
                    variant="outline-light"
                    size="sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      color: 'white'
                    }}
                  >
                    👥 Customers
                  </Button>
                ) : (
                  // For all other pages, show back to dashboard
                  <Button
                    as={Link}
                    to="/dashboard"
                    variant="outline-light"
                    size="sm"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      color: 'white'
                    }}
                  >
                    🏠 Dashboard
                  </Button>
                )}
              </div>
            )}
          </div>
        </Container>

        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-false"
          aria-labelledby="offcanvasNavbarLabel-expand-false"
          placement="start"
          show={showOffcanvas}
          onHide={handleCloseOffcanvas}
          style={{
            backgroundColor: 'rgba(30, 60, 114, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Offcanvas.Header closeButton style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Offcanvas.Title 
              id="offcanvasNavbarLabel-expand-false"
              style={{ color: 'white', fontWeight: 'bold' }}
            >
              Hand Signature Verification
            </Offcanvas.Title>
          </Offcanvas.Header>
          
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {navItems.map((item) => (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  onClick={handleCloseOffcanvas}
                  className={location.pathname === item.path ? 'active' : ''}
                  style={{
                    color: location.pathname === item.path ? '#61dafb' : 'rgba(255, 255, 255, 0.9)',
                    padding: '12px 16px',
                    margin: '4px 0',
                    borderRadius: '8px',
                    backgroundColor: location.pathname === item.path ? 'rgba(97, 218, 251, 0.1)' : 'transparent',
                    border: location.pathname === item.path ? '1px solid rgba(97, 218, 251, 0.3)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== item.path) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  {item.label}
                </Nav.Link>
              ))}
              
              <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '16px 0' }} />
              
              <Button 
                variant="outline-light" 
                onClick={handleLogout}
                style={{
                  margin: '8px 0',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                }}
              >
                Logout
              </Button>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
      
      {/* Spacer to account for fixed navbar */}
      <div style={{ height: '70px' }}></div>
    </>
  );
}

export default Navigation;
