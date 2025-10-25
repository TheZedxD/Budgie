/**
 * Transaction Operations Module
 * Handles transaction filtering, date calculations, and balance computations
 */

import { ensureDate, formatCurrency } from './utils.js';
import { state, cache, ensureCacheSync, invalidateCaches, DEFAULT_CATEGORY_LABEL } from './state.js';

// Constants
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Format a date as YYYY-MM-DD key for caching
 * @param {Date} date - The date to format
 * @returns {string} Formatted date key
 */
export function formatDateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}

/**
 * Check if a transaction type is income
 * @param {string} type - The transaction type
 * @returns {boolean} True if the type is income
 */
export function isIncomeType(type) {
    return type === 'income' || type === 'paycheck';
}

/**
 * Get the category group for a transaction type
 * @param {string} type - The transaction type
 * @returns {string} The category group ('income' or 'expense')
 */
export function getCategoryGroupForTransactionType(type) {
    return isIncomeType(type) ? 'income' : 'expense';
}

/**
 * Check if a transaction occurs on a specific date based on its frequency
 * @param {Object} transaction - The transaction object
 * @param {Date} date - The date to check
 * @returns {boolean} True if the transaction occurs on this date
 */
export function occursOnDate(transaction, date) {
    const target = ensureDate(date);
    const start = ensureDate(transaction?.date);

    if (!target || !start) {
        return false;
    }

    const daysDiff = Math.round((target.getTime() - start.getTime()) / DAY_IN_MS);
    if (Number.isNaN(daysDiff) || daysDiff < 0) {
        return false;
    }

    switch (transaction.frequency) {
        case 'once':
            return daysDiff === 0;
        case 'daily':
            return true;
        case 'weekly':
            return daysDiff % 7 === 0;
        case 'biweekly':
            return daysDiff % 14 === 0;
        case 'monthly': {
            if (target.getDate() === start.getDate()) return true;
            const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
            if (start.getDate() > last) return target.getDate() === last;
            return false;
        }
        default:
            return false;
    }
}

/**
 * Filter transactions based on search term and options
 * @param {string} searchTerm - The search term to match
 * @param {Object} options - Filter options (category, type, startDate, endDate)
 * @returns {Array} Filtered transactions
 */
export function filterTransactions(searchTerm = '', options = {}) {
    const { category = '', type = '', startDate = null, endDate = null } = options;

    return state.transactions.filter(transaction => {
        // Search term match (fuzzy text match on description and amount)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const descMatch = (transaction.description || '').toLowerCase().includes(term);
            const amountMatch = transaction.amount.toString().includes(term);
            const categoryMatch = (transaction.category || '').toLowerCase().includes(term);

            if (!descMatch && !amountMatch && !categoryMatch) {
                return false;
            }
        }

        // Category filter
        if (category && transaction.category !== category) {
            return false;
        }

        // Type filter
        if (type) {
            if (type === 'income' && !isIncomeType(transaction.type)) {
                return false;
            }
            if (type === 'expense' && isIncomeType(transaction.type)) {
                return false;
            }
        }

        // Date range filter
        if (startDate || endDate) {
            const transactionDate = ensureDate(transaction.date);
            if (!transactionDate) {
                return false;
            }

            if (startDate) {
                const start = ensureDate(startDate);
                if (start && transactionDate < start) {
                    return false;
                }
            }

            if (endDate) {
                const end = ensureDate(endDate);
                if (end && transactionDate > end) {
                    return false;
                }
            }
        }

        return true;
    });
}

/**
 * Apply filter to the global state and trigger re-renders
 * @param {string} searchTerm - The search term
 * @param {Object} options - Filter options
 * @param {Function} renderCalendar - Callback to render calendar
 * @param {Function} updateSummary - Callback to update summary
 */
export function applyFilter(searchTerm = '', options = {}, renderCalendar, updateSummary) {
    state.filter.searchTerm = searchTerm;
    state.filter.category = options.category || '';
    state.filter.type = options.type || '';
    state.filter.startDate = options.startDate || null;
    state.filter.endDate = options.endDate || null;

    // Invalidate caches and re-render
    invalidateCaches();
    if (renderCalendar) renderCalendar();
    if (updateSummary) updateSummary();
}

