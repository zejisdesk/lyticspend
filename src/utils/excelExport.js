/**
 * Excel report generation utilities for LyticSpend
 * Uses ExcelJS for better styling support
 */
import ExcelJS from 'exceljs';

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The currency code to use
 * @returns {string} Formatted currency string
 */
const currencyFormatter = (amount, currencyCode) => {
  return `${currencyCode} ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} Formatted percentage change
 */
const calculateChange = (current, previous) => {
  if (previous === 0) return '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
};

/**
 * Generate and download an Excel file with proper styling
 * @param {Object} data - The data object containing transactions, categories, etc.
 * @param {string} currencyCode - The currency code to use for formatting
 * @param {string} reportType - The type of report to generate ('full' or 'analytics')
 */
export const generateStyledExcelReport = async (data, currencyCode, reportType = 'analytics') => {
  try {
    const { transactions, categoryData, monthlyData, frequentCategories } = data;
    
    // Calculate totals - use data values if provided, otherwise calculate from transactions
    let totalExpenses = data.totalExpenses;
    let totalIncome = data.totalIncome;
    
    // If not provided in data, calculate from transactions
    if (totalExpenses === undefined) {
      totalExpenses = categoryData.reduce((sum, category) => sum + category.amount, 0);
    }
    
    if (totalIncome === undefined) {
      totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }
    
    // Ensure we have numbers, not undefined
    totalExpenses = totalExpenses || 0;
    totalIncome = totalIncome || 0;
    const balance = totalIncome - totalExpenses;
    
    // Create a new workbook with ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'LyticSpend';
    workbook.lastModifiedBy = 'LyticSpend';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Create a worksheet based on report type
    if (reportType === 'analytics' || reportType === 'full') {
      // Add a worksheet with appropriate name
      const worksheet = workbook.addWorksheet(reportType === 'full' ? 'Full Report' : 'Analytics Report');
      
      // Set column widths to match PDF report
      worksheet.columns = [
        { width: 30 }, // Category column
        { width: 15 }, // June column
        { width: 15 }, // May column
        { width: 15 }, // Spacing
        { width: 20 }  // Percentage/Amount column
      ];
      
      // Set default row height
      worksheet.properties.defaultRowHeight = 20;
      
      // Define styles to match PDF report exactly
      const styles = {
        title: { font: { name: 'Arial', size: 18, bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } },
        subtitle: { font: { name: 'Arial', size: 14, bold: false }, alignment: { horizontal: 'center', vertical: 'middle' } },
        reportingPeriod: { font: { name: 'Arial', size: 11, bold: false }, alignment: { horizontal: 'center', vertical: 'middle' } },
        sectionHeader: {
          font: { name: 'Arial', size: 14, bold: true },
          alignment: { horizontal: 'left', vertical: 'middle' },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } } // No background color
        },
        tableHeader: {
          font: { name: 'Arial', size: 10, bold: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          }
        },
        dataRowEven: {
          font: { name: 'Arial', size: 10 },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
          border: { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } },
          alignment: { horizontal: 'left', vertical: 'middle' }
        },
        dataRowOdd: {
          font: { name: 'Arial', size: 10 },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } },
          border: { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } },
          alignment: { horizontal: 'left', vertical: 'middle' }
        },
        currencyCell: {
          font: { name: 'Arial', size: 11 },
          alignment: { horizontal: 'right', vertical: 'middle' }
        },
        percentageCell: {
          font: { name: 'Arial', size: 11 },
          alignment: { horizontal: 'right', vertical: 'middle' }
        },
        totalRow: {
          font: { name: 'Arial', size: 10, bold: true },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } },
          border: {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          }
        },
        normalText: {
          font: { name: 'Arial', size: 10 },
          alignment: { vertical: 'middle' }
        }
      };
      
      // Add title - 18pt, bold, all caps, centered
      const titleRow = worksheet.addRow(['PERSONAL FINANCE REPORT', '', '', '', '']);
      worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
      titleRow.height = 35; // Increased height for larger font
      titleRow.eachCell(cell => {
        cell.style = styles.title;
      });
      
      // Add subtitle - 14pt, regular, centered
      const subtitleRow = worksheet.addRow(['Monthly Expense Analysis', '', '', '', '']);
      worksheet.mergeCells(`A${subtitleRow.number}:E${subtitleRow.number}`);
      subtitleRow.height = 28; // Adjusted height for 14pt font
      subtitleRow.eachCell(cell => {
        cell.style = styles.subtitle;
      });
      
      // Add reporting period - 11pt, regular, centered, no background
      // Use the selected month-year from data or fall back to current month data
      const reportingPeriodRow = worksheet.addRow([`Reporting Period: ${data.selectedMonthYear || monthlyData.current.month + ' ' + (monthlyData.current.year || new Date().getFullYear())}`, '', '', '', '']);
      worksheet.mergeCells(`A${reportingPeriodRow.number}:E${reportingPeriodRow.number}`);
      reportingPeriodRow.height = 22; // Adjusted height for 11pt font
      reportingPeriodRow.eachCell(cell => {
        cell.style = styles.reportingPeriod;
      });
      
      // Add empty row for spacing
      const spacerRow = worksheet.addRow(['', '', '', '', '']);
      spacerRow.height = 10;
      
      // Add FINANCIAL SUMMARY section header - 14pt, bold, left-aligned, no background
      const financialHeaderRow = worksheet.addRow(['FINANCIAL SUMMARY', '', '', '', '']);
      worksheet.mergeCells(`A${financialHeaderRow.number}:E${financialHeaderRow.number}`);
      financialHeaderRow.height = 28; // Increased height for 14pt font
      financialHeaderRow.eachCell(cell => {
        cell.style = styles.sectionHeader;
      });
      
      // Add small spacing instead of horizontal line
      const financialHeaderSpacerRow = worksheet.addRow(['', '', '', '', '']);
      financialHeaderSpacerRow.height = 5;
      
      // Add financial summary data with alternating row colors and values in rightmost column
      const incomeRow = worksheet.addRow(['Monthly Income', '', '', '', currencyFormatter(monthlyData.current.income || 0, currencyCode)]);
      incomeRow.height = 22; // Consistent row height
      incomeRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowEven };
      });
      incomeRow.getCell(5).style = { ...incomeRow.getCell(5).style, ...styles.currencyCell };
      
      const expensesRow = worksheet.addRow(['Total Expenses', '', '', '', currencyFormatter(totalExpenses, currencyCode)]);
      expensesRow.height = 22;
      expensesRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowOdd };
      });
      expensesRow.getCell(5).style = { ...expensesRow.getCell(5).style, ...styles.currencyCell };
      
      const netBalance = (monthlyData.current.income || 0) - totalExpenses;
      const balanceRow = worksheet.addRow(['Net Balance', '', '', '', currencyFormatter(netBalance, currencyCode)]);
      balanceRow.height = 22;
      balanceRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowEven };
      });
      balanceRow.getCell(5).style = { ...balanceRow.getCell(5).style, ...styles.currencyCell };
      if (netBalance > 0) {
        balanceRow.getCell(5).font = { name: 'Arial', size: 11, color: { argb: 'FF008000' } };
      }
      
      const percentageSpent = monthlyData.current.income > 0 ? ((totalExpenses / monthlyData.current.income) * 100).toFixed(1) : '0.0';
      const percentageRow = worksheet.addRow(['Percentage Spent', '', '', '', `${percentageSpent}%`]);
      percentageRow.height = 22;
      percentageRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowOdd };
      });
      percentageRow.getCell(5).style = { ...percentageRow.getCell(5).style, ...styles.currencyCell, font: { name: 'Arial', size: 11 } };
      
      // Budget Utilization - with white background (even row)
      // Calculate budget utilization dynamically based on whether there are transactions
      const hasTransactionsForSelectedMonth = transactions.length > 0;
      const monthlyBudget = hasTransactionsForSelectedMonth ? Math.max(totalIncome * 0.75, 3800) : 0;
      const budgetUtilizationValue = hasTransactionsForSelectedMonth && monthlyBudget > 0 ? 
        Math.round((totalExpenses / monthlyBudget) * 100) : 0;
      const budgetUtilization = `${budgetUtilizationValue}%`;
      
      const budgetRow = worksheet.addRow(['Budget Utilization (YTD)', '', '', '', budgetUtilization]);
      budgetRow.height = 22;
      budgetRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowEven };
      });
      budgetRow.getCell(5).style = { ...budgetRow.getCell(5).style, ...styles.currencyCell };
      
      // Savings Ratio - with #f9f9f9 background (odd row)
      // Calculate savings ratio dynamically based on whether there are transactions
      const savingsRatioValue = hasTransactionsForSelectedMonth && totalIncome > 0 ? 
        Math.round((balance / totalIncome) * 100) : 0;
      const savingsRatio = `${savingsRatioValue}%`;
      const savingsRow = worksheet.addRow(['Savings Ratio', '', '', '', savingsRatio]);
      savingsRow.height = 22;
      savingsRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowOdd };
      });
      savingsRow.getCell(5).style = { ...savingsRow.getCell(5).style, ...styles.currencyCell };
      
      // Add empty row
      worksheet.addRow(['', '', '', '', '']);
      
      // Add EXPENSE CATEGORIES section header - 14pt, bold, left-aligned, no background
      const categoryHeaderRow = worksheet.addRow(['EXPENSE CATEGORIES BREAKDOWN', '', '', '', '']);
      worksheet.mergeCells(`A${categoryHeaderRow.number}:E${categoryHeaderRow.number}`);
      categoryHeaderRow.height = 28; // Increased height for 14pt font
      categoryHeaderRow.eachCell(cell => {
        cell.style = styles.sectionHeader;
      });
      
      // Add small spacing instead of horizontal line
      const categoryHeaderSpacerRow = worksheet.addRow(['', '', '', '', '']);
      categoryHeaderSpacerRow.height = 5;
      
      // Add category table header with improved styling - 10pt, bold, with #f2f2f2 background
      const categoryTableHeaderRow = worksheet.addRow(['Category', '', 'Amount', '', '% of Total']);
      worksheet.mergeCells(`A${categoryTableHeaderRow.number}:B${categoryTableHeaderRow.number}`);
      worksheet.mergeCells(`C${categoryTableHeaderRow.number}:D${categoryTableHeaderRow.number}`);
      categoryTableHeaderRow.height = 22;
      categoryTableHeaderRow.eachCell(cell => {
        cell.style = styles.tableHeader;
      });
      // All table headers should be center-aligned
      categoryTableHeaderRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      categoryTableHeaderRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      categoryTableHeaderRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Add category data with alternating row colors matching PDF report
      categoryData.forEach((item, index) => {
        const percentage = totalExpenses > 0 ? ((item.amount / totalExpenses) * 100).toFixed(1) : '0.0';
        const isEven = index % 2 === 0;
        const rowStyle = isEven ? styles.dataRowEven : styles.dataRowOdd;
        
        const categoryRow = worksheet.addRow([item.category, '', currencyFormatter(item.amount, currencyCode), '', `${percentage}%`]);
        worksheet.mergeCells(`A${categoryRow.number}:B${categoryRow.number}`);
        worksheet.mergeCells(`C${categoryRow.number}:D${categoryRow.number}`);
        categoryRow.height = 22;
        
        categoryRow.eachCell((cell, colNumber) => {
          cell.style = { ...rowStyle };
          
          if (colNumber === 3) {
            cell.style = { ...cell.style, ...styles.currencyCell };
          } else if (colNumber === 5) {
            cell.style = { ...cell.style, ...styles.percentageCell };
          }
        });
      });
      
      // Add total expenses row with enhanced styling to match PDF - 10pt, bold, with #f9f9f9 background
      const totalRow = worksheet.addRow(['TOTAL EXPENSES', '', currencyFormatter(totalExpenses, currencyCode), '', '100.0%']);
      worksheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);
      worksheet.mergeCells(`C${totalRow.number}:D${totalRow.number}`);
      totalRow.height = 22;
      totalRow.eachCell(cell => {
        cell.style = { ...styles.totalRow };
      });
      totalRow.getCell(3).style = { ...totalRow.getCell(3).style, ...styles.currencyCell, font: { name: 'Arial', size: 10, bold: true } };
      totalRow.getCell(5).style = { ...totalRow.getCell(5).style, ...styles.percentageCell, font: { name: 'Arial', size: 10, bold: true } };
      
      // Add empty row
      worksheet.addRow(['', '', '', '', '']);
      
      // Add MONTHLY COMPARISON section header - 14pt, bold, left-aligned, no background
      const monthlyComparisonHeaderRow = worksheet.addRow(['MONTHLY COMPARISON', '', '', '', '']);
      worksheet.mergeCells(`A${monthlyComparisonHeaderRow.number}:E${monthlyComparisonHeaderRow.number}`);
      monthlyComparisonHeaderRow.height = 28; // Increased height for 14pt font
      monthlyComparisonHeaderRow.eachCell(cell => {
        cell.style = styles.sectionHeader;
      });
      
      // Add small spacing instead of horizontal line
      const monthlyComparisonHeaderSpacerRow = worksheet.addRow(['', '', '', '', '']);
      monthlyComparisonHeaderSpacerRow.height = 5;
      
      // Add monthly comparison table header with improved styling - 10pt, bold, center-aligned, #f2f2f2 background
      const monthlyTableHeaderRow = worksheet.addRow(['Metric', monthlyData.current.month || 'June', monthlyData.previous.month || 'May', '', 'Change']);
      worksheet.mergeCells(`C${monthlyTableHeaderRow.number}:D${monthlyTableHeaderRow.number}`);
      monthlyTableHeaderRow.height = 22;
      monthlyTableHeaderRow.eachCell(cell => {
        cell.style = styles.tableHeader;
      });
      
      // Add monthly comparison data with alternating row colors matching PDF
      const currentTotal = monthlyData.current.total || 0;
      const previousTotal = monthlyData.previous.total || 0;
      const totalExpensesRow = worksheet.addRow([
        'Total Expenses', 
        currencyFormatter(currentTotal, currencyCode), 
        currencyFormatter(previousTotal, currencyCode),
        '',
        calculateChange(currentTotal, previousTotal)
      ]);
      totalExpensesRow.height = 22; // Match PDF row height
      totalExpensesRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowEven };
      });
      totalExpensesRow.getCell(2).style = { ...totalExpensesRow.getCell(2).style, ...styles.currencyCell };
      totalExpensesRow.getCell(3).style = { ...totalExpensesRow.getCell(3).style, ...styles.currencyCell };
      totalExpensesRow.getCell(5).style = { ...totalExpensesRow.getCell(5).style, ...styles.percentageCell };
      
      const currentDaily = monthlyData.current.daily || 0;
      const previousDaily = monthlyData.previous.daily || 0;
      const dailyAvgRow = worksheet.addRow([
        'Daily Average', 
        currencyFormatter(currentDaily, currencyCode), 
        currencyFormatter(previousDaily, currencyCode),
        '',
        calculateChange(currentDaily, previousDaily)
      ]);
      dailyAvgRow.height = 22; // Match PDF row height
      dailyAvgRow.eachCell(cell => {
        cell.style = { ...cell.style, ...styles.dataRowOdd };
      });
      dailyAvgRow.getCell(2).style = { ...dailyAvgRow.getCell(2).style, ...styles.currencyCell };
      dailyAvgRow.getCell(3).style = { ...dailyAvgRow.getCell(3).style, ...styles.currencyCell };
      dailyAvgRow.getCell(5).style = { ...dailyAvgRow.getCell(5).style, ...styles.percentageCell };
      
      // Add empty row
      worksheet.addRow(['', '', '', '', '']);
      
      // Add FREQUENT TRANSACTIONS section if data exists
      if (frequentCategories && frequentCategories.length > 0) {
        // Add FREQUENT TRANSACTIONS section header - 14pt, bold, left-aligned, no background
        const frequentHeaderRow = worksheet.addRow(['FREQUENT TRANSACTIONS', '', '', '', '']);
        worksheet.mergeCells(`A${frequentHeaderRow.number}:E${frequentHeaderRow.number}`);
        frequentHeaderRow.height = 28; // Increased height for 14pt font
        frequentHeaderRow.eachCell(cell => {
          cell.style = styles.sectionHeader;
        });
        
        // Add small spacing instead of horizontal line
        const frequentHeaderSpacerRow = worksheet.addRow(['', '', '', '', '']);
        frequentHeaderSpacerRow.height = 5;
        
        // Add frequent transactions table header with improved styling - 10pt, bold, center-aligned, #f2f2f2 background
        const frequentTableHeaderRow = worksheet.addRow(['Category', '', 'Count', '', 'Percentage']);
        worksheet.mergeCells(`A${frequentTableHeaderRow.number}:B${frequentTableHeaderRow.number}`);
        worksheet.mergeCells(`C${frequentTableHeaderRow.number}:D${frequentTableHeaderRow.number}`);
        frequentTableHeaderRow.height = 22;
        frequentTableHeaderRow.eachCell(cell => {
          cell.style = styles.tableHeader;
        });
        
        // Add frequent transactions data with alternating row colors matching PDF - 10pt font, striped rows
        frequentCategories.forEach((item, index) => {
          const percentage = transactions.length > 0 ? ((item.count / transactions.length) * 100).toFixed(1) : '0.0';
          const isEven = index % 2 === 0;
          const rowStyle = isEven ? styles.dataRowEven : styles.dataRowOdd;
          
          const row = worksheet.addRow([item.category, '', item.count, '', `${percentage}%`]);
          worksheet.mergeCells(`A${row.number}:B${row.number}`);
          worksheet.mergeCells(`C${row.number}:D${row.number}`);
          row.height = 22; // Consistent row height
          
          row.eachCell(cell => {
            cell.style = { ...cell.style, ...rowStyle };
          });
          
          // Apply proper styling to cells
          row.getCell(3).style = { ...row.getCell(3).style, alignment: { horizontal: 'right', vertical: 'middle' } };
          row.getCell(5).style = { ...row.getCell(5).style, ...styles.percentageCell };
        });
      }
      
      // Add empty rows for spacing
      worksheet.addRow(['', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '']);
      
      // Add signature line
      const signatureRow = worksheet.addRow(['Prepared By', '', 'Date', '', 'Reviewed By']);
      
      // Add empty rows for spacing after signature
      worksheet.addRow(['', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '']);
      
      // Add INCOME TRANSACTIONS section header
      const incomeHeaderRow = worksheet.addRow(['INCOME TRANSACTIONS', '', '', '', '']);
      worksheet.mergeCells(`A${incomeHeaderRow.number}:E${incomeHeaderRow.number}`);
      incomeHeaderRow.height = 28; // Increased height for 14pt font
      incomeHeaderRow.eachCell(cell => {
        cell.style = styles.sectionHeader;
      });
      
      // Add small spacing instead of horizontal line
      const incomeHeaderSpacerRow = worksheet.addRow(['', '', '', '', '']);
      incomeHeaderSpacerRow.height = 5;
      
      // Add income transactions table header with Category column
      const incomeTableHeaderRow = worksheet.addRow(['Description', 'Category', 'Date', '', 'Amount']);
      incomeTableHeaderRow.height = 22;
      incomeTableHeaderRow.eachCell(cell => {
        cell.style = styles.tableHeader;
      });
      
      // All table headers should be center-aligned
      incomeTableHeaderRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      incomeTableHeaderRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      incomeTableHeaderRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      incomeTableHeaderRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Filter income transactions
      const incomeTransactions = transactions.filter(t => t.type === 'income');
      
      // Add income transactions with alternating row colors
      if (incomeTransactions.length > 0) {
        incomeTransactions.forEach((transaction, index) => {
          const isEven = index % 2 === 0;
          const rowStyle = isEven ? styles.dataRowEven : styles.dataRowOdd;
          
          const transactionDate = transaction.date ? new Date(transaction.date).toLocaleDateString() : '';
          const row = worksheet.addRow([transaction.description || '', transaction.category || 'Uncategorized', transactionDate, '', currencyFormatter(transaction.amount, currencyCode)]);
          row.height = 22;
          
          row.eachCell(cell => {
            cell.style = { ...cell.style, ...rowStyle };
          });
          
          // Apply proper styling to cells
          row.getCell(5).style = { ...row.getCell(5).style, ...styles.currencyCell };
        });
      } else {
        // Add a row indicating no income transactions
        const noDataRow = worksheet.addRow(['No income transactions found', '', '', '', '']);
        worksheet.mergeCells(`A${noDataRow.number}:E${noDataRow.number}`);
        noDataRow.height = 22;
        noDataRow.eachCell(cell => {
          cell.style = { ...cell.style, ...styles.dataRowEven };
        });
      }
      
      // Add total row if there are income transactions
      if (incomeTransactions.length > 0) {
        const totalRow = worksheet.addRow(['TOTAL', '', '', '', currencyFormatter(totalIncome, currencyCode)]);
        worksheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
        totalRow.height = 22;
        totalRow.eachCell(cell => {
          cell.style = { ...cell.style, ...styles.totalRow };
        });
        totalRow.getCell(5).style = { ...totalRow.getCell(5).style, ...styles.currencyCell };
      }
      
      // Add empty rows for spacing
      worksheet.addRow(['', '', '', '', '']);
      worksheet.addRow(['', '', '', '', '']);
      
      // Add EXPENSE TRANSACTIONS section header
      const expenseHeaderRow = worksheet.addRow(['EXPENSE TRANSACTIONS', '', '', '', '']);
      worksheet.mergeCells(`A${expenseHeaderRow.number}:E${expenseHeaderRow.number}`);
      expenseHeaderRow.height = 28; // Increased height for 14pt font
      expenseHeaderRow.eachCell(cell => {
        cell.style = styles.sectionHeader;
      });
      
      // Add small spacing instead of horizontal line
      const expenseHeaderSpacerRow = worksheet.addRow(['', '', '', '', '']);
      expenseHeaderSpacerRow.height = 5;
      
      // Add expense transactions table header with Category column
      const expenseTableHeaderRow = worksheet.addRow(['Description', 'Category', 'Date', '', 'Amount']);
      expenseTableHeaderRow.height = 22;
      expenseTableHeaderRow.eachCell(cell => {
        cell.style = styles.tableHeader;
      });
      
      // All table headers should be center-aligned
      expenseTableHeaderRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      expenseTableHeaderRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      expenseTableHeaderRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      expenseTableHeaderRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Filter expense transactions
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      
      // Add expense transactions with alternating row colors
      if (expenseTransactions.length > 0) {
        expenseTransactions.forEach((transaction, index) => {
          const isEven = index % 2 === 0;
          const rowStyle = isEven ? styles.dataRowEven : styles.dataRowOdd;
          
          const transactionDate = transaction.date ? new Date(transaction.date).toLocaleDateString() : '';
          const row = worksheet.addRow([transaction.description || '', transaction.category || 'Uncategorized', transactionDate, '', currencyFormatter(transaction.amount, currencyCode)]);
          row.height = 22;
          
          row.eachCell(cell => {
            cell.style = { ...cell.style, ...rowStyle };
          });
          
          // Apply proper styling to cells
          row.getCell(5).style = { ...row.getCell(5).style, ...styles.currencyCell };
        });
      } else {
        // Add a row indicating no expense transactions
        const noDataRow = worksheet.addRow(['No expense transactions found', '', '', '', '']);
        worksheet.mergeCells(`A${noDataRow.number}:E${noDataRow.number}`);
        noDataRow.height = 22;
        noDataRow.eachCell(cell => {
          cell.style = { ...cell.style, ...styles.dataRowEven };
        });
      }
      
      // Add total row if there are expense transactions
      if (expenseTransactions.length > 0) {
        const expenseTotalRow = worksheet.addRow(['TOTAL', '', '', '', currencyFormatter(totalExpenses, currencyCode)]);
        worksheet.mergeCells(`A${expenseTotalRow.number}:D${expenseTotalRow.number}`);
        expenseTotalRow.height = 22;
        expenseTotalRow.eachCell(cell => {
          cell.style = { ...cell.style, ...styles.totalRow };
        });
        expenseTotalRow.getCell(5).style = { ...expenseTotalRow.getCell(5).style, ...styles.currencyCell };
      }
    }
    
    // Generate the Excel file as a blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create a download link and trigger download
    const fileName = `lyticspend_${reportType}_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(link.href);
    
    return true;
  } catch (error) {
    console.error('Excel Generation Error:', error);
    return false;
  }
};
