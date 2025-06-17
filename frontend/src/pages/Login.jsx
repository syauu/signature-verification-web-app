import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// We will create this apiService file next
import { adminLogin } from '../apiService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // This API call now specifically tries to log in an Admin
      const data = await adminLogin(email, password);
      if (data.user_type === 'admin') {
        // If login is successful, navigate to the admin dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Hand Signature Verification System</h2>
      <h3>Admin Login </h3>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email" // Changed from ID to email
          required
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password" 
          required
        />
        <br />
        <button type="submit">Log In </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;