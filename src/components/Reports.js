import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useBudget } from '../context/BudgetContext';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';
import { parseMonthYear } from '../utils/financialUtils';
import DownloadReportModal from './DownloadReportModal';

const Reports = ({ transactions, selectedMonthYear }) => {
  // We need all transactions, not just the ones filtered by month
  // This is because we need to show data for both current and previous month
  
  // Debug logging
  console.log('Reports component - All transactions:', transactions);
  console.log('Reports component - Selected month-year:', selectedMonthYear);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const { currency } = useCurrency();
  const { monthlyBudget } = useBudget();
  const { expenseCategories, incomeCategories } = useCategories();
  const { expensePaymentMethods, incomePaymentMethods } = usePaymentMethods();
  // Calculate total expenses
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Calculate total income
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate category totals by amount
  const calculateCategoryData = () => {
    const categoryData = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = 0;
        }
        categoryData[transaction.category] += transaction.amount;
      }
    });
    
    return Object.entries(categoryData)
      .map(([categoryName, amount]) => {
        // Find the category object to get its icon
        const categoryObj = expenseCategories.find(cat => cat.name === categoryName) || 
                          { name: categoryName, icon: 'fa-circle' };
        
        return {
          category: categoryName,
          amount,
          icon: categoryObj.icon
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Limit to top 5 spending categories only
  };
  
  // Calculate frequent categories (by number of transactions)
  const calculateFrequentCategories = () => {
    const categoryFrequency = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        if (!categoryFrequency[transaction.category]) {
          categoryFrequency[transaction.category] = {
            count: 0,
            totalAmount: 0
          };
        }
        categoryFrequency[transaction.category].count += 1;
        categoryFrequency[transaction.category].totalAmount += transaction.amount;
      }
    });
    
    return Object.entries(categoryFrequency)
      .map(([categoryName, data]) => {
        // Find the category object to get its icon
        const categoryObj = expenseCategories.find(cat => cat.name === categoryName) || 
                          { name: categoryName, icon: 'fa-circle' };
        
        return {
          category: categoryName,
          count: data.count,
          amount: data.totalAmount,
          icon: categoryObj.icon
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Limit to top 5 frequent categories only
  };
  
  // Get month-over-month data
  const getMonthlyData = () => {
    // Parse the selectedMonthYear which is in format "June 2025"
    const currentDate = parseMonthYear(selectedMonthYear);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
    
    // Calculate previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = previousMonth === 11 && currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Get previous month name
    const previousDate = new Date(previousYear, previousMonth, 1);
    const previousMonthName = previousDate.toLocaleString('default', { month: 'long' });
    
    console.log('Current date from parseMonthYear:', currentDate);
    console.log('Selected month-year:', selectedMonthYear);
    console.log('Current month/year:', currentMonth, currentYear, currentMonthName);
    console.log('Previous month/year:', previousMonth, previousYear, previousMonthName);
    
    // Filter and calculate expenses for current month
    const currentMonthExpenseTransactions = [];
    const previousMonthExpenseTransactions = [];
    
    // Process each transaction
    transactions.forEach(transaction => {
      if (!transaction.date || transaction.type !== 'expense') return;
      
      // Parse the transaction date
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      
      // Check if transaction belongs to current month
      if (transactionMonth === currentMonth && transactionYear === currentYear) {
        currentMonthExpenseTransactions.push(transaction);
        console.log('Current month transaction:', transaction.description, transaction.amount, transaction.date);
      }
      
      // Check if transaction belongs to previous month
      if (transactionMonth === previousMonth && transactionYear === previousYear) {
        previousMonthExpenseTransactions.push(transaction);
        console.log('Previous month transaction:', transaction.description, transaction.amount, transaction.date);
      }
    });
    
    // Calculate total expenses for each month
    const currentMonthExpenses = currentMonthExpenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const previousMonthExpenses = previousMonthExpenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    console.log('Current month expense transactions:', currentMonthExpenseTransactions);
    console.log('Previous month expense transactions:', previousMonthExpenseTransactions);
    console.log('Total current month expenses:', currentMonthExpenses);
    console.log('Total previous month expenses:', previousMonthExpenses);
    
    // Calculate daily averages
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPreviousMonth = new Date(previousYear, previousMonth + 1, 0).getDate();
    
    const currentDailyAvg = currentMonthExpenses / daysInCurrentMonth;
    const previousDailyAvg = previousMonthExpenses / daysInPreviousMonth;
    
    // Find highest spending day
    const dailySpending = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Check if this transaction belongs to either the current or previous month
        const isCurrentMonth = month === currentMonth && year === currentYear;
        const isPreviousMonth = month === previousMonth && year === previousYear;
        
        if (isCurrentMonth || isPreviousMonth) {
          // Use year-month-day as key to avoid conflicts between different years
          const key = `${year}-${month}-${day}`;
          if (!dailySpending[key]) dailySpending[key] = 0;
          dailySpending[key] += t.amount;
        }
      });
    
    const currentHighestDay = Object.entries(dailySpending)
      .filter(([key]) => key.startsWith(`${currentYear}-${currentMonth}-`))
      .sort((a, b) => b[1] - a[1])[0];
    
    const previousHighestDay = Object.entries(dailySpending)
      .filter(([key]) => key.startsWith(`${previousYear}-${previousMonth}-`))
      .sort((a, b) => b[1] - a[1])[0];
    
    // Format the highest day data
    const currentHighestDayInfo = currentHighestDay ? {
      day: currentHighestDay[0].split('-')[2],
      amount: currentHighestDay[1]
    } : null;
    
    const previousHighestDayInfo = previousHighestDay ? {
      day: previousHighestDay[0].split('-')[2],
      amount: previousHighestDay[1]
    } : null;
    
    return {
      current: {
        month: currentMonthName,
        total: currentMonthExpenses,
        daily: currentDailyAvg,
        highestDay: currentHighestDayInfo ? currentHighestDayInfo.day : 'N/A',
        highestAmount: currentHighestDayInfo ? currentHighestDayInfo.amount : 0
      },
      previous: {
        month: previousMonthName,
        total: previousMonthExpenses,
        daily: previousDailyAvg,
        highestDay: previousHighestDayInfo ? previousHighestDayInfo.day : 'N/A',
        highestAmount: previousHighestDayInfo ? previousHighestDayInfo.amount : 0
      }
    };
  };
  
  const categoryData = calculateCategoryData();
  const frequentCategories = calculateFrequentCategories();
  const monthlyData = getMonthlyData();
  
  // Calculate percentage change from last month
  const percentChange = monthlyData.previous.total > 0 
    ? ((totalExpenses - monthlyData.previous.total) / monthlyData.previous.total * 100).toFixed(0)
    : 0;
  
  // Use the monthly budget from BudgetContext, or default to 75% of income if not set
  const effectiveBudget = monthlyBudget !== null ? monthlyBudget : Math.min(totalIncome * 0.75, 3800);
  const isBudgetSet = monthlyBudget !== null;
  // Fix NaN% issue by checking if effectiveBudget is zero
  const budgetPercentage = effectiveBudget > 0 ? Math.min(100, (totalExpenses / effectiveBudget * 100)).toFixed(0) : 0;
  
  // Calculate percentage of income spent
  const incomeSpentPercentage = totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome * 100)).toFixed(0) : 0;
  
  // Get category colors
  const getCategoryColor = (index) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'];
    return colors[index % colors.length];
  };
  
  // Month over Month comparison section
  const renderMonthOverMonth = () => {
    const monthlyData = getMonthlyData();
    
    // Debug logging for the rendered values
    console.log('Month over Month data:', monthlyData);
    
    // Ensure we're displaying the months in the correct order
    // Previous month on the left, current month on the right
    return (
      <div className="report-card">
        <div className="report-card-title">Month over Month</div>
        <div className="month-over-month-container">
          <div className="month-column">
            <div className="month-name">{monthlyData.previous.month}</div>
            <div className="month-total">{currency.symbol}{monthlyData.previous.total.toFixed(0)}</div>
            <div className="month-detail">Daily: {currency.symbol}{monthlyData.previous.daily.toFixed(0)}</div>
            <div className="month-detail">Highest: {monthlyData.previous.highestDay !== 'N/A' ? `${currency.symbol}${monthlyData.previous.highestAmount.toFixed(0)} on ${monthlyData.previous.highestDay}th` : 'N/A'}</div>
          </div>
          <div className="month-column">
            <div className="month-name">{monthlyData.current.month}</div>
            <div className="month-total">{currency.symbol}{monthlyData.current.total.toFixed(0)}</div>
            <div className="month-detail">Daily: {currency.symbol}{monthlyData.current.daily.toFixed(0)}</div>
            <div className="month-detail">Highest: {monthlyData.current.highestDay !== 'N/A' ? `${currency.symbol}${monthlyData.current.highestAmount.toFixed(0)} on ${monthlyData.current.highestDay}th` : 'N/A'}</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Debug function to clear localStorage and reload
  const clearAndReload = () => {
    localStorage.clear();
    window.location.reload();
  };
  
  // Debug function to add sample transactions
  const addSampleTransactions = () => {
    // Create sample transactions for June and July 2025
    const sampleTransactions = [
      // June 2025 transactions
      {
        id: 'june1',
        description: 'Groceries June',
        amount: 2500,
        date: '2025-06-15', // Format: YYYY-MM-DD
        category: 'Food',
        paymentMethod: 'Credit Card',
        type: 'expense'
      },
      {
        id: 'june2',
        description: 'Rent June',
        amount: 15000,
        date: '2025-06-05',
        category: 'Housing',
        paymentMethod: 'Bank Transfer',
        type: 'expense'
      },
      
      // July 2025 transactions
      {
        id: 'july1',
        description: 'Groceries July',
        amount: 3000,
        date: '2025-07-10',
        category: 'Food',
        paymentMethod: 'Credit Card',
        type: 'expense'
      },
      {
        id: 'july2',
        description: 'Rent July',
        amount: 15000,
        date: '2025-07-05',
        category: 'Housing',
        paymentMethod: 'Bank Transfer',
        type: 'expense'
      }
    ];
    
    // Get existing transactions
    const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Filter out any existing sample transactions with the same IDs
    const filteredExistingTransactions = existingTransactions.filter(t => 
      !['june1', 'june2', 'july1', 'july2'].includes(t.id)
    );
    
    // Add sample transactions
    const updatedTransactions = [...filteredExistingTransactions, ...sampleTransactions];
    
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    console.log('Sample transactions added:', sampleTransactions);
    console.log('All transactions after update:', updatedTransactions);
    
    // Reload the page
    window.location.reload();
  };
  
  return (
    <div className="reports-container" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          onClick={clearAndReload}
          style={{ padding: '5px 10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}
        >
          Debug: Reset Data
        </button>
        <button 
          onClick={addSampleTransactions}
          style={{ padding: '5px 10px', backgroundColor: '#e0f0e0', border: '1px solid #ccc' }}
        >
          Debug: Add Sample Transactions
        </button>
      </div>
      {/* Total Expenses Summary */}
      <div className="report-card">
        <div className="report-card-title">Total Expenses</div>
        <div className="report-card-amount">{currency.symbol}{totalExpenses.toFixed(2)}</div>
        <div className="report-card-change">
          <span className={percentChange > 0 ? "expense-change" : "income-change"}>
            {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange)}% {percentChange > 0 ? 'higher' : 'lower'} than last month
          </span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${budgetPercentage}%` }}></div>
        </div>
        <div className="progress-label">
          {effectiveBudget > 0 ? (
            <>
              {budgetPercentage}% of {currency.symbol}{effectiveBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
              {isBudgetSet ? ' monthly budget' : ' estimated budget'}
              {!isBudgetSet && <span className="budget-note"> (set your own in Settings)</span>}
            </>
          ) : (
            <>No budget set. <span className="budget-note">Set your budget in Settings</span></>
          )}
        </div>
      </div>
      
      {/* Income vs Expenses */}
      <div className="report-card">
        <div className="income-expense-comparison">
          <div className="comparison-item">
            <div className="comparison-label">Income</div>
            <div className="comparison-amount income-amount">{currency.symbol}{totalIncome.toFixed(2)}</div>
          </div>
          <div className="comparison-item">
            <div className="comparison-label">Expenses</div>
            <div className="comparison-amount expense-amount">{currency.symbol}{totalExpenses.toFixed(2)}</div>
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${incomeSpentPercentage}%` }}></div>
        </div>
        <div className="progress-label">{incomeSpentPercentage}% of income spent</div>
      </div>
      
      {/* Frequent Spending Categories */}
      <div className="report-card">
        <div className="report-card-title">Frequent Spending Categories</div>
        <div className="category-chart chart-container" id="frequent-categories-chart">
          {frequentCategories.map((item, index) => (
            <div key={index} className="category-item-container">
              <div className="category-item">
                <div className="category-icon-name">
                  <span className="category-icon" style={{ backgroundColor: getCategoryColor(index) }}>
                    <i className={`fas ${item.icon}`}></i>
                  </span>
                  <span className="category-name">{item.category}</span>
                </div>
                <div className="category-amount">{item.count} times</div>
              </div>
              <div className="category-bar-wrapper">
                <div className="category-bar-container">
                  <div 
                    className="category-bar" 
                    style={{ 
                      width: `${Math.min(100, (item.count / Math.max(...frequentCategories.map(c => c.count))) * 100)}%`,
                      backgroundColor: getCategoryColor(index)
                    }}
                  ></div>
                </div>
                <div className="category-percentage">
                  {Math.round((item.count / transactions.filter(t => t.type === 'expense').length) * 100)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Spending Categories */}
      <div className="report-card">
        <div className="report-card-title">Top Spending Categories</div>
        <div className="category-chart chart-container" id="spending-categories-chart">
          {categoryData.map((item, index) => (
            <div key={index} className="category-item-container">
              <div className="category-item">
                <div className="category-icon-name">
                  <span className="category-icon" style={{ backgroundColor: getCategoryColor(index) }}>
                    <i className={`fas ${item.icon}`}></i>
                  </span>
                  <span className="category-name">{item.category}</span>
                </div>
                <div className="category-amount">{currency.symbol}{item.amount.toFixed(0)}</div>
              </div>
              <div className="category-bar-wrapper">
                <div className="category-bar-container">
                  <div 
                    className="category-bar" 
                    style={{ 
                      width: `${Math.min(100, (item.amount / Math.max(...categoryData.map(c => c.amount))) * 100)}%`,
                      backgroundColor: getCategoryColor(index)
                    }}
                  ></div>
                </div>
                <div className="category-percentage">
                  {Math.round((item.amount / totalExpenses) * 100)}% of total spends
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Month over Month */}
      {renderMonthOverMonth()}
      
      {/* Download Report Button - Disabled when no transactions are available */}
      {transactions.length > 0 ? (
        <button className="download-report-btn" onClick={() => setShowDownloadModal(true)}>
          <i className="fas fa-download"></i> Download Report
        </button>
      ) : (
        <button className="download-report-btn disabled" disabled title="No transactions available for this month">
          <i className="fas fa-download"></i> Download Report
        </button>
      )}
      
      {/* Download Report Modal */}
      <DownloadReportModal 
        isOpen={showDownloadModal} 
        onClose={() => setShowDownloadModal(false)} 
        reportData={{
          totalExpenses,
          totalIncome,
          categoryData,
          frequentCategories,
          monthlyData,
          transactions: transactions,
          selectedMonthYear: selectedMonthYear // Add the selected month-year to the report data
        }}
        currency={currency}
      />
    </div>
  );
};

export default Reports;
