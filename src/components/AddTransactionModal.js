import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';

const AddTransactionModal = ({ isOpen, onClose, onSave, type, transaction = null, isEditing = false }) => {
  const { currency } = useCurrency();
  const { expenseCategories, incomeCategories } = useCategories();
  const { expensePaymentMethods, incomePaymentMethods } = usePaymentMethods();
  
  // State to track if we're using preserved values
  const [usingPreservedValues, setUsingPreservedValues] = useState(false);
  
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  // Helper function to get preserved values from localStorage
  const getPreservedValues = (transactionType) => {
    try {
      const key = `${transactionType}LastValues`;
      const savedValues = localStorage.getItem(key);
      if (savedValues) {
        return JSON.parse(savedValues);
      }
    } catch (error) {
      console.error('Error loading preserved values:', error);
    }
    return null;
  };
  
  // Initialize form values based on transaction, preserved values, or defaults
  const initializeFormValues = () => {
    // If editing or duplicating, use the transaction data
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setCategory(transaction.category);
      setPaymentMethod(transaction.paymentMethod);
      setTransactionDate(formatDateForInput(transaction.date));
      setUsingPreservedValues(false);
      return;
    }
    
    // For new transactions, try to use preserved values
    const preservedValues = getPreservedValues(type);
    if (preservedValues && !isEditing) {
      setAmount('');
      setDescription('');
      setCategory(preservedValues.category || '');
      setPaymentMethod(preservedValues.paymentMethod || '');
      setTransactionDate(preservedValues.date || formatDateForInput(new Date()));
      setUsingPreservedValues(true);
    } else {
      // Default values if no preserved values
      setAmount('');
      setDescription('');
      setCategory('');
      setPaymentMethod('');
      setTransactionDate(formatDateForInput(new Date()));
      setUsingPreservedValues(false);
    }
  };
  
  // Initialize form values when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeFormValues();
    }
  }, [isOpen, transaction, type]);
  
  // State declarations after initialization logic
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionDate, setTransactionDate] = useState(formatDateForInput(new Date()));

  // Categories are coming from CategoryContext
  
  // Payment methods are coming from PaymentMethodContext
  // Use the appropriate payment methods based on transaction type
  const paymentMethodOptions = type === 'expense' ? expensePaymentMethods : incomePaymentMethods;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || !description || !category || !paymentMethod) {
      return; // Form validation
    }
    
    const newTransaction = {
      // If editing, use existing ID; if duplicating (transaction exists but not editing) or new, create new ID
      id: isEditing ? transaction.id : Date.now(),
      amount: parseFloat(amount),
      description,
      category,
      paymentMethod,
      type: type, // 'expense' or 'income'
      date: new Date(transactionDate).toISOString()
    };
    
    // Save the last used values for new transactions (not for editing)
    if (!isEditing && !transaction) {
      try {
        const valuesToPreserve = {
          category,
          paymentMethod,
          date: transactionDate
        };
        localStorage.setItem(`${type}LastValues`, JSON.stringify(valuesToPreserve));
      } catch (error) {
        console.error('Error saving preserved values:', error);
      }
    }
    
    onSave(newTransaction);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setPaymentMethod('');
    setTransactionDate(formatDateForInput(new Date()));
    setUsingPreservedValues(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="transaction-modal-content">
        <div className="modal-header fixed-header">
          <div className="header-content">
            <h2>
              {isEditing 
                ? `Edit ${type === 'expense' ? 'Expense' : 'Income'}` 
                : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
            </h2>
            {/* Small message when using preserved values */}
            {usingPreservedValues && !isEditing && !transaction && (
              <div className="preserved-values-indicator">
                <i className="fas fa-info-circle"></i> Using some previous values to make it easier to add new transactions
              </div>
            )}
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="amount">Amount ({currency.code})</label>
              <div className="currency-input-container">
                <span className="currency-symbol">{currency.symbol}</span>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="currency-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                required
              />
            </div>
            
            <div className="form-group">
              <CustomDropdown
                id="category"
                label="Category"
                options={type === 'expense' ? 
                  expenseCategories.map(cat => cat.name) : 
                  incomeCategories.map(cat => cat.name)
                }
                items={type === 'expense' ? expenseCategories : incomeCategories}
                value={category}
                onChange={setCategory}
                placeholder="Select category"
                required={true}
              />
            </div>
            
            <div className="form-group">
              <CustomDropdown
                id="paymentMethod"
                label="Payment Method"
                options={paymentMethodOptions.map(method => method.name)}
                items={paymentMethodOptions}
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Select payment method"
                required={true}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="transactionDate">Date</label>
              <input
                id="transactionDate"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="fixed-footer">
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="save-btn">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
