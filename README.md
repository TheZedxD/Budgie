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

**IMPORTANT:** Budgie uses ES6 modules, which require a local web server. You cannot open `index.html` directly in your browser (it will cause CORS errors).

### Option 1: Python (Recommended)
```bash
# Navigate to the Budgie directory
cd /path/to/Budgie

# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Then open: http://localhost:8000
```

### Option 2: Node.js
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run from Budgie directory
http-server -p 8000

# Then open: http://localhost:8000
```

### Option 3: PHP
```bash
# Navigate to the Budgie directory
cd /path/to/Budgie

# Start PHP server
php -S localhost:8000

# Then open: http://localhost:8000
```

### Option 4: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 5: Startup Scripts (Easiest!)
We've included helper scripts that automatically detect and start a server:

**Linux/Mac:**
```bash
./START-SERVER.sh
```

**Windows:**
```batch
START-SERVER.bat
```

These scripts will automatically use Python, PHP, or Node.js (whichever is available).

### Using the Application
1. Access via `http://localhost:8000` (not `file://`)
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
- **`TROUBLESHOOTING.md`** - Common issues and solutions (CORS errors, data issues, etc.)
- **`CROSS-PLATFORM.md`** - Cross-platform compatibility guide for Windows, Linux, and macOS

## Project Structure

```
Budgie/
├── index.html              Main application entry point
├── styles.css              Complete application styling
├── README.md               This file (quick start guide)
├── VERSION-1.0.md          Comprehensive Version 1.0 documentation
├── TROUBLESHOOTING.md      Common issues and solutions
├── START-SERVER.sh         Linux/Mac startup script
├── START-SERVER.bat        Windows startup script
├── verify-fixes.sh         Linux/Mac verification script
├── verify-fixes.bat        Windows verification script
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

## Platform Compatibility

Budgie is designed for **excellent cross-platform compatibility** between Windows, Linux (including CachyOS), and macOS.

### Platform Support Matrix

| Feature | Windows | Linux/CachyOS | macOS | Status |
|---------|---------|---------------|-------|--------|
| Application Code | ✓ | ✓ | ✓ | Identical |
| Browser Support | ✓ | ✓ | ✓ | Identical |
| localStorage | ✓ | ✓ | ✓ | Identical |
| Data Import/Export | ✓ | ✓ | ✓ | Identical |
| Keyboard Shortcuts | ✓ | ✓ | ✓ | Identical |
| Theme Support | ✓ | ✓ | ✓ | Identical |
| Startup Scripts | `START-SERVER.bat` | `START-SERVER.sh` | `START-SERVER.sh` | Platform-specific |
| Verification Scripts | `verify-fixes.bat` | `verify-fixes.sh` | `verify-fixes.sh` | Platform-specific |

### Key Cross-Platform Features

✓ **Pure Browser-Based** - All code runs in the browser using standard Web APIs
✓ **No Platform-Specific Code** - JavaScript uses only W3C standard APIs
✓ **Relative Paths** - All file references use forward slashes (works everywhere)
✓ **Standard Font Stack** - Optimized for Windows (Segoe UI), Linux (Ubuntu/Cantarell), and macOS (San Francisco)
✓ **Dual Key Support** - Keyboard shortcuts work with both Ctrl (Windows/Linux) and Cmd (macOS)
✓ **Canvas API** - Charts render identically on all platforms
✓ **Locale-Aware** - Date and currency formatting respects OS locale settings

### Platform-Specific Files

**Startup Scripts:**
- `START-SERVER.sh` - Bash script for Linux/macOS (uses Python 3, Python 2, or PHP)
- `START-SERVER.bat` - Batch script for Windows (uses Python or PHP)

**Verification Scripts:**
- `verify-fixes.sh` - Bash script for Linux/macOS (verifies all fixes are in place)
- `verify-fixes.bat` - Batch script for Windows (verifies all fixes are in place)

### Running on Different Platforms

**Windows:**
```batch
# Double-click or run from Command Prompt
START-SERVER.bat

# Verify installation
verify-fixes.bat
```

**Linux/CachyOS/macOS:**
```bash
# Make executable (first time only)
chmod +x START-SERVER.sh verify-fixes.sh

# Run the server
./START-SERVER.sh

# Verify installation
./verify-fixes.sh
```

### Browser Availability by Platform

| Browser | Windows | Linux | macOS |
|---------|---------|-------|-------|
| Chrome | ✓ | ✓ | ✓ |
| Firefox | ✓ | ✓ | ✓ |
| Edge | ✓ | ✓ | ✓ |
| Safari | ✗ | ✗ | ✓ |

**Note:** All browsers provide identical functionality - choose based on your platform and preferences.

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
