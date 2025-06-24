import React, { createContext, useState, useContext } from 'react';

// Define available currencies with their symbols
export const currencies = {
  // Major World Currencies
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  
  // Americas
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  ARS: { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  CLP: { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  COP: { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  UYU: { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  BOB: { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  VES: { code: 'VES', symbol: 'Bs.', name: 'Venezuelan Bolívar' },
  
  // Europe
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  RON: { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  BGN: { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  HRK: { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  ISK: { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
  RSD: { code: 'RSD', symbol: 'din.', name: 'Serbian Dinar' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  
  // Asia
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  TWD: { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  MMK: { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat' },
  KHR: { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  LAK: { code: 'LAK', symbol: '₭', name: 'Lao Kip' },
  
  // Middle East
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  QAR: { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  OMR: { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
  BHD: { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  KWD: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  JOD: { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
  LBP: { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
  IRR: { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  
  // Africa
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  EGP: { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  MAD: { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  TND: { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  DZD: { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  TZS: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  ETB: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  
  // Oceania
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  FJD: { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' },
  PGK: { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
  SBD: { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar' },
  TOP: { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga' },
  VUV: { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu' },
  WST: { code: 'WST', symbol: 'WS$', name: 'Samoan Tala' },
  
  // Other Major Currencies
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  
  // Cryptocurrencies
  BTC: { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
  ETH: { code: 'ETH', symbol: 'Ξ', name: 'Ethereum' },
  XRP: { code: 'XRP', symbol: 'XRP', name: 'Ripple' },
  LTC: { code: 'LTC', symbol: 'Ł', name: 'Litecoin' },
  USDT: { code: 'USDT', symbol: '₮', name: 'Tether' }
};

// Create the context
const CurrencyContext = createContext();

// Create a provider component
export const CurrencyProvider = ({ children }) => {
  // Initialize currency from localStorage or default to USD
  const [currency, setCurrency] = useState(() => {
    const savedCurrencyCode = localStorage.getItem('selectedCurrency');
    return savedCurrencyCode && currencies[savedCurrencyCode] 
      ? currencies[savedCurrencyCode] 
      : currencies.USD;
  });

  // Function to update the currency
  const updateCurrency = (currencyCode) => {
    if (currencies[currencyCode]) {
      setCurrency(currencies[currencyCode]);
      // Save to localStorage
      localStorage.setItem('selectedCurrency', currencyCode);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
