import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useBudget } from '../context/BudgetContext';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';
import DownloadReportModal from './DownloadReportModal';

const Reports = ({ transactions, selectedMonthYear }) => {
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
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthName = new Date(now.getFullYear(), currentMonth).toLocaleString('default', { month: 'long' });
    const previousMonthName = new Date(now.getFullYear(), previousMonth).toLocaleString('default', { month: 'long' });
    
    const currentMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousMonthExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && date.getMonth() === previousMonth;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate daily averages
    const daysInCurrentMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();
    const daysInPreviousMonth = new Date(now.getFullYear(), previousMonth + 1, 0).getDate();
    
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
        
        if (month === currentMonth || month === previousMonth) {
          const key = `${month}-${day}`;
          if (!dailySpending[key]) dailySpending[key] = 0;
          dailySpending[key] += t.amount;
        }
      });
    
    const currentHighestDay = Object.entries(dailySpending)
      .filter(([key]) => key.startsWith(`${currentMonth}-`))
      .sort((a, b) => b[1] - a[1])[0];
    
    const previousHighestDay = Object.entries(dailySpending)
      .filter(([key]) => key.startsWith(`${previousMonth}-`))
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      current: {
        month: currentMonthName,
        total: currentMonthExpenses,
        daily: currentDailyAvg,
        highestDay: currentHighestDay ? currentHighestDay[0].split('-')[1] : 'N/A'
      },
      previous: {
        month: previousMonthName,
        total: previousMonthExpenses,
        daily: previousDailyAvg,
        highestDay: previousHighestDay ? previousHighestDay[0].split('-')[1] : 'N/A'
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
  const budgetPercentage = Math.min(100, (totalExpenses / effectiveBudget * 100)).toFixed(0);
  
  // Calculate percentage of income spent
  const incomeSpentPercentage = totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome * 100)).toFixed(0) : 0;
  
  // Get category colors
  const getCategoryColor = (index) => {
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#ef4444'];
    return colors[index % colors.length];
  };
  
  return (
    <div className="reports-container" style={{ paddingBottom: '5rem' }}>
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
          {budgetPercentage}% of {currency.symbol}{effectiveBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
          {isBudgetSet ? ' monthly budget' : ' estimated budget'}
          {!isBudgetSet && <span className="budget-note"> (set your own in Settings)</span>}
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
      <div className="report-card">
        <div className="report-card-title">Month over Month</div>
        <div className="month-comparison chart-container" id="month-comparison-chart">
          <div className="month-column">
            <div className="month-name">{monthlyData.previous.month}</div>
            <div className="month-amount">{currency.symbol}{monthlyData.previous.total.toFixed(0)}</div>
            <div className="month-details">
              <div>Daily: {currency.symbol}{monthlyData.previous.daily.toFixed(0)}</div>
              <div>Highest: {monthlyData.previous.highestDay}th</div>
            </div>
          </div>
          <div className="month-column">
            <div className="month-name">{monthlyData.current.month}</div>
            <div className="month-amount">{currency.symbol}{monthlyData.current.total.toFixed(0)}</div>
            <div className="month-details">
              <div>Daily: {currency.symbol}{monthlyData.current.daily.toFixed(0)}</div>
              <div>Highest: {monthlyData.current.highestDay}th</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Download Report Button */}
      <button className="download-report-btn" onClick={() => setShowDownloadModal(true)}>
        <i className="fas fa-download"></i> Download Report
      </button>
      
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
          transactions: transactions
        }}
        currency={currency}
      />
    </div>
  );
};

export default Reports;
