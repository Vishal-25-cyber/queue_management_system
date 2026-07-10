import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="loading-screen">
    <div className="spinner-ring" />
    <p className="loading-message">{message}</p>
  </div>
);

export default LoadingSpinner;
