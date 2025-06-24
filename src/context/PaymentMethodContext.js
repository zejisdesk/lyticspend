import React, { createContext, useState, useContext, useEffect } from 'react';

// Default payment methods with icons
const defaultExpensePaymentMethods = [
  { id: 'credit-card', name: 'Credit Card', icon: 'fa-credit-card' },
  { id: 'debit-card', name: 'Debit Card', icon: 'fa-credit-card' },
  { id: 'cash', name: 'Cash', icon: 'fa-money-bill-wave' },
  { id: 'bank-transfer', name: 'Bank Transfer', icon: 'fa-university' },
  { id: 'mobile-payment', name: 'Mobile Payment', icon: 'fa-mobile-alt' },
  { id: 'digital-wallet', name: 'Digital Wallet', icon: 'fa-wallet' },
  { id: 'check', name: 'Check', icon: 'fa-money-check' },
  { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
];

const defaultIncomePaymentMethods = [
  { id: 'direct-deposit', name: 'Direct Deposit', icon: 'fa-university' },
  { id: 'check', name: 'Check', icon: 'fa-money-check' },
  { id: 'cash', name: 'Cash', icon: 'fa-money-bill-wave' },
  { id: 'bank-transfer', name: 'Bank Transfer', icon: 'fa-exchange-alt' },
  { id: 'paypal', name: 'PayPal', icon: 'fa-paypal' },
  { id: 'venmo', name: 'Venmo', icon: 'fa-money-bill-wave' },
  { id: 'zelle', name: 'Zelle', icon: 'fa-bolt' },
  { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
];

// Create a context
const PaymentMethodContext = createContext();

// Create a provider component
export const PaymentMethodProvider = ({ children }) => {
  // Initialize payment methods from localStorage or use defaults
  const [expensePaymentMethods, setExpensePaymentMethods] = useState(() => {
    const savedPaymentMethods = localStorage.getItem('expensePaymentMethods');
    return savedPaymentMethods ? JSON.parse(savedPaymentMethods) : defaultExpensePaymentMethods;
  });

  const [incomePaymentMethods, setIncomePaymentMethods] = useState(() => {
    const savedPaymentMethods = localStorage.getItem('incomePaymentMethods');
    return savedPaymentMethods ? JSON.parse(savedPaymentMethods) : defaultIncomePaymentMethods;
  });

  // Save payment methods to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expensePaymentMethods', JSON.stringify(expensePaymentMethods));
  }, [expensePaymentMethods]);

  useEffect(() => {
    localStorage.setItem('incomePaymentMethods', JSON.stringify(incomePaymentMethods));
  }, [incomePaymentMethods]);

  // Function to add a new payment method
  const addPaymentMethod = (type, paymentMethod) => {
    if (!paymentMethod.id) {
      // Generate an ID based on the name
      paymentMethod.id = paymentMethod.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    if (type === 'expense') {
      setExpensePaymentMethods(prev => [...prev, paymentMethod]);
    } else {
      setIncomePaymentMethods(prev => [...prev, paymentMethod]);
    }
  };

  // Function to update a payment method
  const updatePaymentMethod = (type, id, updatedPaymentMethod) => {
    if (type === 'expense') {
      setExpensePaymentMethods(prev => 
        prev.map(method => method.id === id ? { ...method, ...updatedPaymentMethod } : method)
      );
    } else {
      setIncomePaymentMethods(prev => 
        prev.map(method => method.id === id ? { ...method, ...updatedPaymentMethod } : method)
      );
    }
  };

  // Function to remove a payment method
  const removePaymentMethod = (type, id) => {
    if (type === 'expense') {
      setExpensePaymentMethods(prev => prev.filter(method => method.id !== id));
    } else {
      setIncomePaymentMethods(prev => prev.filter(method => method.id !== id));
    }
  };

  // Function to reset payment methods to defaults
  const resetPaymentMethods = (type) => {
    if (type === 'expense') {
      setExpensePaymentMethods(defaultExpensePaymentMethods);
    } else {
      setIncomePaymentMethods(defaultIncomePaymentMethods);
    }
  };

  return (
    <PaymentMethodContext.Provider value={{ 
      expensePaymentMethods, 
      incomePaymentMethods, 
      addPaymentMethod, 
      updatePaymentMethod, 
      removePaymentMethod,
      resetPaymentMethods
    }}>
      {children}
    </PaymentMethodContext.Provider>
  );
};

// Custom hook to use the payment method context
export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodContext);
  if (!context) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodProvider');
  }
  return context;
};
