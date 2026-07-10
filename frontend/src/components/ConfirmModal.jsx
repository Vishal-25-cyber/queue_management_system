import React from 'react';
import '../styles/ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="confirm-modal-card">
        <div className="confirm-modal-header">
          <span className={`confirm-modal-icon-badge ${type}`}>
            {type === 'danger' ? '⚠' : 'ℹ'}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn-primary ${type === 'danger' ? 'btn-danger-confirm' : ''}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
