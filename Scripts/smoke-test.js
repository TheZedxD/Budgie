/**
 * Smoke Test for Module Imports
 *
 * This script tests that each module can be imported in isolation
 * and exports the expected functions/objects.
 */

import * as utils from './utils.js';
import * as state from './state.js';
import * as transactions from './transactions.js';
import * as calendar from './calendar.js';
import * as charts from './charts.js';
import * as modals from './modals.js';

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertExists(obj, prop, moduleName) {
    assert(
        obj[prop] !== undefined,
        `${moduleName} should export ${prop}`
    );
}

// Test utils.js
test('utils.js exports expected functions', () => {
    assertExists(utils, 'formatCurrency', 'utils');
    assertExists(utils, 'escapeHtml', 'utils');
    assertExists(utils, 'ensureDate', 'utils');
    assertExists(utils, 'debounce', 'utils');

    // Test formatCurrency works
    const formatted = utils.formatCurrency(1234.56);
    assert(formatted === '$1,234.56', 'formatCurrency should format correctly');

    // Test escapeHtml works
    const escaped = utils.escapeHtml('<script>alert("xss")</script>');
    assert(!escaped.includes('<script>'), 'escapeHtml should escape HTML');

    // Test ensureDate works
    const date = utils.ensureDate('2024-01-15');
    assert(date instanceof Date, 'ensureDate should return Date object');
    assert(date.getHours() === 0, 'ensureDate should normalize to midnight');
});

// Test state.js
test('state.js exports expected objects and functions', () => {
    assertExists(state, 'STORAGE_KEYS', 'state');
    assertExists(state, 'DEFAULT_CATEGORY_LABEL', 'state');
    assertExists(state, 'DEFAULT_CATEGORIES', 'state');
    assertExists(state, 'state', 'state');
    assertExists(state, 'cache', 'state');
    assertExists(state, 'history', 'state');
    assertExists(state, 'invalidateCaches', 'state');
    assertExists(state, 'ensureCacheSync', 'state');
    assertExists(state, 'applyChange', 'state');
    assertExists(state, 'normalizeTagLabel', 'state');
    assertExists(state, 'ensureCategoriesStructure', 'state');
    assertExists(state, 'persistState', 'state');
    assertExists(state, 'loadState', 'state');

    // Test state structure
    assert(state.state.transactions !== undefined, 'state should have transactions array');
    assert(state.cache.version !== undefined, 'cache should have version');
    assert(state.history.past !== undefined, 'history should have past array');
});

// Test transactions.js
test('transactions.js exports expected functions', () => {
    assertExists(transactions, 'filterTransactions', 'transactions');
    assertExists(transactions, 'getTransactionsForDate', 'transactions');
    assertExists(transactions, 'calculateBalanceForDate', 'transactions');
    assertExists(transactions, 'isIncomeType', 'transactions');
    assertExists(transactions, 'occursOnDate', 'transactions');
    assertExists(transactions, 'getProjectedMonthlyBalances', 'transactions');
    assertExists(transactions, 'getMonthlyExpenseBreakdown', 'transactions');
    assertExists(transactions, 'DAY_IN_MS', 'transactions');

    // Test isIncomeType
    assert(transactions.isIncomeType('paycheck') === true, 'paycheck should be income type');
    assert(transactions.isIncomeType('expense') === false, 'expense should not be income type');
});

// Test calendar.js
test('calendar.js exports expected functions and constants', () => {
    assertExists(calendar, 'renderCalendar', 'calendar');
    assertExists(calendar, 'createDayCell', 'calendar');
    assertExists(calendar, 'MONTH_NAMES', 'calendar');
    assertExists(calendar, 'DAY_HEADERS', 'calendar');

    // Test constants
    assert(Array.isArray(calendar.MONTH_NAMES), 'MONTH_NAMES should be an array');
    assert(calendar.MONTH_NAMES.length === 12, 'MONTH_NAMES should have 12 months');
    assert(Array.isArray(calendar.DAY_HEADERS), 'DAY_HEADERS should be an array');
    assert(calendar.DAY_HEADERS.length === 7, 'DAY_HEADERS should have 7 days');
});

// Test charts.js
test('charts.js exports expected functions', () => {
    assertExists(charts, 'resizeCanvas', 'charts');
    assertExists(charts, 'renderReportsLineChart', 'charts');
    assertExists(charts, 'renderReportsPieChart', 'charts');
    assertExists(charts, 'renderHistoricalLineChart', 'charts');
    assertExists(charts, 'renderHistoricalPieChart', 'charts');
    assertExists(charts, 'reportsState', 'charts');
    assertExists(charts, 'historicalReportsState', 'charts');
});

// Test modals.js
test('modals.js exports expected functions', () => {
    assertExists(modals, 'openModal', 'modals');
    assertExists(modals, 'closeModal', 'modals');
    assertExists(modals, 'closeAllModals', 'modals');
    assertExists(modals, 'setOverlayVisibility', 'modals');
    assertExists(modals, 'getFocusableElements', 'modals');
});

// Run all tests
console.log('🧪 Running module smoke tests...\n');

tests.forEach(({ name, fn }) => {
    try {
        fn();
        passed++;
        console.log(`✅ ${name}`);
    } catch (error) {
        failed++;
        console.error(`❌ ${name}`);
        console.error(`   ${error.message}`);
    }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('✨ All module smoke tests passed!');
} else {
    console.error(`⚠️  ${failed} test(s) failed`);
    throw new Error('Smoke tests failed');
}
