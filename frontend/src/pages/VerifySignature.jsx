import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { verifySignature } from '../apiService';

function VerifySignature() {
  // State for managing the component
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

  // If there is a result, show the result page
  if (verificationResult) {
    return (
      <div>
        <h2>Result</h2>
        {verificationResult.is_verified ? (
            <div style={{ color: 'green', border: '2px solid green', padding: '20px' }}>
                <h1>SUCCESS</h1>
                <p>The hand signature is a {verificationResult.match_percentage}% match.</p>
            </div>
        ) : (
            <div style={{ color: 'red', border: '2px solid red', padding: '20px' }}>
                <h1>FAILED</h1>
                <p>The signature does not appear to be a match.</p>
            </div>
        )}
        <p>(Distance: {verificationResult.distance.toFixed(4)} / Threshold: {verificationResult.threshold})</p>
        <button onClick={handleReset}>Verify Another Signature </button>
      </div>
    );
  }

  // Default view: Show the selection and upload form
  return (
    <div>
      <Link to="/dashboard">Back to Dashboard</Link>
      <h2>Verify Signature</h2>
      <form onSubmit={handleSubmit}>
        {/* Step 1: Select a Customer */}
        <label htmlFor="national-id-input">Customer National ID:</label>
        <input
          id="national-id-input"
          type="text"
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
          placeholder="Enter National ID to verify"
          required
        />
        <br /><br />
        {/* Step 2: Upload Signature File */}
        <label htmlFor="sig-file">Provide Signature to Verify:</label> <br />
        <input type="file" id="sig-file" onChange={handleFileChange} required />
        <br /><br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Submit'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default VerifySignature;