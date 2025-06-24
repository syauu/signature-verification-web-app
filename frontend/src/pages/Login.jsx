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
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="w-100" style={{ maxWidth: '450px' }}>
        <Card.Body className="p-4">
          <h1 className="text-center mb-2 h3">Hand Signature Verification System</h1>
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