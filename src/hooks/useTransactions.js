import { useState, useEffect } from 'react';
import { calculateFinancialSummary } from '../utils/financialUtils';

/**
 * Custom hook for managing transactions
 * 
 * @returns {Object} Transaction state and handler functions
 */
const useTransactions = () => {
  // State for transactions and financial summary
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load transactions from localStorage on hook initialization
  useEffect(() => {
    // Try to load from localStorage first
    const savedTransactions = localStorage.getItem('transactions');
    
    if (savedTransactions) {
      try {
        const parsedData = JSON.parse(savedTransactions);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setTransactions(parsedData);
          setIsLoaded(true);
          return;
        }
      } catch (error) {
        // If there's an error parsing, fall back to sample data
      }
    }
    
    // If no valid transactions in localStorage, load sample data
    loadSampleData();
    setIsLoaded(true);
  }, []);
  
  // Initialize with empty transactions array
  const loadSampleData = () => {
    const emptyTransactions = [];
    setTransactions(emptyTransactions);
    localStorage.setItem('transactions', JSON.stringify(emptyTransactions));
  };
  
  // Update localStorage and calculate financial summary whenever transactions change
  useEffect(() => {
    // Always calculate financial summary, even if transactions array is empty
    const { income: totalIncome, expenses: totalExpenses, balance: totalBalance } = calculateFinancialSummary(transactions);
    
    setIncome(totalIncome);
    setExpenses(totalExpenses);
    setBalance(totalBalance);
    
    // Only save to localStorage if we have transactions
    if (transactions && transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);
  
  // Add a new transaction
  const addTransaction = (transaction) => {
    setTransactions([transaction, ...transactions]);
  };
  
  // Delete a transaction by ID
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };
  
  // Update an existing transaction
  const updateTransaction = (editedTransaction) => {
    setTransactions(transactions.map(t => 
      t.id === editedTransaction.id ? editedTransaction : t
    ));
  };
  
  // Find a transaction by ID
  const findTransactionById = (id) => {
    return transactions.find(t => t.id === id) || null;
  };
  
  // Filter transactions by type (expense, income, or all)
  const filterTransactionsByType = (type) => {
    if (!type || type === 'all') {
      return transactions;
    }
    return transactions.filter(transaction => transaction.type === type);
  };
  
  return {
    transactions,
    income,
    expenses,
    balance,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    findTransactionById,
    filterTransactionsByType
  };
};

export default useTransactions;
