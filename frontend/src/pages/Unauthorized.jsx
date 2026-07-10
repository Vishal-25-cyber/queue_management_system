import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoadingSpinner.css';

const Unauthorized = () => (
  <div className="error-page">
    <div className="error-code">403</div>
    <div className="error-title">Access Denied</div>
    <p className="error-text">
      You don't have permission to view this page. Please sign in with the correct account.
    </p>
    <Link to="/login" style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
      ← Back to Login
    </Link>
  </div>
);

export default Unauthorized;
