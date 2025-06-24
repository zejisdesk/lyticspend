import React, { useState, useEffect, useRef } from 'react';
import { useCurrency } from '../context/CurrencyContext';

const TransactionItem = ({ transaction, onDelete, onEdit }) => {
  const { currency } = useCurrency();
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
  // Icons for different categories
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'food':
        return <i className="fas fa-utensils"></i>;
      case 'transport':
        return <i className="fas fa-car"></i>;
      case 'entertainment':
        return <i className="fas fa-film"></i>;
      case 'shopping':
        return <i className="fas fa-shopping-bag"></i>;
      case 'utilities':
        return <i className="fas fa-home"></i>;
      default:
        return <i className="fas fa-money-bill"></i>;
    }
  };

  // Payment method icons
  const getPaymentIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return <i className="fas fa-credit-card"></i>;
      case 'cash':
        return <i className="fas fa-money-bill-wave"></i>;
      case 'digital wallet':
        return <i className="fas fa-wallet"></i>;
      case 'bank transfer':
        return <i className="fas fa-university"></i>;
      default:
        return <i className="fas fa-money-check"></i>;
    }
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
