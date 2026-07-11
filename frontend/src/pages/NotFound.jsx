import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/NotFound.css';

const NotFound = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReturn = (e) => {
    e.preventDefault();
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}-dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="glitch-wrapper">
          <h1 className="glitch" data-text="404">404</h1>
        </div>
        <h2>Oops! Page Not Found</h2>
        <p>
          The page you're looking for seems to have vanished into thin air.
          Don't worry, you can always find your way back.
        </p>
        <button onClick={handleReturn} className="btn-primary" style={{ cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Return to Safety
        </button>
      </div>
    </div>
  );
};

export default NotFound;
