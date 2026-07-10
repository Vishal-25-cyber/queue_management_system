import React, { useState, useEffect } from 'react';
import '../styles/Toast.css';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const { title, message, type } = event.detail;
      const id = Date.now();

      const newToast = { id, title, message, type: type || 'info' };
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    window.addEventListener('show_toast', handleShowToast);
    return () => window.removeEventListener('show_toast', handleShowToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card ${toast.type}`}>
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-content">
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
