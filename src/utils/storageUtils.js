/**
 * Utility functions for local storage operations
 */

/**
 * Save transactions to localStorage
 * @param {Array} transactions - Array of transaction objects to save
 */
export const saveTransactions = (transactions) => {
  try {
    if (!transactions || !Array.isArray(transactions)) {
      console.error('Invalid transactions data:', transactions);
      return false;
    }
    
    console.log('Saving transactions to localStorage:', transactions);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
    return false;
  }
};

/**
 * Load transactions from localStorage
 * @returns {Array} Array of transaction objects or null if not found
 */
export const loadTransactions = () => {
  try {
    console.log('Attempting to load transactions from localStorage');
    const savedTransactions = localStorage.getItem('transactions');
    console.log('Raw saved transactions:', savedTransactions);
    
    if (!savedTransactions) {
      console.log('No transactions found in localStorage');
      return null;
    }
    
    const parsedData = JSON.parse(savedTransactions);
    console.log('Parsed transactions:', parsedData);
    
    if (!Array.isArray(parsedData)) {
      console.warn('Stored transactions data is not an array');
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    return null;
  }
};

/**
 * Check if a currency has been selected
 * @returns {boolean} True if currency is set, false otherwise
 */
export const isCurrencySelected = () => {
  return !!localStorage.getItem('selectedCurrency');
};

/**
 * Get the selected currency from localStorage
 * @returns {Object|null} Selected currency object or null if not set
 */
export const getSelectedCurrency = () => {
  try {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    return savedCurrency ? JSON.parse(savedCurrency) : null;
  } catch (error) {
    console.error('Error getting selected currency from localStorage:', error);
    return null;
  }
};

/**
 * Save selected currency to localStorage
 * @param {Object} currency - Currency object to save
 */
export const saveSelectedCurrency = (currency) => {
  try {
    localStorage.setItem('selectedCurrency', JSON.stringify(currency));
    return true;
  } catch (error) {
    console.error('Error saving selected currency to localStorage:', error);
    return false;
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem('transactions');
    return true;
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
    return false;
  }
};
