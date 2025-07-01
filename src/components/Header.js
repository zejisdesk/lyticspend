import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import MonthYearPicker from './MonthYearPicker';
import { filterTransactionsByMonthYear, calculateTotalIncome, calculateTotalExpenses, calculateBalance } from '../utils/financialUtils';

const Header = ({ income, expenses, balance, activeTab, transactions, selectedMonthYear, onMonthYearChange }) => {
  const { currency } = useCurrency();
  
  // Filter transactions for the selected month-year
  const monthFilteredTransactions = filterTransactionsByMonthYear(transactions, selectedMonthYear);
  
  // Calculate filtered summary values
  const filteredIncome = calculateTotalIncome(monthFilteredTransactions);
  const filteredExpenses = calculateTotalExpenses(monthFilteredTransactions);
  const filteredBalance = calculateBalance(monthFilteredTransactions);
  
  // Only render the summary card for the expenses tab and when there are transactions for the selected month
  const hasTransactionsForSelectedMonth = monthFilteredTransactions.length > 0;
  const shouldShowSummary = activeTab === 'expenses';
  
  return (
    <div className="header">
      <div className="header-title">
        <div className="app-title">
          <img src={process.env.PUBLIC_URL + '/app_logo.svg'} alt="Lytic Spend Logo" className="app-logo" />
          <h1>Lyticspend</h1>
        </div>
        {activeTab !== 'settings' && (
          <MonthYearPicker 
            selectedMonthYear={selectedMonthYear}
            onMonthYearChange={onMonthYearChange}
          />
        )}
      </div>
      
      {shouldShowSummary && hasTransactionsForSelectedMonth ? (
        <div className="summary-card">
          <div className="summary-section">
            <div className="summary-row">
              <p className="summary-label">Income:</p>
              <p className="summary-amount" style={{ color: '#4CAF50' }}>{currency.symbol}{filteredIncome.toFixed(2)}</p>
            </div>
          </div>
          <div className="summary-section">
            <div className="summary-row">
              <p className="summary-label">Expenses:</p>
              <p className="summary-amount" style={{ color: '#F44336' }}>-{currency.symbol}{Math.abs(filteredExpenses).toFixed(2)}</p>
            </div>
          </div>
          <div className="summary-section">
            <div className="summary-row">
              <p className="summary-label">Balance:</p>
              <p className="summary-amount" style={{ color: filteredBalance < 0 ? '#F44336' : '#4CAF50' }}>{currency.symbol}{filteredBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ) : shouldShowSummary ? (
        <div className="summary-card no-transactions-summary">
          <div className="empty-month-message">
            <p>No transactions for {selectedMonthYear}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Header;