/**
 * Clear all filters and trigger re-renders
 * @param {Function} renderCalendar - Callback to render calendar
 * @param {Function} updateSummary - Callback to update summary
 */
export function clearFilter(renderCalendar, updateSummary) {
    state.filter.searchTerm = '';
    state.filter.category = '';
    state.filter.type = '';
    state.filter.startDate = null;
    state.filter.endDate = null;

    // Invalidate caches and re-render
    invalidateCaches();
    if (renderCalendar) renderCalendar();
    if (updateSummary) updateSummary();
}

/**
 * Get currently filtered transactions based on state.filter
 * @returns {Array} Filtered transactions
 */
export function getFilteredTransactions() {
    if (!state.filter.searchTerm && !state.filter.category &&
        !state.filter.type && !state.filter.startDate && !state.filter.endDate) {
        return state.transactions;
    }

    return filterTransactions(state.filter.searchTerm, {
        category: state.filter.category,
        type: state.filter.type,
        startDate: state.filter.startDate,
        endDate: state.filter.endDate
    });
}

/**
 * Get all transactions that occur on a specific date
 * @param {Date} date - The date to check
 * @returns {Array} Transactions occurring on this date
 */
export function getTransactionsForDate(date) {
    const normalized = ensureDate(date);
    if (!normalized) {
        return [];
    }

    const effectiveStart = ensureDate(state.startingBalanceDate);
    if (effectiveStart && normalized < effectiveStart) {
        return [];
    }

    ensureCacheSync();
    const key = formatDateKey(normalized);
    if (cache.transactionsByDate.has(key)) {
        return cache.transactionsByDate.get(key);
    }

    const result = state.transactions.filter(transaction => occursOnDate(transaction, normalized));
    cache.transactionsByDate.set(key, result);
    return result;
}

/**
 * Get all transaction occurrences in a given month
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {Array} Array of transaction occurrences with index, transaction, and occurrenceDate
 */
export function getMonthlyTransactionOccurrences(year, month) {
    const occurrences = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const dayTransactions = getTransactionsForDate(date);
        dayTransactions.forEach(transaction => {
            const index = state.transactions.indexOf(transaction);
            if (index === -1) {
                return;
            }
            occurrences.push({
                index,
                transaction,
                occurrenceDate: ensureDate(date)
            });
        });
    }

    occurrences.sort((a, b) => {
        const diff = (a.occurrenceDate?.getTime() || 0) - (b.occurrenceDate?.getTime() || 0);
        if (diff !== 0) {
            return diff;
        }
        return a.index - b.index;
    });

    return occurrences;
}

/**
 * Calculate the balance for a specific date
 * @param {Date} date - The date to calculate balance for
 * @returns {number} The balance on this date
 */
export function calculateBalanceForDate(date) {
    const normalized = ensureDate(date);
    if (!normalized) {
        return state.startingBalance;
    }

    const startDate = ensureDate(state.startingBalanceDate);
    if (startDate && normalized < startDate) {
        return state.startingBalance;
    }

    if (!state.transactions.length) {
        return state.startingBalance;
    }

    ensureCacheSync();
    const key = formatDateKey(normalized);
    if (cache.balanceByDate.has(key)) {
        return cache.balanceByDate.get(key);
    }

    const earliestTransaction = ensureDate(state.transactions[0]?.date);
    const effectiveStart = (() => {
        if (startDate && earliestTransaction) {
            return startDate <= earliestTransaction ? startDate : earliestTransaction;
        }
        return startDate || earliestTransaction;
    })();

    if (!effectiveStart || normalized < effectiveStart) {
        cache.balanceByDate.set(key, state.startingBalance);
        return state.startingBalance;
    }

    if (!cache.balanceComputedUntil || cache.balanceComputedUntil < effectiveStart) {
        const baseline = new Date(effectiveStart);
        baseline.setDate(baseline.getDate() - 1);
        cache.balanceComputedUntil = baseline;
        cache.balanceByDate.set(formatDateKey(baseline), state.startingBalance);
    }

    const baselineKey = formatDateKey(cache.balanceComputedUntil);
    let runningBalance = cache.balanceByDate.get(baselineKey);
    if (!Number.isFinite(runningBalance)) {
        runningBalance = state.startingBalance;
        cache.balanceByDate.set(baselineKey, runningBalance);
    }

    while (cache.balanceComputedUntil < normalized) {
        const nextDate = new Date(cache.balanceComputedUntil);
        nextDate.setDate(nextDate.getDate() + 1);
        const dayTransactions = getTransactionsForDate(nextDate);
        let delta = 0;
        dayTransactions.forEach(transaction => {
            delta += isIncomeType(transaction.type) ? transaction.amount : -transaction.amount;
        });
        runningBalance += delta;
        const nextKey = formatDateKey(nextDate);
        cache.balanceByDate.set(nextKey, runningBalance);
        cache.balanceComputedUntil = nextDate;
    }

    return cache.balanceByDate.get(key) ?? state.startingBalance;
}

