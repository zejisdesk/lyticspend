import React from 'react';
import TransactionItem from './TransactionItem';
import { useCurrency } from '../context/CurrencyContext';

const TransactionGroup = ({ date, transactions, onDeleteTransaction, onEditTransaction, onDuplicateTransaction }) => {
  
  const { currency } = useCurrency();
  // Calculate total for the day
  const dailyTotal = transactions.reduce((sum, transaction) => {
    if (transaction.type === 'expense') {
      return sum - transaction.amount;
    } else {
      return sum + transaction.amount;
    }
  }, 0);

  // Format date to display as "Month Day, Year" with error handling
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', { 
        month: 'long',
        day: 'numeric', 
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown Date';
    }
  };

  return (
    <div className="transaction-group">
      <div className="transaction-date-header">
        <h3>{formatDate(date)}</h3>
        <p className="daily-total">
          Total: {currency.symbol}{Math.abs(dailyTotal).toFixed(2)}
        </p>
      </div>
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction}
            onDelete={onDeleteTransaction}
            onEdit={onEditTransaction}
            onDuplicate={onDuplicateTransaction}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionGroup;
