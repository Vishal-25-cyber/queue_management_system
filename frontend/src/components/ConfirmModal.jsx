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

  const icons = { danger: '⚠️', warning: '⚠️', info: 'ℹ️' };

  return (
    <div className="confirm-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="confirm-modal">
        <div className={`confirm-modal-icon ${type}`}>
          {icons[type] || icons.info}
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button className={type === 'danger' ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
