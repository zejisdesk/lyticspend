import React, { useState, useEffect } from 'react';
import './App.css';

// Components
import Header from './components/Header';
import ActionButtons from './components/ActionButtons';
import Filters from './components/Filters';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import Navigation from './components/Navigation';
import ConfirmationModal from './components/ConfirmationModal';
import Reports from './components/Reports';
import Settings from './components/Settings';
import InitialCurrencyModal from './components/InitialCurrencyModal';
import InstallPrompt from './components/InstallPrompt';

// Services
import { 
  startReminderScheduler, 
  stopReminderScheduler,
  registerServiceWorker,
  updateServiceWorkerReminders,
  initNotificationService
} from './services/notificationService';

// Context Providers
import { CurrencyProvider } from './context/CurrencyContext';
import { BudgetProvider } from './context/BudgetContext';
import { CategoryProvider, useCategories } from './context/CategoryContext';
import { PaymentMethodProvider, usePaymentMethods } from './context/PaymentMethodContext';
import { ThemeProvider } from './context/ThemeContext';

// Custom hooks
import useTransactions from './hooks/useTransactions';

// Utility functions
import { getCurrentMonthYear } from './utils/financialUtils';

// Main App component wrapper to use context hooks
const AppContent = () => {
  const { expenseCategories, incomeCategories } = useCategories();
  const { expensePaymentMethods, incomePaymentMethods } = usePaymentMethods();
  
  // Extract category and payment method names for filters
  const categoryNames = expenseCategories.map(cat => cat.name);
  const paymentMethodNames = expensePaymentMethods.map(method => method.name);

  // Use the transactions hook for transaction management
  const { 
    transactions, 
    income, 
    expenses, 
    balance, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction, 
    findTransactionById,
    filterTransactionsByType 
  } = useTransactions();
  
  // State for UI controls
  const [activeTab, setActiveTab] = useState('expenses');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  
  // Handle tab change with scroll reset
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset scroll position to top when changing tabs
    window.scrollTo(0, 0);
  };
  
  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  
  // Initial currency selection modal state
  const [showInitialCurrencyModal, setShowInitialCurrencyModal] = useState(false);
  
  // Get current month and year
  const currentMonth = getCurrentMonthYear();
  
  // Check if currency is set in localStorage and show initial modal if not
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (!savedCurrency) {
      setShowInitialCurrencyModal(true);
    }
  }, []);
  
  // Initialize notification system and Service Worker when app loads
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Check if notifications are enabled in localStorage
        const notificationsEnabled = localStorage.getItem('notifications') === 'true';
        
        // Register Service Worker regardless of notification state
        // This allows the Service Worker to be ready when notifications are enabled
        if ('serviceWorker' in navigator) {
          await registerServiceWorker();
        }
        
        // Initialize the notification service (sets up message listeners)
        initNotificationService();
        
        // Only start the scheduler if notifications are enabled and permission is granted
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          await startReminderScheduler();
          await updateServiceWorkerReminders();
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    initNotifications();
    
    // Clean up by stopping the scheduler when component unmounts
    return () => {
      stopReminderScheduler();
    };
  }, []);
  
  // Handle adding a new transaction
  const handleAddTransaction = (transaction) => {
    addTransaction(transaction);
  };
  
  // Handle deleting a transaction
  const handleDeleteTransaction = (id) => {
    // Find the transaction to delete for displaying details in confirmation
    const transaction = findTransactionById(id);
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  };
  
  // Confirm deletion of transaction
  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setShowDeleteConfirmation(false);
      setTransactionToDelete(null);
    }
  };
  
  // Handle editing a transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };
  
  // Handle saving edited transaction
  const handleSaveEditedTransaction = (editedTransaction) => {
    updateTransaction(editedTransaction);
    setEditingTransaction(null);
    setShowEditModal(false);
  };
  
  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false;
    
    if (activeTab === 'expenses') {
      return transaction.type === 'expense';
    } else if (activeTab === 'income') {
      return transaction.type === 'income';
    }
    return true; // For 'all' or other tabs, show all transactions
  });
  
  // Determine which main content to show based on active tab
  const renderMainContent = () => {
    
    switch (activeTab) {
      case 'expenses':
        return (
          <>
            {/* Action buttons for adding transactions */}
            <ActionButtons 
              onAddExpense={() => setShowExpenseModal(true)} 
              onAddIncome={() => setShowIncomeModal(true)} 
            />
            
            {/* Filters for categories and payment methods */}
            <Filters 
              categories={categoryNames}
              paymentMethods={paymentMethodNames}
              selectedCategory={categoryFilter}
              selectedPaymentMethod={paymentMethodFilter}
              onCategoryChange={setCategoryFilter}
              onPaymentMethodChange={setPaymentMethodFilter}
            />
            

            
            {/* Transaction list with bottom padding for floating button */}
            <div className="transactions-wrapper">
              <TransactionList 
                transactions={filteredTransactions} 
                categoryFilter={categoryFilter}
                paymentMethodFilter={paymentMethodFilter}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransaction}
                type="expense"
              />
            </div>
          </>
        );
      case 'income':
        return (
          <>
            {/* Floating Add Income button */}
            <button 
              className="floating-add-btn" 
              onClick={() => setShowIncomeModal(true)}
            >
              <i className="fas fa-plus"></i>
            </button>
            
            {/* Transaction list with bottom padding for floating button */}
            <div className="income-transactions-wrapper">
              <TransactionList 
                transactions={filteredTransactions} 
                categoryFilter="all"
                paymentMethodFilter="all"
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransaction}
                type="income"
              />
            </div>
          </>
        );
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };
  
  // Force a re-render when transactions change
  useEffect(() => {
    console.log('Transactions changed, forcing re-render');
  }, [transactions]);

  return (
    <div className="App">
      <div className="app-container">
        <Header 
          balance={balance} 
          income={income} 
          expenses={expenses}
          activeTab={activeTab}
        />
        <div className="main-content" style={{marginTop: '0', padding: '0 0.75rem'}}>
          {renderMainContent()}
        </div>
      </div>
      
      {/* Modals */}
      {showExpenseModal && (
        <AddTransactionModal 
          isOpen={showExpenseModal} 
          onClose={() => setShowExpenseModal(false)} 
          onSave={handleAddTransaction} 
          type="expense" 
        />
      )}
      
      {showIncomeModal && (
        <AddTransactionModal 
          isOpen={showIncomeModal} 
          onClose={() => setShowIncomeModal(false)} 
          onSave={handleAddTransaction} 
          type="income" 
        />
      )}
      
      {showEditModal && (
        <AddTransactionModal 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveEditedTransaction}
          type={editingTransaction.type}
          transaction={editingTransaction}
          isEditing={true}
        />
      )}
      
      {showDeleteConfirmation && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setTransactionToDelete(null);
          }}
          onConfirm={confirmDeleteTransaction}
          title="Confirm Deletion"
          message={transactionToDelete ? 
            `Are you sure you want to delete ${transactionToDelete.description} (${transactionToDelete.type === 'expense' ? '-' : ''}$${Math.abs(transactionToDelete.amount).toFixed(2)})?` : 
            'Are you sure you want to delete this transaction?'}
        />
      )}
      
      {/* Bottom navigation */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {/* Install Prompt */}
      <InstallPrompt />
      
      {/* Initial Currency Selection Modal */}
      <InitialCurrencyModal 
        isOpen={showInitialCurrencyModal}
        onClose={() => setShowInitialCurrencyModal(false)}
      />
    </div>
  );
}

// Wrapper component that provides context
function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <BudgetProvider>
          <CategoryProvider>
            <PaymentMethodProvider>
              <AppContent />
            </PaymentMethodProvider>
          </CategoryProvider>
        </BudgetProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
