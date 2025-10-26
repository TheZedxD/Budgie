# Budgie - Personal Budget Manager

**Version 1.0** - A comprehensive personal budgeting web application built with pure vanilla JavaScript.

## Overview

Budgie is a powerful, privacy-focused budgeting application that helps you track income, expenses, and project future account balances. Built with zero external dependencies, all your data stays private in your browser.

## Key Features

- **Transaction Management**: Track one-time and recurring income/expenses
- **Calendar View**: Visual monthly calendar with transaction summaries
- **24-Month Projections**: Forecast future account balances
- **Interactive Reports**: Line and pie charts for financial analysis
- **Custom Categories**: Organize transactions with customizable tags
- **Historical Analysis**: View actual balance trends and spending patterns
- **Dark Mode**: Eye-friendly theme with smooth transitions
- **Data Export/Import**: Backup and restore your data as JSON
- **Undo/Redo**: 50-step history for accidental changes
- **100% Offline**: No account required, works completely offline

## Quick Start

1. Open `index.html` in a modern web browser
2. Click "Settings" to set your starting balance
3. Add your first transaction using "+ Add Paycheck" or "+ Add Expense"
4. View reports and projections to analyze your finances

## Technology Stack

- **Pure Vanilla JavaScript (ES6+)** - No frameworks or libraries
- **HTML5** - Semantic, accessible markup
- **CSS3** - Custom properties, Flexbox, Grid layouts
- **LocalStorage** - Client-side data persistence
- **Canvas API** - Interactive charts and visualizations

## Documentation

- **`VERSION-1.0.md`** - Complete feature documentation, architecture details, and usage guide
- **`Scripts/README.md`** - Module documentation and developer guide

## Project Structure

```
Budgie/
├── index.html              Main application entry point
├── styles.css              Complete application styling
├── VERSION-1.0.md          Comprehensive Version 1.0 documentation
├── README.md               This file
└── Scripts/
    ├── app.js              Application bootstrap
    ├── state.js            State management
    ├── transactions.js     Transaction logic
    ├── calendar.js         Calendar rendering
    ├── charts.js           Chart rendering
    ├── modals.js           Modal management
    ├── utils.js            Utility functions
    └── README.md           Module documentation
```

## Browser Compatibility

- Chrome 90+ (April 2021)
- Firefox 88+ (April 2021)
- Safari 14+ (September 2020)
- Edge 90+ (April 2021)

**Not supported:** Internet Explorer

## Features at a Glance

### Transaction Features
- Add/edit/delete income and expenses
- Recurring patterns: daily, weekly, bi-weekly, monthly
- Custom categories for organization
- Optional notes and descriptions
- Filter by date, category, type, or text search

### Visualization
- Monthly calendar with color-coded transactions
- 24-month balance projection chart
- Expense breakdown pie charts
- Historical balance trend analysis
- Weekly projection sidebar

### Data Management
- Automatic localStorage persistence
- JSON export for backups
- JSON import with duplicate detection
- Clear all data option
- Undo/redo support (50 steps)

### User Experience
- Light and dark themes
- Full keyboard navigation
- ARIA accessibility support
- Responsive design
- Tooltips and contextual help
- Smooth animations

## Privacy & Security

- **100% Local**: All data stays in your browser
- **No Tracking**: No analytics or external requests
- **No Account**: No registration or login required
- **No Cloud**: Data never sent to servers
- **Open Source**: Fully auditable codebase

## Architecture Highlights

- **Modular Design**: 7 focused ES6 modules
- **Zero Dependencies**: Pure vanilla JavaScript
- **Performance Optimized**: Caching, event delegation, debouncing
- **Clean Code**: No circular dependencies, single responsibility
- **Well Documented**: JSDoc comments throughout
- **Tested**: Smoke tests for module validation

## Version 1.0 Highlights

This release represents a complete refactoring from a monolithic 4,057-line `app.js` to a clean, modular architecture:

- **4,644 lines** of modular JavaScript (7 modules)
- **~13% code reduction** through better organization
- **Comprehensive caching** for performance
- **Full accessibility** with ARIA support
- **Production ready** with no known critical bugs

## Development

### File Sizes
- `utils.js`: 70 lines (1.9 KB)
- `state.js`: 459 lines (15 KB)
- `transactions.js`: 451 lines (15 KB)
- `calendar.js`: 199 lines (6.8 KB)
- `charts.js`: 1,044 lines (37 KB)
- `modals.js`: 174 lines (5.6 KB)
- `app.js`: 2,096 lines (74 KB)

### Testing
Run smoke tests by opening `smoke-test.html` in your browser to validate module structure and basic functionality.

## License

MIT License (or specify your license)

## Support

For detailed documentation, see `VERSION-1.0.md`.

For module-specific details, see `Scripts/README.md`.

---

**Budgie** - Simple, private, powerful budgeting. 🐦
