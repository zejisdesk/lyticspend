import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, actionType = 'delete' }) => {
  if (!isOpen) return null;

  // Determine button text and class based on action type
  const getButtonConfig = () => {
    switch (actionType.toLowerCase()) {
      case 'delete':
        return { text: 'Delete', className: 'delete-confirm-btn' };
      case 'reset':
        return { text: 'Reset', className: 'reset-confirm-btn' };
      case 'update':
        return { text: 'Update', className: 'update-confirm-btn' };
      default:
        return { text: 'Confirm', className: 'confirm-btn' };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="modal-overlay">
      <div className="modal-content confirmation-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="confirmation-body">
          <p>{message}</p>
        </div>
        
        <div className="confirmation-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className={buttonConfig.className} onClick={onConfirm}>
            {buttonConfig.text}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
