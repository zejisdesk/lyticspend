/**
 * Utility functions for transaction management
 */

/**
 * Add a new transaction to the existing transactions array
 * @param {Object} transaction - The transaction to add
 * @param {Array} transactions - Existing transactions array
 * @returns {Array} Updated transactions array
 */
export const addTransaction = (transaction, transactions) => {
  return [transaction, ...transactions];
};

/**
 * Delete a transaction by ID
 * @param {string|number} id - ID of the transaction to delete
 * @param {Array} transactions - Existing transactions array
 * @returns {Array} Updated transactions array
 */
export const deleteTransaction = (id, transactions) => {
  return transactions.filter(t => t.id !== id);
};

/**
 * Update an existing transaction
 * @param {Object} editedTransaction - The updated transaction object
 * @param {Array} transactions - Existing transactions array
 * @returns {Array} Updated transactions array
 */
export const updateTransaction = (editedTransaction, transactions) => {
  return transactions.map(t => 
    t.id === editedTransaction.id ? editedTransaction : t
  );
};

/**
 * Find a transaction by ID
 * @param {string|number} id - ID of the transaction to find
 * @param {Array} transactions - Transactions array to search in
 * @returns {Object|null} The found transaction or null
 */
export const findTransactionById = (id, transactions) => {
  return transactions.find(t => t.id === id) || null;
};

/**
 * Filter transactions based on type (expense, income, or all)
 * @param {Array} transactions - Transactions to filter
 * @param {string} type - Type to filter by ('expense', 'income', or null for all)
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByType = (transactions, type) => {
  if (!type || type === 'all') {
    return transactions;
  }
  return transactions.filter(transaction => transaction.type === type);
};

/**
 * Filter transactions by category
 * @param {Array} transactions - Transactions to filter
 * @param {string} category - Category to filter by (or 'all')
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByCategory = (transactions, category) => {
  if (!category || category === 'all') {
    return transactions;
  }
  return transactions.filter(transaction => transaction.category === category);
};

/**
 * Filter transactions by payment method
 * @param {Array} transactions - Transactions to filter
 * @param {string} paymentMethod - Payment method to filter by (or 'all')
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByPaymentMethod = (transactions, paymentMethod) => {
  if (!paymentMethod || paymentMethod === 'all') {
    return transactions;
  }
  return transactions.filter(transaction => transaction.paymentMethod === paymentMethod);
};

/**
 * Apply multiple filters to transactions
 * @param {Array} transactions - Transactions to filter
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} Filtered transactions
 */
export const applyFilters = (transactions, { type, category, paymentMethod }) => {
  let filtered = transactions;
  
  if (type) {
    filtered = filterTransactionsByType(filtered, type);
  }
  
  if (category) {
    filtered = filterTransactionsByCategory(filtered, category);
  }
  
  if (paymentMethod) {
    filtered = filterTransactionsByPaymentMethod(filtered, paymentMethod);
  }
  
  return filtered;
};
