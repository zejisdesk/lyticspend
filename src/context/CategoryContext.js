import React, { createContext, useState, useContext, useEffect } from 'react';

// Default categories with icons
const defaultExpenseCategories = [
  { id: 'food', name: 'Food', icon: 'fa-utensils' },
  { id: 'transport', name: 'Transport', icon: 'fa-car' },
  { id: 'entertainment', name: 'Entertainment', icon: 'fa-film' },
  { id: 'shopping', name: 'Shopping', icon: 'fa-shopping-cart' },
  { id: 'utilities', name: 'Utilities', icon: 'fa-bolt' },
  { id: 'housing', name: 'Housing', icon: 'fa-home' },
  { id: 'healthcare', name: 'Healthcare', icon: 'fa-medkit' },
  { id: 'education', name: 'Education', icon: 'fa-graduation-cap' },
  { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
];

const defaultIncomeCategories = [
  { id: 'salary', name: 'Salary', icon: 'fa-money-bill-wave' },
  { id: 'freelance', name: 'Freelance', icon: 'fa-laptop' },
  { id: 'gift', name: 'Gift', icon: 'fa-gift' },
  { id: 'refund', name: 'Refund', icon: 'fa-undo' },
  { id: 'investment', name: 'Investment', icon: 'fa-chart-line' },
  { id: 'sales-revenue', name: 'Sales Revenue', icon: 'fa-store' },
  { id: 'service-revenue', name: 'Service Revenue', icon: 'fa-concierge-bell' },
  { id: 'consulting', name: 'Consulting', icon: 'fa-briefcase' },
  { id: 'rental-income', name: 'Rental Income', icon: 'fa-building' },
  { id: 'interest-income', name: 'Interest Income', icon: 'fa-percentage' },
  { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
];

// Create a context
const CategoryContext = createContext();

// Create a provider component
export const CategoryProvider = ({ children }) => {
  // Initialize categories from localStorage or use defaults
  const [expenseCategories, setExpenseCategories] = useState(() => {
    const savedCategories = localStorage.getItem('expenseCategories');
    return savedCategories ? JSON.parse(savedCategories) : defaultExpenseCategories;
  });

  const [incomeCategories, setIncomeCategories] = useState(() => {
    const savedCategories = localStorage.getItem('incomeCategories');
    return savedCategories ? JSON.parse(savedCategories) : defaultIncomeCategories;
  });

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('incomeCategories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  // Function to add a new category
  const addCategory = (type, category) => {
    if (!category.id) {
      // Generate an ID based on the name
      category.id = category.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    if (type === 'expense') {
      setExpenseCategories(prev => [...prev, category]);
    } else {
      setIncomeCategories(prev => [...prev, category]);
    }
  };

  // Function to update a category
  const updateCategory = (type, id, updatedCategory) => {
    if (type === 'expense') {
      setExpenseCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...updatedCategory } : cat)
      );
    } else {
      setIncomeCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...updatedCategory } : cat)
      );
    }
  };

  // Function to remove a category
  const removeCategory = (type, id) => {
    if (type === 'expense') {
      setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
    } else {
      setIncomeCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  // Function to reset categories to defaults
  const resetCategories = (type) => {
    if (type === 'expense') {
      setExpenseCategories(defaultExpenseCategories);
    } else {
      setIncomeCategories(defaultIncomeCategories);
    }
  };

  return (
    <CategoryContext.Provider value={{ 
      expenseCategories, 
      incomeCategories, 
      addCategory, 
      updateCategory, 
      removeCategory,
      resetCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook to use the category context
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
