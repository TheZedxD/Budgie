# Budgie Scripts - Module Documentation

This directory contains the modular JavaScript architecture for the Budgie budgeting application.

## Module Structure

### 📦 Core Modules

#### `utils.js` (70 lines)
**Purpose:** Common utility functions used throughout the application

**Exports:**
- `formatCurrency(value)` - Format numbers as USD currency
- `escapeHtml(value)` - Sanitize HTML to prevent XSS
- `ensureDate(value)` - Convert values to normalized Date objects
- `debounce(fn, wait)` - Debounce function calls

**Dependencies:** None

---

#### `state.js` (459 lines)
**Purpose:** Application state management, caching, history, and persistence

**Exports:**
- `STORAGE_KEYS` - LocalStorage key constants
- `DEFAULT_CATEGORY_LABEL` - Default category name
- `DEFAULT_CATEGORIES` - Default expense/income categories
- `state` - Global application state object
- `cache` - Performance cache for computed values
- `history` - Undo/redo history
- `invalidateCaches()` - Clear all cached values
- `ensureCacheSync()` - Sync cache with state version
- `applyChange(fn)` - Batch state mutations
- `normalizeTagLabel(label)` - Normalize category labels
- `ensureCategoriesStructure(value)` - Validate category structure
- `sortCategoriesInGroup(group)` - Sort categories alphabetically
- `persistCategories()` - Save categories to localStorage
- `saveStateSnapshot()` - Save state for undo functionality
- `undo()` - Undo last state change
- `redo()` - Redo previously undone change
- `loadState(fn)` - Load state from localStorage
- `persistState()` - Save state to localStorage
- `clearStoredData()` - Clear all localStorage data
- `registerStateCallbacks(callbacks)` - Register UI update callbacks

**Dependencies:** `utils.js`

---

#### `transactions.js` (451 lines)
**Purpose:** Transaction CRUD operations, filtering, calculations, and projections

**Exports:**
- `DAY_IN_MS` - Milliseconds in a day constant
- `filterTransactions(searchTerm, options)` - Filter transactions by criteria
- `applyFilter(searchTerm, options)` - Apply global filter
- `clearFilter()` - Clear all filters
- `getFilteredTransactions()` - Get currently filtered transactions
- `getTransactionsForDate(date)` - Get transactions for specific date
- `getMonthlyTransactionOccurrences(year, month)` - Get monthly occurrences
- `calculateBalanceForDate(date)` - Calculate balance for date (cached)
- `getProjectedMonthlyBalances(count)` - Project future balances
- `getMonthlyExpenseBreakdown()` - Get expense breakdown by category
- `getDateRangeDailySummaries(start, end)` - Get daily summaries for range
- `getDateRangeExpenseBreakdown(start, end)` - Get expense breakdown for range
- `isIncomeType(type)` - Check if transaction type is income
- `occursOnDate(transaction, date)` - Check if transaction occurs on date
- `getCategoryGroupForTransactionType(type)` - Get category group
- `formatDateKey(date)` - Format date as YYYY-MM-DD

**Dependencies:** `utils.js`, `state.js`

---

#### `calendar.js` (199 lines)
**Purpose:** Calendar rendering with event delegation

**Exports:**
- `MONTH_NAMES` - Array of month names
- `DAY_HEADERS` - Array of day abbreviations
- `renderCalendar(elements, callbacks)` - Render calendar grid
- `createDayCell(day, date, options)` - Create day cell element

**Dependencies:** `utils.js`, `state.js`, `transactions.js`

---

#### `charts.js` (1,044 lines)
**Purpose:** Chart rendering (line/bar/pie charts) with interactive tooltips

**Exports:**

*Core Functions:*
- `resizeCanvas(canvas)` - Resize canvas with DPI scaling

*Reports Charts:*
- `renderReportsLineChart(elements)` - Render 24-month projection chart
- `renderReportsPieChart(elements)` - Render monthly expense pie chart
- `handleReportsLineHover(event, elements)` - Line chart hover handler
- `handleReportsPieHover(event, elements)` - Pie chart hover handler
- `initializeReportsInteractivity(elements)` - Initialize chart events
- `showReportsTooltip(content, x, y, elements)` - Show tooltip
- `hideReportsTooltip(elements)` - Hide tooltip

