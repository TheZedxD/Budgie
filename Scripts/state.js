/**
 * State Management Module
 * Handles application state, caching, history, and persistence
 */

import { ensureDate } from './utils.js';

// Storage keys for localStorage
export const STORAGE_KEYS = {
    transactions: 'budgetTransactions',
    balance: 'startingBalance',
    balanceDate: 'startingBalanceDate',
    theme: 'budgetTheme',
    categories: 'budgetCategories'
};

// Default categories
export const DEFAULT_CATEGORY_LABEL = 'Uncategorized';
export const DEFAULT_CATEGORIES = {
    expense: [DEFAULT_CATEGORY_LABEL, 'Housing', 'Utilities', 'Groceries', 'Transportation', 'Entertainment'],
    income: [DEFAULT_CATEGORY_LABEL, 'Salary', 'Bonus', 'Other']
};

// Application state
export const state = {
    currentDate: new Date(),
    today: new Date(),
    transactions: [],
    startingBalance: 0,
    startingBalanceDate: null,
    contextMenuDate: null,
    editingTransactionIndex: null,
    transactionsModalReturn: false,
    cacheVersion: 0,
    categories: {
        expense: [],
        income: []
    },
    filter: {
        searchTerm: '',
        category: '',
        type: '',
        startDate: null,
        endDate: null
    }
};

// Cache for computed values
export const cache = {
    version: 0,
    transactionsByDate: new Map(),
    balanceByDate: new Map(),
    balanceComputedUntil: null
};

// Undo/redo history
export const history = {
    past: [],
    future: [],
    maxSize: 50
};

// Callbacks for state changes (to be set by app.js)
let onStateChangeCallbacks = {
    invalidateCaches: null,
    renderCalendar: null,
    updateSummary: null,
    persistState: null
};

/**
 * Register callbacks for state changes
 * @param {Object} callbacks - Object containing callback functions
 */
export function registerStateCallbacks(callbacks) {
    onStateChangeCallbacks = { ...onStateChangeCallbacks, ...callbacks };
}

/**
 * Invalidate all caches
 */
export function invalidateCaches() {
    state.cacheVersion += 1;
    cache.version = state.cacheVersion;
    cache.transactionsByDate.clear();
    cache.balanceByDate.clear();
    cache.balanceComputedUntil = null;
}

/**
 * Ensure cache is synchronized with state
 */
export function ensureCacheSync() {
    if (cache.version !== state.cacheVersion) {
        cache.transactionsByDate.clear();
        cache.balanceByDate.clear();
        cache.balanceComputedUntil = null;
        cache.version = state.cacheVersion;
    }
}

// State manager for batch mutations
const stateManager = (() => {
    let opId = 0;
    let pendingBatch = null;
    let batchCallbacks = [];

    function applyChange(fn) {
        batchCallbacks.push(fn);

        if (!pendingBatch) {
            pendingBatch = Promise.resolve().then(() => {
                const callbacks = batchCallbacks.slice();
                batchCallbacks = [];
                pendingBatch = null;

                // Execute all batched mutations
                callbacks.forEach(cb => cb());

                // Increment opId and invalidate caches
                opId += 1;
                state.cacheVersion = opId;
                cache.version = opId;
                cache.transactionsByDate.clear();
                cache.balanceByDate.clear();
                cache.balanceComputedUntil = null;
            });
        }

        return pendingBatch;
    }

    function assertVersion(expectedVersion) {
        if (cache.version !== expectedVersion) {
            throw new Error(`Cache version mismatch: expected ${expectedVersion}, got ${cache.version}`);
        }
    }

    function getCurrentVersion() {
        return cache.version;
    }

    return {
        applyChange,
        assertVersion,
        getCurrentVersion
    };
})();

export const { applyChange, assertVersion, getCurrentVersion } = stateManager;

/**
 * Normalize a tag/category label
 * @param {string} label - The label to normalize
 * @returns {string} Normalized label
 */
export function normalizeTagLabel(label) {
    if (typeof label !== 'string') {
        return '';
    }
    return label.trim().slice(0, 64);
}

/**
 * Ensure categories structure is valid
 * @param {Object} value - Categories object to validate
 * @returns {Object} Valid categories structure
 */
