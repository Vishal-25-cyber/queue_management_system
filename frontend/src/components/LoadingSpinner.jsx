import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="loading-spinner-container">
    <div className="loading-spinner" />
    <p className="loading-spinner-message">{message}</p>
  </div>
);

export default LoadingSpinner;
