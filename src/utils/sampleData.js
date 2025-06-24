/**
 * Sample data for demonstration purposes
 */

/**
 * Get sample transactions for initial app state
 * @returns {Array} Array of sample transaction objects
 */
export const getSampleTransactions = () => {
  return [
    {
      id: 1,
      amount: 45.00,
      description: 'Grocery Shopping',
      category: 'Food',
      paymentMethod: 'Credit Card',
      type: 'expense',
      date: '2025-06-22T12:00:00.000Z'
    },
    {
      id: 2,
      amount: 25.50,
      description: 'Uber Ride',
      category: 'Transport',
      paymentMethod: 'Digital Wallet',
      type: 'expense',
      date: '2025-06-22T14:30:00.000Z'
    },
    {
      id: 3,
      amount: 15.00,
      description: 'Movie Ticket',
      category: 'Entertainment',
      paymentMethod: 'Credit Card',
      type: 'expense',
      date: '2025-06-22T18:45:00.000Z'
    },
    {
      id: 4,
      amount: 4250.00,
      description: 'Monthly Salary',
      category: 'Salary',
      paymentMethod: 'Bank Transfer',
      type: 'income',
      date: '2025-06-21T09:00:00.000Z'
    }
  ];
};