/**
 * Get projected monthly balances for the next N months
 * @param {number} monthCount - Number of months to project
 * @returns {Array} Array of {label, value, date} objects
 */
export function getProjectedMonthlyBalances(monthCount = 24) {
    const results = [];
    if (!Number.isInteger(monthCount) || monthCount <= 0) {
        return results;
    }

    const base = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), 1);
    for (let offset = 0; offset < monthCount; offset += 1) {
        const periodEnd = new Date(base.getFullYear(), base.getMonth() + offset + 1, 0);
        const value = calculateBalanceForDate(periodEnd);
        results.push({
            label: periodEnd.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
            value,
            date: periodEnd
        });
    }
    return results;
}

/**
 * Get monthly expense breakdown by category for the current month
 * @returns {Array} Array of {label, value} objects sorted by value descending
 */
export function getMonthlyExpenseBreakdown() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const occurrences = getMonthlyTransactionOccurrences(year, month);
    const breakdown = new Map();

    occurrences.forEach(entry => {
        const { transaction } = entry;
        if (!transaction || isIncomeType(transaction.type)) {
            return;
        }
        const key = (transaction.category && transaction.category.trim()) || DEFAULT_CATEGORY_LABEL;
        const amount = Number.isFinite(transaction.amount) ? transaction.amount : 0;
        breakdown.set(key, (breakdown.get(key) || 0) + amount);
    });

    return Array.from(breakdown.entries())
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Get daily summaries for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of daily summary objects with date, income, expenses, balance
 */
export function getDateRangeDailySummaries(startDate, endDate) {
    const start = ensureDate(startDate);
    const end = ensureDate(endDate);
    if (!start || !end || end < start) {
        return [];
    }
    const summaries = [];
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
        const dayTransactions = getTransactionsForDate(cursor);
        let income = 0;
        let expenses = 0;
        dayTransactions.forEach(transaction => {
            if (isIncomeType(transaction.type)) {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });
        const balance = calculateBalanceForDate(cursor);
        summaries.push({
            date: new Date(cursor),
            income,
            expenses,
            balance
        });
        cursor.setDate(cursor.getDate() + 1);
    }
    return summaries;
}

/**
 * Get expense breakdown by category for a date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of {label, value} objects sorted by value descending
 */
export function getDateRangeExpenseBreakdown(startDate, endDate) {
    const start = ensureDate(startDate);
    const end = ensureDate(endDate);
    if (!start || !end || end < start) {
        return [];
    }
    const breakdown = new Map();
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
        const dayTransactions = getTransactionsForDate(cursor);
        dayTransactions.forEach(transaction => {
            if (isIncomeType(transaction.type)) {
                return;
            }
            const category = (transaction.category && transaction.category.trim()) || DEFAULT_CATEGORY_LABEL;
            breakdown.set(category, (breakdown.get(category) || 0) + transaction.amount);
        });
        cursor.setDate(cursor.getDate() + 1);
    }
    return Array.from(breakdown.entries())
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
}
