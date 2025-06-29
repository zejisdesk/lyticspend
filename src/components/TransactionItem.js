import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';

const TransactionItem = ({ transaction, onDelete, onEdit, onDuplicate }) => {
  const { currency } = useCurrency();
  const { expenseCategories, incomeCategories } = useCategories();
  const { expensePaymentMethods, incomePaymentMethods } = usePaymentMethods();
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);
  const itemRef = useRef(null);
  
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        showActions && 
        itemRef.current && 
        !itemRef.current.contains(event.target) && 
        actionsRef.current && 
        !actionsRef.current.contains(event.target)
      ) {
        setShowActions(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showActions]);
  // Get category icon from category contexts
  const getCategoryIcon = (categoryName) => {
    // Find the category in the appropriate list based on transaction type
    const categories = transaction.type === 'expense' ? expenseCategories : incomeCategories;
    const category = categories.find(cat => cat.name === categoryName);
    
    // If found, use the icon from the category, otherwise use a default
    if (category && category.icon) {
      return <i className={`fas ${category.icon}`}></i>;
    }
    
    // Default icon if category not found
    return <i className="fas fa-money-bill"></i>;
  };

  // Get payment method icon from payment method contexts
  const getPaymentIcon = (methodName) => {
    // Find the payment method in the appropriate list based on transaction type
    const paymentMethods = transaction.type === 'expense' ? expensePaymentMethods : incomePaymentMethods;
    const method = paymentMethods.find(m => m.name === methodName);
    
    // If found, use the icon from the payment method, otherwise use a default
    if (method && method.icon) {
      return <i className={`fas ${method.icon}`}></i>;
    }
    
    // Default icon if payment method not found
    return <i className="fas fa-money-check"></i>;
  };

  const handleClick = () => {
    setShowActions(!showActions);
  };

  return (
    <div className="transaction-item" onClick={handleClick} ref={itemRef}>
      <div className="transaction-icon-description">
        <div className="category-icon">{getCategoryIcon(transaction.category)}</div>
        <div className="transaction-details">
          <p className="transaction-category">{transaction.category}</p>
          <p className="transaction-description">{transaction.description}</p>
        </div>
      </div>
      <div className="transaction-amount-payment">
        <p className={`transaction-amount ${transaction.type === 'expense' ? 'expense' : 'income'}`}>
          {transaction.type === 'expense' ? '-' : ''}{currency.symbol}{Math.abs(transaction.amount).toFixed(2)}
        </p>
        <div className="payment-method">
          <span className="payment-text">{getPaymentIcon(transaction.paymentMethod)} {transaction.paymentMethod}</span>
        </div>
      </div>
      
      {showActions && (
        <div className="transaction-actions" ref={actionsRef}>
          <button className="edit-btn" onClick={(e) => {
            e.stopPropagation();
            onEdit(transaction);
          }}>
            <i className="fas fa-edit"></i> Edit
          </button>
          <button className="duplicate-btn" onClick={(e) => {
            e.stopPropagation();
            onDuplicate(transaction);
          }}>
            <i className="fas fa-copy"></i> Duplicate
          </button>
          <button className="delete-btn" onClick={(e) => {
            e.stopPropagation();
            onDelete(transaction.id);
          }}>
            <i className="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
