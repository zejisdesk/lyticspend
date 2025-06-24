import React from 'react';
import CustomDropdown from './CustomDropdown';
import { useCategories } from '../context/CategoryContext';
import { usePaymentMethods } from '../context/PaymentMethodContext';

const Filters = ({ categories, paymentMethods, onCategoryChange, onPaymentMethodChange, selectedCategory = 'all', selectedPaymentMethod = 'all' }) => {
  // Get full category and payment method objects with icons
  const { expenseCategories } = useCategories();
  const { expensePaymentMethods } = usePaymentMethods();
  
  // Prepare options with 'All' option at the beginning
  const categoryOptions = ['All Categories', ...categories];
  const paymentOptions = ['All Payments', ...paymentMethods];
  
  // Create a special 'All' category and payment method object
  const allCategoryObj = { name: 'All Categories', icon: 'fa-tags' };
  const allPaymentObj = { name: 'All Payments', icon: 'fa-credit-card' };
  
  // Combine the 'All' option with the actual category/payment objects
  const categoryItems = [allCategoryObj, ...expenseCategories];
  const paymentItems = [allPaymentObj, ...expensePaymentMethods];
  
  // Convert filter values to display values
  const getDisplayCategory = () => {
    if (selectedCategory === 'all') return 'All Categories';
    // Find the matching category name with proper casing
    const matchingCategory = categories.find(cat => cat.toLowerCase() === selectedCategory);
    return matchingCategory || 'All Categories';
  };
  
  const getDisplayPaymentMethod = () => {
    if (selectedPaymentMethod === 'all') return 'All Payments';
    // Find the matching payment method name with proper casing
    const matchingPayment = paymentMethods.find(method => method.toLowerCase() === selectedPaymentMethod);
    return matchingPayment || 'All Payments';
  };
  
  const handleCategoryChange = (selected) => {
    if (selected === 'All Categories') {
      onCategoryChange('all');
    } else {
      onCategoryChange(selected.toLowerCase());
    }
  };
  
  const handlePaymentChange = (selected) => {
    if (selected === 'All Payments') {
      onPaymentMethodChange('all');
    } else {
      onPaymentMethodChange(selected.toLowerCase());
    }
  };
  
  return (
    <div className="filters" style={{ padding: '0 0.5rem' }}>
      <div className="filter-item">
        <CustomDropdown
          id="category-filter"
          options={categoryOptions}
          items={categoryItems}
          value={getDisplayCategory()}
          onChange={handleCategoryChange}
          placeholder="All Categories"
          required={false}
        />
      </div>
      
      <div className="filter-item">
        <CustomDropdown
          id="payment-filter"
          options={paymentOptions}
          items={paymentItems}
          value={getDisplayPaymentMethod()}
          onChange={handlePaymentChange}
          placeholder="All Payments"
          required={false}
        />
      </div>
    </div>
  );
};

export default Filters;
