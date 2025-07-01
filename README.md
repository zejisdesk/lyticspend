# LyticSpend - Personal Finance Tracker

**[https://lyticspend.online](https://lyticspend.online/)** - Try it out, it's free!

LyticSpend is a modern, user-friendly personal finance tracking application built with React. It helps users track expenses and income, manage budgets, generate financial reports, and customize categories and payment methods.

![LyticSpend Logo](/public/app_logo.svg)

## Features

- 📊 Track expenses and income with detailed categorization
- 💰 Set and monitor monthly budgets
- 📱 Responsive design with dark mode support
- 📅 View financial reports and summaries
- 🔔 Notification reminders for financial tasks
- 🌐 Community integration via Discord
- 📤 Export reports to Excel
- 🔄 Offline capability with localStorage persistence

## Project Structure

### Core Components

#### Main Application Components

- **App.js**: Main application component that orchestrates all other components and manages global state
- **Header.js**: Displays the app title, current month, and financial summary
- **Navigation.js**: Bottom navigation bar for switching between main app sections
- **Settings.js**: Settings page for customizing app preferences, categories, and payment methods

#### Transaction Management

- **ActionButtons.js**: Floating action buttons for adding new expenses and income
- **AddTransactionModal.js**: Modal form for adding or editing transactions
- **TransactionList.js**: Displays the list of transactions grouped by date
- **TransactionGroup.js**: Groups transactions by date
- **TransactionItem.js**: Individual transaction item with details and actions
- **Filters.js**: Filter controls for categories and payment methods

#### Settings & Management

- **CategoryManagementModal.js**: Modal for adding, editing, and deleting expense/income categories
- **PaymentMethodManagementModal.js**: Modal for managing payment methods
- **ConfirmationModal.js**: Reusable confirmation dialog for delete actions
- **InitialCurrencyModal.js**: First-run modal to set user's preferred currency

#### Reports & Data Export

- **Reports.js**: Financial reports and visualizations
- **DownloadReportModal.js**: Modal for exporting financial data to Excel

#### UI Components

- **CustomDropdown.js**: Reusable dropdown component with search functionality
- **IconDropdown.js**: Specialized dropdown for selecting icons with preview

### Context Providers

- **BudgetContext.js**: Manages monthly budget state and persistence
- **CategoryContext.js**: Manages expense and income categories
- **CurrencyContext.js**: Handles currency selection and formatting
- **PaymentMethodContext.js**: Manages payment method options
- **ThemeContext.js**: Handles dark/light theme switching

### Custom Hooks

- **useTransactions.js**: Core hook for managing transaction data, including CRUD operations and financial calculations

### Utilities

- **financialUtils.js**: Helper functions for financial calculations and formatting
- **excelExport.js**: Functions for exporting data to Excel format
- **reportUtils.js**: Utilities for generating and formatting reports
- **reportPrinter.js**: Functions for printing reports
- **sampleData.js**: Sample data for initial app state
- **storageUtils.js**: Utilities for localStorage persistence
- **transactionUtils.js**: Helper functions for transaction management

### Services

- **notificationService.js**: Handles push notifications and reminders

## Technical Implementation

### State Management

LyticSpend uses React Context API for global state management, with separate contexts for different concerns:

- Transactions and financial data
- Categories and payment methods
- User preferences (currency, theme)
- Budget settings

### Data Persistence

All data is stored in the browser's localStorage, allowing the app to function offline and persist data between sessions.

### Responsive Design

The app is fully responsive and works on mobile, tablet, and desktop devices. It includes:

- Mobile-first design approach
- Touch-friendly UI elements
- Adaptive layouts for different screen sizes

### Dark Mode

Full dark mode support is implemented throughout the application, respecting user preferences and providing a comfortable viewing experience in low-light conditions.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/zejisdesk/lyticspend.git
   ```

2. Navigate to the project directory:
   ```
   cd lyticspend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Building for Production

To build the app for production, run:

```
npm run build
```

This creates an optimized production build in the `build` folder.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Community

Join our Discord community to connect with other users and developers:
[LyticSpend Discord](https://discord.gg/4zQjrgJxep)
