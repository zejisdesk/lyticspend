import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import MultiSelectDropdown from './MultiSelectDropdown';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analysis = ({ transactions, selectedCategory = null, selectedPaymentMethod = null }) => {
  const { currency } = useCurrency();
  const { expenseCategories: categories } = useCategories();
  const { expensePaymentMethods } = usePaymentMethods();
  
  // Initialize with props if provided (for backward compatibility)
  const [selectedCategories, setSelectedCategories] = useState(selectedCategory ? [selectedCategory] : []);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState(selectedPaymentMethod ? [selectedPaymentMethod] : []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState({ labels: [], data: [], backgroundColor: [] });
  const [dailySpendingData, setDailySpendingData] = useState({ labels: [], data: [] });
  const [totalSpent, setTotalSpent] = useState(0);
  const [mostSpentCategory, setMostSpentCategory] = useState({ name: '', amount: 0 });

  // Colors for the chart
  const chartColors = [
    '#FF6384', // Red
    '#36A2EB', // Blue
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#FFCD56', // Yellow
    '#C9CBCF', // Grey
    '#7ED321', // Green
    '#50E3C2', // Mint
    '#D0021B'  // Dark Red
  ];

  // Filter transactions based on selected filters
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setFilteredTransactions([]);
      return;
    }
    
    let filtered = [...transactions];
    
    // Filter expenses only
    filtered = filtered.filter(t => t.type === 'expense');
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category));
    }
    
    // Apply payment method filter
    if (selectedPaymentMethods.length > 0) {
      filtered = filtered.filter(t => selectedPaymentMethods.includes(t.paymentMethod));
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, selectedCategories, selectedPaymentMethods, searchTerm]);

  // Calculate category spending data
  useEffect(() => {
    if (filteredTransactions.length === 0) {
      setCategoryData({ labels: [], data: [], backgroundColor: [] });
      setTotalSpent(0);
      setMostSpentCategory({ name: '', amount: 0 });
      return;
    }

    // Calculate total spent
    const total = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    setTotalSpent(total);

    // Group by category and sum amounts
    const categorySpending = {};
    filteredTransactions.forEach(t => {
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = 0;
      }
      categorySpending[t.category] += parseFloat(t.amount);
    });

    // Find most spent category
    let maxAmount = 0;
    let maxCategory = '';
    Object.entries(categorySpending).forEach(([category, amount]) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCategory = category;
      }
    });
    setMostSpentCategory({ name: maxCategory, amount: maxAmount });

    // Prepare data for chart
    const labels = Object.keys(categorySpending);
    const data = Object.values(categorySpending);
    const backgroundColors = labels.map((_, index) => chartColors[index % chartColors.length]);

    setCategoryData({
      labels,
      data,
      backgroundColor: backgroundColors
    });
  }, [filteredTransactions, chartColors]);

  // Update selected values when props change (for backward compatibility)
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      setSelectedCategories([selectedCategory]);
    }
    if (selectedPaymentMethod && selectedPaymentMethod !== 'all') {
      setSelectedPaymentMethods([selectedPaymentMethod]);
    }
  }, [selectedCategory, selectedPaymentMethod]);

  // Calculate daily spending data
  useEffect(() => {
    if (filteredTransactions.length === 0) {
      setDailySpendingData({ labels: [], data: [] });
      return;
    }

    // Group by date and sum amounts
    const dailySpending = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date).getDate();
      if (!dailySpending[date]) {
        dailySpending[date] = 0;
      }
      dailySpending[date] += parseFloat(t.amount);
    });

    // Sort dates and prepare data for chart
    const sortedDates = Object.keys(dailySpending).sort((a, b) => parseInt(a) - parseInt(b));
    const labels = sortedDates;
    const data = sortedDates.map(date => dailySpending[date]);

    setDailySpendingData({
      labels,
      data
    });
  }, [filteredTransactions]);

  // Format currency
  const formatCurrency = (amount) => {
    return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
  };

  // Doughnut chart config
  const doughnutData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
        backgroundColor: categoryData.backgroundColor,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  // Bar chart config
  const barData = {
    labels: dailySpendingData.labels,
    datasets: [
      {
        data: dailySpendingData.data,
        backgroundColor: '#4169E1', // Royal Blue
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value;
          }
        }
      },
    },
  };

  return (
    <div className="analysis-container">
      {/* Filters */}
      <div className="analysis-filters">
        <div className="filter-item">
          <div className="filter-label">
            <i className="fas fa-tags"></i> Category
          </div>
          <MultiSelectDropdown
            options={categories && categories.length > 0 ? categories.map(cat => cat.name) : []}
            selectedValues={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="All Categories"
            items={categories}
            iconProperty="icon"
            showFooter={false}
          />
        </div>

        <div className="filter-item">
          <div className="filter-label">
            <i className="fas fa-credit-card"></i> Payment Method
          </div>
          <MultiSelectDropdown
            options={expensePaymentMethods && expensePaymentMethods.length > 0 ? expensePaymentMethods.map(method => method.name) : []}
            selectedValues={selectedPaymentMethods}
            onChange={setSelectedPaymentMethods}
            placeholder="All Payment Methods"
            items={expensePaymentMethods}
            iconProperty="icon"
            showFooter={false}
          />
        </div>

        <div className="filter-item search-filter">
          <div className="search-input-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search description" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <h3>Summary</h3>
      <div className="summary-cards">
        <div className="summary-card total-card">
          <div className="summary-label">Total Spent</div>
          <div className="summary-value">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="summary-card category-card">
          <div className="summary-label">Most Spent</div>
          <div className="summary-category">{mostSpentCategory.name}</div>
          <div className="summary-amount">{formatCurrency(mostSpentCategory.amount)}</div>
        </div>
      </div>

      {/* Category Spending Chart */}
      <h3>Spending by Category</h3>
      <div className="chart-container">
        {categoryData && categoryData.labels && categoryData.labels.length > 0 ? (
          <>
            <div className="doughnut-chart-container">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div className="chart-legend">
              {categoryData.labels.map((label, index) => (
                <div className="legend-item" key={index}>
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: categoryData.backgroundColor[index] }}
                  ></div>
                  <div className="legend-label">{label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-data-message">
            <i className="fas fa-chart-pie"></i>
            <p>No spending data available</p>
          </div>
        )}
      </div>

      {/* Daily Spending Chart */}
      <h3>Daily Spending</h3>
      <div className="chart-container">
        {dailySpendingData && dailySpendingData.labels && dailySpendingData.labels.length > 0 ? (
          <div className="bar-chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <div className="no-data-message">
            <i className="fas fa-chart-bar"></i>
            <p>No daily spending data available</p>
          </div>
        )}
      </div>

      {/* View All Transactions Button */}
      <button 
        className="view-all-transactions-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        View All Transactions
      </button>
    </div>
  );
};

export default Analysis;
