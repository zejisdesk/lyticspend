import React, { useState, useEffect, useCallback } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useBudget } from '../context/BudgetContext';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';
import CategoryManagementModal from './CategoryManagementModal';
import PaymentMethodManagementModal from './PaymentMethodManagementModal';
import IconDropdown from './IconDropdown';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExpenseCategoryModal, setShowExpenseCategoryModal] = useState(false);
  const [showIncomeCategoryModal, setShowIncomeCategoryModal] = useState(false);
  const [showExpensePaymentMethodModal, setShowExpensePaymentMethodModal] = useState(false);
  const [showIncomePaymentMethodModal, setShowIncomePaymentMethodModal] = useState(false);
  const [categoryType, setCategoryType] = useState('expense'); // 'expense' or 'income'
  const [methodType, setMethodType] = useState('expense'); // 'expense' or 'income'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [paymentMethodSearchQuery, setPaymentMethodSearchQuery] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('fa-tag');
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');
  const [newPaymentMethodIcon, setNewPaymentMethodIcon] = useState('fa-credit-card');
  const { currency, updateCurrency, currencies } = useCurrency();
  const { monthlyBudget, updateMonthlyBudget } = useBudget();
  const { expenseCategories, incomeCategories, addCategory, updateCategory, removeCategory, resetCategories } = useCategories();
  const { expensePaymentMethods, incomePaymentMethods, addPaymentMethod, updatePaymentMethod, removePaymentMethod, resetPaymentMethods } = usePaymentMethods();
  
  // Handler for selecting a currency
  const handleCurrencySelect = (currencyCode) => {
    updateCurrency(currencyCode);
    setShowCurrencyModal(false);
  };
  
  // Handler for updating budget
  const handleUpdateBudget = () => {
    if (budgetInput.trim() === '') return;
    
    const budgetValue = parseFloat(budgetInput);
    if (isNaN(budgetValue) || budgetValue < 0) return;
    
    updateMonthlyBudget(budgetValue);
    setShowBudgetModal(false);
  };
  
  // Handle adding a category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon
    };
    
    addCategory(categoryType, newCategory);
    setNewCategoryName('');
    setNewCategoryIcon('fa-tag');
  };
  
  // Handle updating a category
  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    
    const updatedCategory = {
      ...editingCategory,
      name: newCategoryName.trim(),
      icon: newCategoryIcon
    };
    
    updateCategory(categoryType, editingCategory.id, updatedCategory);
    setNewCategoryName('');
    setNewCategoryIcon('fa-tag');
    setEditingCategory(null);
  };
  
  // Handle removing a category
  const handleRemoveCategory = (categoryId) => {
    removeCategory(categoryType, categoryId);
  };
  
  // Handle editing a category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
  };
  
  // Handle canceling category edit
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('fa-tag');
  };
  
  // Initialize filteredCurrencies when component mounts, sorted alphabetically by currency name
  useEffect(() => {
    const sortedCurrencies = Object.keys(currencies).sort((a, b) => 
      currencies[a].name.localeCompare(currencies[b].name)
    );
    setFilteredCurrencies(sortedCurrencies);
  }, [currencies]);
  
  // Filter currencies based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      const sortedCurrencies = Object.keys(currencies).sort((a, b) => 
        currencies[a].name.localeCompare(currencies[b].name)
      );
      setFilteredCurrencies(sortedCurrencies);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = Object.keys(currencies).filter(code => {
        const currencyData = currencies[code];
        return (
          code.toLowerCase().includes(query) ||
          currencyData.name.toLowerCase().includes(query) ||
          currencyData.symbol.toLowerCase().includes(query)
        );
      });
      // Sort the filtered results alphabetically by name
      filtered.sort((a, b) => currencies[a].name.localeCompare(currencies[b].name));
      setFilteredCurrencies(filtered);
    }
  }, [searchQuery, currencies]);

  return (
    <div className="settings-container">
      {/* Appearance Section */}
      <div className="settings-section-header">APPEARANCE</div>
      
      <div className="settings-section">
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-moon" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Dark Mode</div>
          </div>
          <div className="settings-item-right">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      {/* General Section */}
      <div className="settings-section-header">GENERAL</div>
      
      <div className="settings-section">
        <div className="settings-item" onClick={() => setShowCurrencyModal(true)}>
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-money-bill-wave" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Currency</div>
          </div>
          <div className="settings-item-right settings-value-with-arrow">
            <div className="settings-value">{currency.code}</div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div className="settings-item" onClick={() => setShowBudgetModal(true)}>
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-wallet" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Monthly Budget</div>
          </div>
          <div className="settings-item-right settings-value-with-arrow">
            <div className="settings-value">
              {currency.symbol}{monthlyBudget !== null ? monthlyBudget.toFixed(2) : '0.00'}
            </div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
      
      {/* Notifications Section */}
      <div className="settings-section-header">NOTIFICATIONS</div>
      
      <div className="settings-section">
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-bell" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Enable Notifications</div>
          </div>
          <div className="settings-item-right">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-clock" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Reminder 1</div>
          </div>
          <div className="settings-item-right settings-value-with-arrow">
            <div className="settings-value">9:00 AM</div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-clock" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Reminder 2</div>
          </div>
          <div className="settings-item-right settings-value-with-arrow">
            <div className="settings-value">9:00 AM</div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div className="settings-item">
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-clock" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Reminder 3</div>
          </div>
          <div className="settings-item-right settings-value-with-arrow">
            <div className="settings-value">9:00 AM</div>
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
      
      {/* Expense Section */}
      <div className="settings-section-header">EXPENSE</div>
      
      <div className="settings-section">
        <div className="settings-item" onClick={() => {
          setCategoryType('expense');
          setShowExpenseCategoryModal(true);
        }}>
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-tags" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Manage Categories</div>
          </div>
          <div className="settings-item-right">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div className="settings-item" onClick={() => {
          setMethodType('expense');
          setShowExpensePaymentMethodModal(true);
        }}>
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-credit-card" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Manage Payment Methods</div>
          </div>
          <div className="settings-item-right">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>

      {/* Income Section */}
      <div className="settings-section-header">INCOME</div>
      
      <div className="settings-section">
        <div className="settings-item" onClick={() => {
          setCategoryType('income');
          setShowIncomeCategoryModal(true);
        }}>
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-tags" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Manage Categories</div>
          </div>
          <div className="settings-item-right">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
        
        <div className="settings-item" onClick={() => {
          setMethodType('income');
          setShowIncomePaymentMethodModal(true);
        }}>
          <div className="settings-item-left">
            <div className="settings-icon">
              <i className="fas fa-credit-card" style={{ color: '#0D6EFD' }}></i>
            </div>
            <div className="settings-label">Manage Payment Methods</div>
          </div>
          <div className="settings-item-right">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
      
      {/* App Info */}
      <div className="app-info">
        <div className="app-name">LyticSpend v1.0.0</div>
        <div className="app-description">A simple expense tracker to manage your finances</div>
      </div>
      
      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div className="modal-overlay">
          <div className="modal-content currency-modal">
            <div className="modal-header">
              <h3>Select Currency</h3>
              <button className="close-button" onClick={() => {
                setShowCurrencyModal(false);
                setSearchQuery('');
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="currency-search-container">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="currency-search-input"
                  placeholder="Search currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="clear-search-button"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="currency-list">
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map((code) => (
                    <div 
                      key={code} 
                      className={`currency-item ${currency.code === code ? 'selected' : ''}`}
                      onClick={() => handleCurrencySelect(code)}
                    >
                      <div className="currency-symbol">{currencies[code].symbol}</div>
                      <div className="currency-info">
                        <div className="currency-name">{currencies[code].name}</div>
                        <div className="currency-code">{code}</div>
                      </div>
                      {currency.code === code && (
                        <div className="currency-selected">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-results">No currencies found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Monthly Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal-content budget-modal">
            <div className="modal-header">
              <h3>Set Monthly Budget</h3>
              <button className="close-button" onClick={() => setShowBudgetModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="budget-input-container">
                <div className="budget-currency-symbol">{currency.symbol}</div>
                <input
                  type="number"
                  className="budget-input"
                  placeholder="Enter budget amount"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  autoFocus
                />
              </div>
              <button 
                className="save-budget-button"
                onClick={handleUpdateBudget}
                disabled={!budgetInput.trim() || isNaN(parseFloat(budgetInput)) || parseFloat(budgetInput) < 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Category Management Modals */}
      <CategoryManagementModal
        isOpen={showExpenseCategoryModal}
        onClose={() => setShowExpenseCategoryModal(false)}
        title="Manage Expense Categories"
        categories={expenseCategories}
        categoryType="expense"
        searchQuery={categorySearchQuery}
        setSearchQuery={setCategorySearchQuery}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryIcon={newCategoryIcon}
        setNewCategoryIcon={setNewCategoryIcon}
        addCategory={addCategory}
        updateCategory={updateCategory}
        removeCategory={removeCategory}
        resetCategories={resetCategories}
      />
      
      <CategoryManagementModal
        isOpen={showIncomeCategoryModal}
        onClose={() => setShowIncomeCategoryModal(false)}
        title="Manage Income Categories"
        categories={incomeCategories}
        categoryType="income"
        searchQuery={categorySearchQuery}
        setSearchQuery={setCategorySearchQuery}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryIcon={newCategoryIcon}
        setNewCategoryIcon={setNewCategoryIcon}
        addCategory={addCategory}
        updateCategory={updateCategory}
        removeCategory={removeCategory}
        resetCategories={resetCategories}
      />

      {/* Payment Method Management Modals */}
      <PaymentMethodManagementModal
        isOpen={showExpensePaymentMethodModal}
        onClose={() => setShowExpensePaymentMethodModal(false)}
        title="Manage Expense Payment Methods"
        paymentMethods={expensePaymentMethods}
        methodType="expense"
        searchQuery={paymentMethodSearchQuery}
        setSearchQuery={setPaymentMethodSearchQuery}
        editingPaymentMethod={editingPaymentMethod}
        setEditingPaymentMethod={setEditingPaymentMethod}
        newPaymentMethodName={newPaymentMethodName}
        setNewPaymentMethodName={setNewPaymentMethodName}
        newPaymentMethodIcon={newPaymentMethodIcon}
        setNewPaymentMethodIcon={setNewPaymentMethodIcon}
        addPaymentMethod={addPaymentMethod}
        updatePaymentMethod={updatePaymentMethod}
        removePaymentMethod={removePaymentMethod}
        resetPaymentMethods={resetPaymentMethods}
      />
      
      <PaymentMethodManagementModal
        isOpen={showIncomePaymentMethodModal}
        onClose={() => setShowIncomePaymentMethodModal(false)}
        title="Manage Income Payment Methods"
        paymentMethods={incomePaymentMethods}
        methodType="income"
        searchQuery={paymentMethodSearchQuery}
        setSearchQuery={setPaymentMethodSearchQuery}
        editingPaymentMethod={editingPaymentMethod}
        setEditingPaymentMethod={setEditingPaymentMethod}
        newPaymentMethodName={newPaymentMethodName}
        setNewPaymentMethodName={setNewPaymentMethodName}
        newPaymentMethodIcon={newPaymentMethodIcon}
        setNewPaymentMethodIcon={setNewPaymentMethodIcon}
        addPaymentMethod={addPaymentMethod}
        updatePaymentMethod={updatePaymentMethod}
        removePaymentMethod={removePaymentMethod}
        resetPaymentMethods={resetPaymentMethods}
      />
    </div>
  );
};

export default Settings;
