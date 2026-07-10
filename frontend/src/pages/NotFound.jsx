import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LoadingSpinner.css';

const NotFound = () => (
  <div className="error-page">
    <div className="error-code">404</div>
    <div className="error-title">Page Not Found</div>
    <p className="error-text">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/login" className="btn-primary" style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
      ← Go to Login
    </Link>
  </div>
);

export default NotFound;
