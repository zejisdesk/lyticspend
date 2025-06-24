import React, { useState } from 'react';
import IconDropdown from './IconDropdown';
import ConfirmationModal from './ConfirmationModal';

const PaymentMethodManagementModal = ({ 
  isOpen, 
  onClose, 
  title,
  paymentMethods, 
  methodType, 
  searchQuery, 
  setSearchQuery, 
  editingPaymentMethod, 
  setEditingPaymentMethod, 
  newPaymentMethodName, 
  setNewPaymentMethodName, 
  newPaymentMethodIcon, 
  setNewPaymentMethodIcon, 
  addPaymentMethod, 
  updatePaymentMethod, 
  removePaymentMethod, 
  resetPaymentMethods 
}) => {
  // Confirmation modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState(null);
  
  // Filter payment methods based on search query
  const filteredPaymentMethods = searchQuery.trim() === '' 
    ? paymentMethods 
    : paymentMethods.filter(method => method.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handle add payment method
  const handleAddPaymentMethod = () => {
    if (!newPaymentMethodName.trim()) return;
    
    addPaymentMethod(methodType, {
      id: Date.now().toString(),
      name: newPaymentMethodName.trim(),
      icon: newPaymentMethodIcon
    });
    
    setNewPaymentMethodName('');
    setNewPaymentMethodIcon('fa-credit-card');
    setEditingPaymentMethod(null);
  };

  // Handle update payment method
  const handleUpdatePaymentMethod = () => {
    if (!editingPaymentMethod || !newPaymentMethodName.trim()) return;
    setShowUpdateConfirmation(true);
  };
  
  // Confirm update payment method
  const confirmUpdatePaymentMethod = () => {
    updatePaymentMethod(methodType, editingPaymentMethod.id, {
      ...editingPaymentMethod,
      name: newPaymentMethodName.trim(),
      icon: newPaymentMethodIcon
    });
    
    setNewPaymentMethodName('');
    setNewPaymentMethodIcon('fa-credit-card');
    setEditingPaymentMethod(null);
    setShowUpdateConfirmation(false);
  };

  // Handle edit payment method
  const handleEditPaymentMethod = (paymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setNewPaymentMethodName(paymentMethod.name);
    setNewPaymentMethodIcon(paymentMethod.icon);
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = (paymentMethod) => {
    setPaymentMethodToDelete(paymentMethod);
    setShowDeleteConfirmation(true);
  };
  
  // Confirm delete payment method
  const confirmDeletePaymentMethod = () => {
    if (!paymentMethodToDelete) return;
    
    removePaymentMethod(methodType, paymentMethodToDelete.id);
    
    if (editingPaymentMethod && editingPaymentMethod.id === paymentMethodToDelete.id) {
      setEditingPaymentMethod(null);
      setNewPaymentMethodName('');
      setNewPaymentMethodIcon('fa-credit-card');
    }
    
    setPaymentMethodToDelete(null);
    setShowDeleteConfirmation(false);
  };

  // Handle reset payment methods
  const handleResetPaymentMethods = () => {
    setShowResetConfirmation(true);
  };
  
  // Confirm reset payment methods
  const confirmResetPaymentMethods = () => {
    resetPaymentMethods(methodType);
    setEditingPaymentMethod(null);
    setNewPaymentMethodName('');
    setNewPaymentMethodIcon('fa-credit-card');
    setShowResetConfirmation(false);
  };

  // Handle close modal
  const handleCloseModal = () => {
    onClose();
    setSearchQuery('');
    setEditingPaymentMethod(null);
    setNewPaymentMethodName('');
    setNewPaymentMethodIcon('fa-credit-card');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content category-modal">
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={confirmDeletePaymentMethod}
          title="Delete Payment Method"
          message={`Are you sure you want to delete the payment method "${paymentMethodToDelete?.name || ''}"?`}
          actionType="delete"
        />
        
        {/* Reset Confirmation Modal */}
        <ConfirmationModal
          isOpen={showResetConfirmation}
          onClose={() => setShowResetConfirmation(false)}
          onConfirm={confirmResetPaymentMethods}
          title="Reset Payment Methods"
          message="Are you sure you want to reset all payment methods to default? This action cannot be undone."
          actionType="reset"
        />
        
        {/* Update Confirmation Modal */}
        <ConfirmationModal
          isOpen={showUpdateConfirmation}
          onClose={() => setShowUpdateConfirmation(false)}
          onConfirm={confirmUpdatePaymentMethod}
          title="Update Payment Method"
          message={`Are you sure you want to update the payment method "${editingPaymentMethod?.name || ''}"?`}
          actionType="update"
        />
        
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={handleCloseModal}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          
          {/* Payment Method Search */}
          <div className="category-search-container">
            <div className="category-search-input-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="category-search-input"
                placeholder="Search payment methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search-button"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button 
              className="small-reset-button" 
              onClick={handleResetPaymentMethods}
              title="Reset to default payment methods"
            >
              Reset
            </button>
          </div>

          {/* Payment Methods List */}
          <div className="categories-list">
            {filteredPaymentMethods.map(paymentMethod => (
              <div key={paymentMethod.id} className="category-item">
                <div className="category-info">
                  <i className={`fas ${paymentMethod.icon} category-icon`}></i>
                  <span className="category-name">{paymentMethod.name}</span>
                </div>
                <div className="category-actions">
                  <button 
                    className="edit-category-button"
                    onClick={() => handleEditPaymentMethod(paymentMethod)}
                    title="Edit payment method"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="delete-category-button"
                    onClick={() => handleDeletePaymentMethod(paymentMethod)}
                    title="Delete payment method"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Payment Method Form */}
          <div className="category-form">
            <h4>{editingPaymentMethod ? 'Edit Payment Method' : 'Add New Payment Method'}</h4>
            
            <div className="form-group">
              <label htmlFor="paymentMethodName">Name</label>
              <input
                type="text"
                id="paymentMethodName"
                value={newPaymentMethodName}
                onChange={(e) => setNewPaymentMethodName(e.target.value)}
                placeholder="Payment method name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="paymentMethodIcon">Icon</label>
              <IconDropdown
                id="paymentMethodIcon"
                value={newPaymentMethodIcon}
                onChange={(e) => setNewPaymentMethodIcon(e.target.value)}
              />
            </div>
            
            <div className={`form-actions ${editingPaymentMethod ? 'editing' : ''}`}>
              <button 
                className="primary-button"
                onClick={editingPaymentMethod ? handleUpdatePaymentMethod : handleAddPaymentMethod}
              >
                {editingPaymentMethod ? 'Update' : 'Add'}
              </button>
              
              {editingPaymentMethod && (
                <button 
                  className="secondary-button"
                  onClick={() => {
                    setEditingPaymentMethod(null);
                    setNewPaymentMethodName('');
                    setNewPaymentMethodIcon('fa-credit-card');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodManagementModal;
