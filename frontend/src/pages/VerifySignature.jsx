import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { verifySignature } from '../apiService';
import SignatureCanvas from '../components/SignatureCanvas';

// --- Import React Bootstrap components ---
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function VerifySignature() {
  const [nationalId, setNationalId] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureInputMethod, setSignatureInputMethod] = useState('upload'); // 'upload' or 'draw'
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  const handleSignatureDrawn = (drawnSignatureFile) => {
    setSignatureFile(drawnSignatureFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nationalId || !signatureFile) {
      setError('Please provide a National ID and a signature (upload or draw).');
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
    setSignatureInputMethod('upload');
    setVerificationResult(null);
    setError('');
    const fileInput = document.getElementById('sig-file');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // If there is a result, show the result view
  if (verificationResult) {
    const isSuccess = verificationResult.is_verified;
    return (
      <Container fluid style={{ 
        padding: '1rem',
        minHeight: 'calc(100vh - 140px)'
      }}>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
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
              backgroundColor: isSuccess ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)'
            }}>
              <h2 style={{ 
                margin: 0, 
                color: isSuccess ? '#28a745' : '#dc3545',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {isSuccess ? '✅ Verification Successful' : '❌ Verification Failed'}
              </h2>
            </Card.Header>
            <Card.Body className="text-center p-4">
              <div className="mb-4">
                <Badge 
                  bg={isSuccess ? 'success' : 'danger'} 
                  className="fs-4 px-4 py-3 mb-3"
                  style={{
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  {verificationResult.match_percentage}% Match
                </Badge>
              </div>
              
              <Alert variant={isSuccess ? 'success' : 'danger'} className="mb-4">
                <Alert.Heading className="fs-5 mb-2">
                  {isSuccess ? 'Signature Authenticated' : 'Signature Rejected'}
                </Alert.Heading>
                <p className="mb-0">
                  The submitted signature shows a <strong>{verificationResult.match_percentage}%</strong> similarity 
                  to the registered signature for this customer.
                </p>
              </Alert>
              
              <div className="text-muted mb-4">
                <small>
                  <strong>Technical Details:</strong><br/>
                  Distance: {verificationResult.distance.toFixed(4)} | 
                  Threshold: {verificationResult.threshold}
                </small>
              </div>
              
              <div className="d-flex gap-3 justify-content-center">
                <Button 
                  variant="primary" 
                  onClick={handleReset}
                  size="lg"
                  style={{
                    backgroundColor: 'rgba(13, 110, 253, 0.9)',
                    border: '1px solid rgba(13, 110, 253, 0.5)',
                    fontWeight: 'bold'
                  }}
                >
                  Verify Another Signature
                </Button>
                <Button 
                  as={Link} 
                  to="/dashboard" 
                  variant="outline-secondary"
                  size="lg"
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Default view: Show the verification form
  return (
    <Container fluid style={{ 
      padding: '1rem',
      minHeight: 'calc(100vh - 140px)'
    }}>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
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
              Verify Signature
            </h2>
            <p className="text-muted mb-0 mt-2">
              Provide a signature to verify against registered customer signatures
            </p>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Customer National ID</Form.Label>
                <Form.Control
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="Enter National ID to verify signature against"
                  required
                  size="lg"
                />
                <Form.Text className="text-muted">
                  This should match the National ID of a registered customer
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  Signature to Verify
                </Form.Label>
                <Form.Text className="d-block mb-3 text-muted">
                  Provide the signature that you want to verify against the registered signature.
                </Form.Text>
                
                {/* Signature Input Method Selection */}
                <div className="mb-3">
                  <ButtonGroup className="w-100">
                    <Button
                      variant={signatureInputMethod === 'upload' ? 'primary' : 'outline-primary'}
                      onClick={() => {
                        setSignatureInputMethod('upload');
                        setSignatureFile(null);
                      }}
                    >
                      📁 Upload Image
                    </Button>
                    <Button
                      variant={signatureInputMethod === 'draw' ? 'primary' : 'outline-primary'}
                      onClick={() => {
                        setSignatureInputMethod('draw');
                        setSignatureFile(null);
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
                      id="sig-file" 
                      onChange={handleFileChange} 
                      accept="image/png,image/jpeg,image/jpg"
                      className="mb-2"
                      required 
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
                      Draw your signature for verification. Use your Huion tablet with pressure for best results.
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
                  variant="warning"
                  size="lg"
                  style={{ 
                    flex: 1,
                    backgroundColor: 'rgba(255, 193, 7, 0.9)',
                    border: '1px solid rgba(255, 193, 7, 0.5)',
                    color: '#000',
                    fontWeight: 'bold'
                  }}
                >
                  {isLoading ? '🔄 Verifying Signature...' : 'Verify Signature'}
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

export default VerifySignature;