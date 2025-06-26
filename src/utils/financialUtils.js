/**
 * Utility functions for financial calculations
 */

/**
 * Calculate total income from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total income amount
 */
export const calculateTotalIncome = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return 0;
  }
  
  return transactions
    .filter(t => t && t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
};

/**
 * Calculate total expenses from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Total expense amount
 */
export const calculateTotalExpenses = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) {
    return 0;
  }
  
  return transactions
    .filter(t => t && t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
};

/**
 * Calculate balance (income - expenses)
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Balance amount
 */
export const calculateBalance = (transactions) => {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
};

/**
 * Calculate financial summary (income, expenses, balance)
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Object containing income, expenses, and balance
 */
export const calculateFinancialSummary = (transactions) => {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  const balance = income - expenses;
  
  return {
    income,
    expenses,
    balance
  };
};

/**
 * Calculate percentage of income spent
 * @param {number} income - Total income
 * @param {number} expenses - Total expenses
 * @returns {number} Percentage of income spent (0-100)
 */
export const calculateIncomeSpentPercentage = (income, expenses) => {
  if (income <= 0) {
    return 0;
  }
  
  return Math.min(100, (expenses / income * 100));
};

/**
 * Calculate budget usage percentage
 * @param {number} expenses - Total expenses
 * @param {number} budget - Budget amount
 * @param {number} income - Total income (used as fallback if budget is null)
 * @returns {number} Percentage of budget used (0-100)
 */
export const calculateBudgetPercentage = (expenses, budget, income) => {
  // If budget is not set, use 75% of income as default budget (capped at 3800)
  const effectiveBudget = budget !== null ? budget : Math.min(income * 0.75, 3800);
  
  if (effectiveBudget <= 0) {
    return 0;
  }
  
  return Math.min(100, (expenses / effectiveBudget * 100));
};

/**
 * Get current month and year as formatted string
 * @returns {string} Formatted month and year (e.g., "June 2025")
 */
export const getCurrentMonthYear = () => {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Parse a month year string into a Date object
 * @param {string} monthYearStr - Month and year string (e.g., "June 2025")
 * @returns {Date} Date object set to the first day of the specified month and year
 */
export const parseMonthYear = (monthYearStr) => {
  const parts = monthYearStr.split(' ');
  if (parts.length !== 2) return new Date(); // Default to current date if invalid format
  
  const monthName = parts[0];
  const year = parseInt(parts[1], 10);
  
  // Map month names to month indices (0-11)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthIndex = months.findIndex(m => m === monthName);
  if (monthIndex === -1) return new Date(); // Default to current date if invalid month name
  
  return new Date(year, monthIndex, 1);
};

/**
 * Filter transactions by month and year
 * @param {Array} transactions - Array of transactions to filter
 * @param {string} monthYearStr - Month and year string (e.g., "June 2025")
 * @returns {Array} Filtered transactions for the specified month and year
 */
export const filterTransactionsByMonthYear = (transactions, monthYearStr) => {
  if (!transactions || !Array.isArray(transactions)) return [];
  if (!monthYearStr) return transactions;
  
  const targetDate = parseMonthYear(monthYearStr);
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();
  
  return transactions.filter(transaction => {
    if (!transaction || !transaction.date) return false;
    
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === targetMonth &&
      transactionDate.getFullYear() === targetYear
    );
  });
};
