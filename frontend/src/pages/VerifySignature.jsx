import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { verifySignature } from '../apiService';

// --- Import React Bootstrap components ---
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';

function VerifySignature() {
  const [nationalId, setNationalId] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nationalId || !signatureFile) {
      setError('Please provide a National ID and a signature file.');
      return;
    }
    setIsLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const result = await verifySignature(nationalId, signatureFile);
      setVerificationResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNationalId('');
    setSignatureFile(null);
    setVerificationResult(null);
    setError('');
    document.getElementById('sig-file').value = '';
  };

  // If there is a result, show the result view
  if (verificationResult) {
    const isSuccess = verificationResult.is_verified;
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Card className="w-100 text-center" style={{ maxWidth: '500px' }}>
          <Card.Header as="h2">Result</Card.Header>
          <Card.Body>
            <Alert variant={isSuccess ? 'success' : 'danger'}>
              <Alert.Heading>{isSuccess ? 'SUCCESS' : 'FAILED'}</Alert.Heading>
              <p className="mb-0">
                The hand signature is a {verificationResult.match_percentage}% match.
              </p>
            </Alert>
            <Card.Text className="text-muted mt-3">
              (Distance: {verificationResult.distance.toFixed(4)} / Threshold: {verificationResult.threshold})
            </Card.Text>
            <Button variant="primary" onClick={handleReset} className="mt-3">
              Verify Another Signature
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Default view: Show the verification form
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="w-100" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="mb-2">Verify Signature</h2>
            <Link to="/dashboard">Back to Dashboard</Link>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Customer National ID</Form.Label>
              <Form.Control
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Enter National ID to verify"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Signature to Verify</Form.Label>
              <Form.Control type="file" id="sig-file" onChange={handleFileChange} required />
            </Form.Group>
            <Button disabled={isLoading} className="w-100 mt-3" type="submit">
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default VerifySignature;