export function ensureCategoriesStructure(value) {
    const result = {
        expense: [],
        income: []
    };
    const types = ['expense', 'income'];
    if (value && typeof value === 'object') {
        types.forEach(type => {
            const source = Array.isArray(value[type]) ? value[type] : [];
            source.forEach(label => {
                const normalized = normalizeTagLabel(label);
                if (!normalized) {
                    return;
                }
                const exists = result[type].some(entry => entry.toLowerCase() === normalized.toLowerCase());
                if (!exists) {
                    result[type].push(normalized);
                }
            });
        });
    }

    types.forEach(type => {
        DEFAULT_CATEGORIES[type].forEach(label => {
            const exists = result[type].some(entry => entry.toLowerCase() === label.toLowerCase());
            if (!exists) {
                result[type].push(label);
            }
        });
        const withoutDefault = result[type].filter(label => label.toLowerCase() !== DEFAULT_CATEGORY_LABEL.toLowerCase());
        withoutDefault.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        result[type] = [DEFAULT_CATEGORY_LABEL, ...withoutDefault];
    });

    return result;
}

/**
 * Sort categories within a group
 * @param {string} group - The group to sort ('expense' or 'income')
 */
export function sortCategoriesInGroup(group) {
    const bucket = Array.isArray(state.categories[group]) ? state.categories[group] : [];
    const defaultLower = DEFAULT_CATEGORY_LABEL.toLowerCase();
    const unique = new Map();
    bucket.forEach(label => {
        const normalized = normalizeTagLabel(label);
        if (!normalized) {
            return;
        }
        const lower = normalized.toLowerCase();
        if (lower === defaultLower) {
            return;
        }
        if (!unique.has(lower)) {
            unique.set(lower, normalized);
        }
    });
    const sorted = Array.from(unique.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    state.categories[group] = [DEFAULT_CATEGORY_LABEL, ...sorted];
}

/**
 * Persist categories to localStorage
 */
export function persistCategories() {
    try {
        localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.categories));
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            const message = 'Storage limit exceeded! Your browser has run out of space to save categories.\n\n' +
                           'To fix this:\n' +
                           '1. Export your data (Settings → Export Data)\n' +
                           '2. Clear old transactions you no longer need\n' +
                           '3. Clear browser data for other sites\n' +
                           '4. Try using a different browser';
            alert(message);
            console.error('QuotaExceededError saving categories:', error);
        } else {
            console.error('Error saving categories:', error);
        }
    }
}

/**
 * Save a snapshot of current state for undo functionality
 */
export function saveStateSnapshot() {
    const snapshot = {
        transactions: JSON.parse(JSON.stringify(state.transactions.map(t => ({
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date?.toISOString(),
            frequency: t.frequency,
            category: t.category
        })))),
        startingBalance: state.startingBalance,
        startingBalanceDate: state.startingBalanceDate?.toISOString() || null
    };

    history.past.push(snapshot);

    if (history.past.length > history.maxSize) {
        history.past.shift();
    }

    history.future = [];
}

/**
 * Restore a snapshot
 * @param {Object} snapshot - The snapshot to restore
 */
function restoreSnapshot(snapshot) {
    state.transactions = snapshot.transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: new Date(t.date),
        frequency: t.frequency,
        category: t.category
    }));

    state.startingBalance = snapshot.startingBalance;
    state.startingBalanceDate = snapshot.startingBalanceDate ? new Date(snapshot.startingBalanceDate) : null;

    invalidateCaches();
    if (onStateChangeCallbacks.renderCalendar) onStateChangeCallbacks.renderCalendar();
    if (onStateChangeCallbacks.updateSummary) onStateChangeCallbacks.updateSummary();
    if (onStateChangeCallbacks.persistState) onStateChangeCallbacks.persistState();
}

/**
 * Undo the last state change
 * @returns {boolean} True if undo was successful
 */
export function undo() {
    if (history.past.length === 0) {
        return false;
    }

    const currentSnapshot = {
        transactions: JSON.parse(JSON.stringify(state.transactions.map(t => ({
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date?.toISOString(),
            frequency: t.frequency,
            category: t.category
        })))),
        startingBalance: state.startingBalance,
        startingBalanceDate: state.startingBalanceDate?.toISOString() || null
    };
    history.future.push(currentSnapshot);

    const previousSnapshot = history.past.pop();
    restoreSnapshot(previousSnapshot);

    return true;
}

/**
 * Redo a previously undone state change
 * @returns {boolean} True if redo was successful
 */
