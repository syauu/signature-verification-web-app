import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../apiService';

// --- Import React Bootstrap components ---
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added for better UX
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Disable button during API call
    try {
      const data = await adminLogin(email, password);
      if (data.user_type === 'admin') {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false); // Re-enable button after API call
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ 
      minHeight: 'calc(100vh - 2rem)', /* Adjusted for reduced root padding */
      padding: '1rem'
    }}>
      <div className="text-center mb-4"> {/* Reduced margin */}
        <h1 className="display-4 fw-bold mb-3" style={{ 
          fontSize: '2.5rem', 
          letterSpacing: '0.5px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          color: '#ffffff',
          background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Hand Signature Verification System
        </h1>
        <p className="lead" style={{ 
          fontSize: '1.1rem',
          color: '#b3c7f7',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          Secure Authentication & Digital Identity Verification
        </p>
      </div>
      
      <Card className="w-100" style={{ 
        maxWidth: '450px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
        borderRadius: '16px'
      }}>
        <Card.Body className="p-4">
          <h2 className="text-center text-muted mb-4 h5">Admin Login</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button disabled={isLoading} className="w-100 mt-4" type="submit" variant="primary">
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;