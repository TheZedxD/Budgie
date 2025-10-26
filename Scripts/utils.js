/**
 * Utility Functions Module
 * Common utility functions used throughout the application
 */

// Currency formatter instance
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

/**
 * Format a numeric value as currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
    const numeric = Number.isFinite(value) ? value : 0;
    return currencyFormatter.format(numeric);
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {*} value - The value to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Ensure a value is a Date object and normalize to midnight
 * @param {*} value - The value to convert to a Date
 * @returns {Date|null} Normalized Date object or null if invalid
 */
export function ensureDate(value) {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    date.setHours(0, 0, 0, 0);
    return date;
}

/**
 * Debounce a function call
 * @param {Function} fn - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, wait) {
    let timeoutId = null;
    return function(...args) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, wait);
    };
}
