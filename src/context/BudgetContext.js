import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context
const BudgetContext = createContext();

// Create a provider component
export const BudgetProvider = ({ children }) => {
  // Initialize budget from localStorage or default to null
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedBudget = localStorage.getItem('monthlyBudget');
    return savedBudget ? parseFloat(savedBudget) : null;
  });

  // Function to update the budget
  const updateMonthlyBudget = (amount) => {
    const budgetAmount = parseFloat(amount);
    if (!isNaN(budgetAmount) && budgetAmount >= 0) {
      setMonthlyBudget(budgetAmount);
      // Save to localStorage
      localStorage.setItem('monthlyBudget', budgetAmount.toString());
    }
  };

  return (
    <BudgetContext.Provider value={{ monthlyBudget, updateMonthlyBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

// Custom hook to use the budget context
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
