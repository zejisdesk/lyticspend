import React from 'react';
import TransactionGroup from './TransactionGroup';

const TransactionList = ({ transactions, categoryFilter, paymentMethodFilter, onDeleteTransaction, onEditTransaction, onDuplicateTransaction, type = 'expense' }) => {
  // Safety check - if transactions is undefined or null, use empty array
  const transactionsArray = Array.isArray(transactions) ? transactions : [];
  
  // Filter transactions based on selected filters
  const filteredTransactions = transactionsArray.filter(transaction => {
    // Skip invalid transactions
    if (!transaction || !transaction.category || !transaction.paymentMethod) {
      console.warn('Invalid transaction found:', transaction);
      return false;
    }
    
    const categoryMatch = categoryFilter === 'all' || transaction.category.toLowerCase() === categoryFilter;
    const paymentMatch = paymentMethodFilter === 'all' || transaction.paymentMethod.toLowerCase() === paymentMethodFilter;
    return categoryMatch && paymentMatch;
  });

  // Group transactions by date with error handling
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    // Make sure transaction and date exist
    if (!transaction || !transaction.date) {
      return groups;
    }
    
    // Handle different date formats
    let date;
    try {
      // First try to extract just the date part if it's a string with a T separator
      if (typeof transaction.date === 'string' && transaction.date.includes('T')) {
        date = transaction.date.split('T')[0];
      } else {
        // Otherwise try to convert to a date object and then to ISO string
        const dateObj = new Date(transaction.date);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date');
        }
        date = dateObj.toISOString().split('T')[0];
      }
    } catch (error) {
      date = 'Unknown Date';
    }
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="transaction-list-container" style={{ padding: '0 0.5rem' }}>
      {sortedDates.length > 0 ? (
        sortedDates.map(date => (
          <TransactionGroup 
            key={date} 
            date={date} 
            transactions={groupedTransactions[date]}
            onDeleteTransaction={onDeleteTransaction}
            onEditTransaction={onEditTransaction}
            onDuplicateTransaction={onDuplicateTransaction}
          />
        ))
      ) : (
        <div className="no-transactions-container">
          <div className="no-transactions">
            <i className="fas fa-receipt empty-state-icon"></i>
            <h3>No transactions yet</h3>
            <p>{type === 'income' ? 'Add your first income' : 'Add your first expense'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