export function redo() {
    if (history.future.length === 0) {
        return false;
    }

    const currentSnapshot = {
        transactions: JSON.parse(JSON.stringify(state.transactions.map(t => ({
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date?.toISOString(),
            frequency: t.frequency,
            category: t.category
        })))),
        startingBalance: state.startingBalance,
        startingBalanceDate: state.startingBalanceDate?.toISOString() || null
    };
    history.past.push(currentSnapshot);

    const nextSnapshot = history.future.pop();
    restoreSnapshot(nextSnapshot);

    return true;
}

/**
 * Load state from localStorage
 * @param {Function} ensureTransactionCategoriesFn - Function to ensure transaction categories
 */
export function loadState(ensureTransactionCategoriesFn) {
    try {
        const savedTransactions = localStorage.getItem(STORAGE_KEYS.transactions);
        const savedBalance = localStorage.getItem(STORAGE_KEYS.balance);
        const savedBalanceDate = localStorage.getItem(STORAGE_KEYS.balanceDate);
        const savedCategories = localStorage.getItem(STORAGE_KEYS.categories);

        if (savedTransactions) {
            const parsed = JSON.parse(savedTransactions);
            state.transactions = Array.isArray(parsed)
                ? parsed
                    .map(entry => ({
                        type: entry.type === 'income' ? 'paycheck' : entry.type,
                        amount: Number.parseFloat(entry.amount) || 0,
                        description: entry.description || '',
                        date: ensureDate(entry.date),
                        frequency: entry.frequency || 'once',
                        category: normalizeTagLabel(entry.category || entry.tag || '')
                    }))
                    .filter(entry => entry.date)
                : [];
            state.transactions.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
        }

        if (savedBalance) {
            const numeric = Number.parseFloat(savedBalance);
            state.startingBalance = Number.isFinite(numeric) ? numeric : 0;
        }

        if (savedBalanceDate) {
            const parsedDate = ensureDate(savedBalanceDate);
            state.startingBalanceDate = parsedDate;
        } else {
            state.startingBalanceDate = null;
        }

        if (savedCategories) {
            const parsedCategories = JSON.parse(savedCategories);
            state.categories = ensureCategoriesStructure(parsedCategories);
        } else {
            state.categories = ensureCategoriesStructure(DEFAULT_CATEGORIES);
            persistCategories();
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
        state.transactions = [];
        state.startingBalance = 0;
        state.startingBalanceDate = null;
        state.categories = ensureCategoriesStructure(DEFAULT_CATEGORIES);
    }
    if (ensureTransactionCategoriesFn) ensureTransactionCategoriesFn();
    invalidateCaches();
}

/**
 * Persist state to localStorage
 */
export function persistState() {
    const opId = Date.now();
    try {
        const serialized = JSON.stringify(state.transactions.map(item => ({
            type: item.type,
            amount: item.amount,
            description: item.description,
            date: item.date?.toISOString(),
            frequency: item.frequency,
            category: item.category
        })));
        localStorage.setItem(STORAGE_KEYS.transactions, serialized);
        localStorage.setItem(STORAGE_KEYS.balance, state.startingBalance.toString());
        if (state.startingBalanceDate) {
            localStorage.setItem(STORAGE_KEYS.balanceDate, state.startingBalanceDate.toISOString());
        } else {
            localStorage.removeItem(STORAGE_KEYS.balanceDate);
        }
        persistCategories();
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            const message = 'Storage limit exceeded! Your browser has run out of space to save data.\n\n' +
                           'To fix this:\n' +
                           '1. Export your data (Settings → Export Data)\n' +
                           '2. Clear old transactions you no longer need\n' +
                           '3. Clear browser data for other sites\n' +
                           '4. Try using a different browser';
            alert(message);
            console.error(`[OpID ${opId}] QuotaExceededError:`, error);
        } else {
            console.error(`[OpID ${opId}] Unexpected error saving data:`, error);
            alert('An unexpected error occurred while saving your data. Please check the console for details.');
        }
    }
}

/**
 * Clear all stored data from localStorage
 */
export function clearStoredData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.transactions);
        localStorage.removeItem(STORAGE_KEYS.balance);
        localStorage.removeItem(STORAGE_KEYS.balanceDate);
        localStorage.removeItem(STORAGE_KEYS.theme);
        localStorage.removeItem(STORAGE_KEYS.categories);
    } catch (error) {
        console.error('Error clearing stored data:', error);
    }
}
