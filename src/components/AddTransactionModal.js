import React, { useState } from 'react';
import CustomDropdown from './CustomDropdown';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';

const AddTransactionModal = ({ isOpen, onClose, onSave, type, transaction = null, isEditing = false }) => {
  const { currency } = useCurrency();
  const { expenseCategories, incomeCategories } = useCategories();
  const { expensePaymentMethods, incomePaymentMethods } = usePaymentMethods();
  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [category, setCategory] = useState(transaction ? transaction.category : '');
  const [paymentMethod, setPaymentMethod] = useState(transaction ? transaction.paymentMethod : '');
  
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  const [transactionDate, setTransactionDate] = useState(
    transaction ? formatDateForInput(transaction.date) : formatDateForInput(new Date())
  );

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
      id: isEditing ? transaction.id : Date.now(),
      amount: parseFloat(amount),
      description,
      category,
      paymentMethod,
      type: type, // 'expense' or 'income'
      date: new Date(transactionDate).toISOString()
    };
    
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
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="transaction-modal-content">
        <div className="modal-header fixed-header">
          <h2>
            {isEditing 
              ? `Edit ${type === 'expense' ? 'Expense' : 'Income'}` 
              : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
          </h2>
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
