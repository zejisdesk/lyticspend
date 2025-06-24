/**
 * HTML-based report generation utilities for LyticSpend
 * This provides a reliable alternative to jsPDF for report generation
 */

/**
 * Generate a printable HTML report that can be saved as PDF
 * Uses browser print functionality for maximum reliability
 * @param {Object} data - Report data including financial metrics
 * @param {Object} currency - Currency information
 * @returns {boolean} Success status
 */
export const generatePrintableReport = (data, currency) => {
  try {
    // Create a printable HTML report
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Pop-up blocked. Please allow pop-ups for this site.');
      return false;
    }
    
    // Safe default values
    const totalExpenses = data?.totalExpenses || 0;
    const totalIncome = data?.totalIncome || 0;
    const balance = totalIncome - totalExpenses;
    const currencySymbol = currency?.symbol || '₹';
    
    // Get category data with safe defaults
    const categoryData = data?.categoryData || [];
    const frequentCategories = data?.frequentCategories || [];
    const monthlyData = data?.monthlyData || {
      current: { month: 'Current', total: 0, daily: 0 },
      previous: { month: 'Previous', total: 0, daily: 0 }
    };
    
    // Format numbers with currency
    const formatCurrency = (value) => {
      return `${currencySymbol}${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    };
    
    // Generate category rows
    const categoryRows = categoryData.map((category) => {
      const percentage = totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0;
      return `
        <tr>
          <td>${category.category || 'Unknown'}</td>
          <td class="text-right">${formatCurrency(category.amount)}</td>
          <td class="text-right">${percentage}%</td>
        </tr>
      `;
    }).join('');
    
    // Generate frequent category rows
    const totalCount = frequentCategories.reduce((sum, c) => sum + (c.count || 0), 0) || 1;
    const frequentRows = frequentCategories.map((category) => {
      const percentage = Math.round(((category.count || 0) / totalCount) * 100);
      return `
        <tr>
          <td>${category.category || 'Unknown'}</td>
          <td class="text-right">${category.count || 0}</td>
          <td class="text-right">${percentage}%</td>
        </tr>
      `;
    }).join('');
    
    // Calculate percentage change
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const change = ((current - previous) / previous) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    };
    
    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LyticSpend Financial Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
          }
          .report-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
          }
          .logo {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #3CAEA3;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
          }
          .logo-inner {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background-color: #173F5F;
          }
          .title-section {
            flex: 1;
          }
          h1, h2, h3 {
            margin: 0;
            color: #173F5F;
          }
          .date {
            color: #666;
            font-size: 14px;
          }
          .kpi-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .kpi-box {
            padding: 15px;
            border-radius: 5px;
            color: white;
            width: 30%;
            box-sizing: border-box;
          }
          .kpi-title {
            font-size: 14px;
            margin-bottom: 5px;
          }
          .kpi-value {
            font-size: 24px;
            font-weight: bold;
          }
          .success {
            background-color: #3BB273;
          }
          .danger {
            background-color: #ED553B;
          }
          .section {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #3CAEA3;
            color: white;
            text-align: left;
            padding: 10px;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .text-right {
            text-align: right;
          }
          .month-comparison {
            display: flex;
            justify-content: space-between;
          }
          .month-column {
            width: 48%;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          .month-name {
            font-weight: bold;
            font-size: 18px;
            color: #173F5F;
          }
          .month-amount {
            font-size: 24px;
            margin: 10px 0;
          }
          .month-details {
            font-size: 14px;
            color: #666;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .print-button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="logo">
              <div class="logo-inner"></div>
            </div>
            <div class="title-section">
              <h1>Financial Summary Report</h1>
              <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="kpi-container">
            <div class="kpi-box success">
              <div class="kpi-title">Total Income</div>
              <div class="kpi-value">${formatCurrency(totalIncome)}</div>
            </div>
            <div class="kpi-box danger">
              <div class="kpi-title">Total Expenses</div>
              <div class="kpi-value">${formatCurrency(totalExpenses)}</div>
            </div>
            <div class="kpi-box ${balance >= 0 ? 'success' : 'danger'}">
              <div class="kpi-title">Balance</div>
              <div class="kpi-value">${formatCurrency(balance)}</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Spending Analysis</h2>
            ${categoryData.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th class="text-right">Amount</th>
                    <th class="text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoryRows}
                </tbody>
              </table>
            ` : '<p>No spending data available</p>'}
          </div>
          
          <div class="section">
            <h2>Monthly Comparison</h2>
            <div class="month-comparison">
              <div class="month-column">
                <div class="month-name">${monthlyData.previous.month || 'Previous Month'}</div>
                <div class="month-amount">${formatCurrency(monthlyData.previous.total)}</div>
                <div class="month-details">
                  <div>Daily Avg: ${formatCurrency(monthlyData.previous.daily)}</div>
                  ${monthlyData.previous.highestDay ? `<div>Highest: ${monthlyData.previous.highestDay}th</div>` : ''}
                </div>
              </div>
              <div class="month-column">
                <div class="month-name">${monthlyData.current.month || 'Current Month'}</div>
                <div class="month-amount">${formatCurrency(monthlyData.current.total)}</div>
                <div class="month-details">
                  <div>Daily Avg: ${formatCurrency(monthlyData.current.daily)}</div>
                  ${monthlyData.current.highestDay ? `<div>Highest: ${monthlyData.current.highestDay}th</div>` : ''}
                </div>
              </div>
            </div>
            <table style="margin-top: 20px;">
              <thead>
                <tr>
                  <th></th>
                  <th class="text-right">Current Month</th>
                  <th class="text-right">Previous Month</th>
                  <th class="text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Spending</td>
                  <td class="text-right">${formatCurrency(monthlyData.current.total)}</td>
                  <td class="text-right">${formatCurrency(monthlyData.previous.total)}</td>
                  <td class="text-right">${calculateChange(monthlyData.current.total, monthlyData.previous.total)}</td>
                </tr>
                <tr>
                  <td>Daily Average</td>
                  <td class="text-right">${formatCurrency(monthlyData.current.daily)}</td>
                  <td class="text-right">${formatCurrency(monthlyData.previous.daily)}</td>
                  <td class="text-right">${calculateChange(monthlyData.current.daily, monthlyData.previous.daily)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          ${frequentCategories.length > 0 ? `
            <div class="section">
              <h2>Frequent Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th class="text-right">Count</th>
                    <th class="text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${frequentRows}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Generated by LyticSpend App</p>
          </div>
          
          <div class="no-print" style="text-align: center;">
            <button class="print-button" onclick="window.print();">Print / Save as PDF</button>
          </div>
        </div>
        
        <script>
          // Auto-focus the window
          window.focus();
        </script>
      </body>
      </html>
    `;
    
    // Write the HTML content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    return true;
  } catch (error) {
    console.error("Report Generation Error:", error);
    return false;
  }
};
