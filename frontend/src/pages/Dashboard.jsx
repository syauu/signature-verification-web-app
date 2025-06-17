import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../apiService';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Admin's Dashboard </h2>
      <nav>
        <ul>
          <li>
            {/* This button is based on the mockup  */}
            <Link to="/register-customer">
              <button>Register New Customer</button>
            </Link>
          </li>
          <li>
            <Link to="/upload-signature">
               <button>Upload Reference Signature</button>
            </Link>
          </li>
          <li>
            <Link to="/manage-customers">
            <button>Manage Customers</button>
            </Link>
          </li>
          <li>
            <Link to="/verify-signature">
               <button>Verify Signature</button>
            </Link>
          </li>
        </ul>
      </nav>
      <hr />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;