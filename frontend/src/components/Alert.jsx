import React from 'react';
import '../styles/Alert.css';

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const Alert = ({ type = 'info', message, onClose }) => {
  React.useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, type, onClose]);

  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-icon">{ICONS[type] || ICONS.info}</span>
      <span className="alert-message">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