*Historical Charts:*
- `renderHistoricalLineChart(elements, range)` - Render historical balance chart
- `renderHistoricalPieChart(elements, range)` - Render historical expense chart
- `initializeHistoricalReportsInteractivity(elements)` - Initialize events
- `showHistoricalReportsTooltip(content, x, y, elements)` - Show tooltip
- `hideHistoricalReportsTooltip(elements)` - Hide tooltip

*State:*
- `reportsState` - Reports modal chart state
- `historicalReportsState` - Historical reports chart state

**Dependencies:** `utils.js`, `state.js`, `transactions.js`

---

#### `modals.js` (174 lines)
**Purpose:** Modal window management with accessibility features

**Exports:**
- `openModal(modal, allModals, overlayEl)` - Open modal with focus trap
- `closeModal(modal, overlayEl)` - Close modal and restore focus
- `closeAllModals(allModals, overlayEl)` - Close all modals
- `setOverlayVisibility(args)` - Update overlay visibility
- `getFocusableElements(modal)` - Get focusable elements in modal
- `handleModalTabTrap(event, modal)` - Handle tab key for accessibility

**Dependencies:** `charts.js` (for tooltip cleanup)

---

#### `app.js` (2,096 lines)
**Purpose:** Main application bootstrap and UI coordination

**Features:**
- DOM element references
- Event listener registration
- UI component coordination
- Category management UI
- Transaction modal handling
- Settings management
- Theme management
- Tooltip system
- Loading states
- Import/Export functionality
- Application initialization

**Dependencies:** All other modules

---

### 🧪 Testing

#### `smoke-test.js` (151 lines)
**Purpose:** Verify module structure and basic functionality

**Tests:**
- Module import isolation
- Expected exports exist
- Basic function behavior
- State structure integrity

**Usage:**
```bash
# Open in browser
open smoke-test.html
```

---

## Module Dependency Graph

```
app.js
  ├─→ utils.js
  ├─→ state.js
  │     └─→ utils.js
  ├─→ transactions.js
  │     ├─→ utils.js
  │     └─→ state.js
  ├─→ calendar.js
  │     ├─→ utils.js
  │     ├─→ state.js
  │     └─→ transactions.js
  ├─→ charts.js
  │     ├─→ utils.js
  │     ├─→ state.js
  │     └─→ transactions.js
  └─→ modals.js
        └─→ charts.js
```

---

## File Sizes

| Module | Lines | Size |
|--------|-------|------|
| utils.js | 70 | 1.9 KB |
| state.js | 459 | 15 KB |
| transactions.js | 451 | 15 KB |
| calendar.js | 199 | 6.8 KB |
| charts.js | 1,044 | 37 KB |
| modals.js | 174 | 5.6 KB |
| app.js | 2,096 | 74 KB |
| **Total** | **4,644** | **~156 KB** |

---

## Integration

### HTML
```html
<script type="module" src="Scripts/app.js"></script>
```

### Key Features
- ✅ ES6 module format
- ✅ Proper dependency management
- ✅ No circular dependencies
- ✅ Clear separation of concerns
- ✅ Fully documented with JSDoc
- ✅ Smoke tests for validation

---

## Migration from Monolithic `app.js`

The original monolithic `app.js` (4,057 lines) has been refactored into 7 focused modules with the following benefits:

1. **Maintainability** - Each module has a single responsibility
2. **Testability** - Modules can be tested in isolation
3. **Reusability** - Functions are properly exported and importable
4. **Performance** - Better tree-shaking and code splitting potential
5. **Developer Experience** - Easier to navigate and understand

---

## Development

### Adding New Features

1. Determine which module the feature belongs to
2. Add functions to appropriate module
3. Export new functions
4. Import in `app.js` or other modules as needed
5. Update smoke tests if needed

### Best Practices

- Keep modules focused on single responsibility
- Avoid circular dependencies
- Document all exports with JSDoc
- Use named exports (not default exports)
- Handle errors gracefully
- Maintain backward compatibility
