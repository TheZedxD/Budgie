/**
 * Calendar Rendering Module
 * Handles calendar grid rendering with event delegation
 */

import { formatCurrency, escapeHtml } from './utils.js';
import { state, DEFAULT_CATEGORY_LABEL } from './state.js';
import {
    getTransactionsForDate,
    calculateBalanceForDate,
    isIncomeType
} from './transactions.js';

// Constants
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get tooltip content for a day cell
 * @param {Date} date - The date to get tooltip for
 * @returns {string} HTML tooltip content
 */
function getDayTooltipContent(date) {
    const normalized = date instanceof Date ? new Date(date.getTime()) : new Date(date);
    normalized.setHours(0, 0, 0, 0);

    const transactionsForDay = getTransactionsForDate(normalized);
    let dayIncome = 0;
    let dayExpenses = 0;
    transactionsForDay.forEach(transaction => {
        if (isIncomeType(transaction.type)) {
            dayIncome += transaction.amount;
        } else {
            dayExpenses += transaction.amount;
        }
    });

    const net = dayIncome - dayExpenses;
    const dateLabel = normalized.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const metaLabel = transactionsForDay.length
        ? `${transactionsForDay.length} ${transactionsForDay.length === 1 ? 'transaction' : 'transactions'}`
        : '';
    const metaMarkup = transactionsForDay.length
        ? `<div class="tooltip-meta">${escapeHtml(metaLabel)}</div>`
        : '<div class="tooltip-empty">No transactions yet</div>';

    return `
        <div class="tooltip-title">${escapeHtml(dateLabel)}</div>
        <div class="tooltip-row">
            <span>Income</span>
            <span class="tooltip-positive">${escapeHtml(formatCurrency(dayIncome))}</span>
        </div>
        <div class="tooltip-row">
            <span>Expenses</span>
            <span class="tooltip-negative">${escapeHtml(formatCurrency(dayExpenses))}</span>
        </div>
        <div class="tooltip-row tooltip-total">
            <span>Net</span>
            <span class="${net >= 0 ? 'tooltip-positive' : 'tooltip-negative'}">${escapeHtml(formatCurrency(net))}</span>
        </div>
        ${metaMarkup}
    `;
}

/**
 * Create a day cell element
 * @param {number} day - The day number
 * @param {Date} date - The date object
 * @param {Object} options - Options (otherMonth, isToday)
 * @param {Object} tooltipManager - Tooltip manager instance
 * @returns {HTMLElement} The day cell element
 */
export function createDayCell(day, date, { otherMonth = false, isToday = false } = {}, tooltipManager) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (otherMonth) cell.classList.add('other-month');
    if (isToday) cell.classList.add('today');

    // Store ISO date on cell for event delegation
    cell.setAttribute('data-date', date.toISOString().split('T')[0]);

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    if (!otherMonth) {
        const balance = calculateBalanceForDate(date);
        const balanceElement = document.createElement('div');
        balanceElement.className = `day-balance ${balance >= 0 ? 'positive' : 'negative'}`;
        balanceElement.textContent = formatCurrency(balance);
        cell.appendChild(balanceElement);

        if (date.getDay() === 6) {
            const marker = document.createElement('div');
            marker.className = 'week-end-marker';
            marker.textContent = '●';
            cell.appendChild(marker);
        }
    }

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'budget-items';
    const dayTransactions = getTransactionsForDate(date);

    dayTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = `budget-item ${transaction.type}`;
        const prefix = isIncomeType(transaction.type) ? '+' : '-';
        item.textContent = `${prefix}${formatCurrency(transaction.amount)}`;
        itemsContainer.appendChild(item);
    });

    cell.appendChild(itemsContainer);

    // Attach tooltip if manager is provided
    if (tooltipManager) {
        tooltipManager.attach(cell, {
            html: true,
            getContent: () => getDayTooltipContent(date)
        });
    }

    // Event listeners removed - now handled by event delegation on calendarGrid

    return cell;
}

/**
 * Render the calendar grid
 * @param {Object} elements - DOM elements object containing calendarGrid, currentMonthLabel
 * @param {Function} hideDayContextMenu - Callback to hide day context menu
 * @param {Object} tooltipManager - Tooltip manager instance
 */
export function renderCalendar(elements, hideDayContextMenu, tooltipManager) {
    if (!elements.calendarGrid) {
        return;
    }

    if (hideDayContextMenu) {
        hideDayContextMenu();
    }
    if (tooltipManager) {
        tooltipManager.hide();
    }

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    if (elements.currentMonthLabel) {
        elements.currentMonthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = elements.calendarGrid;
    grid.innerHTML = '';

    DAY_HEADERS.forEach(dayName => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = dayName;
        grid.appendChild(header);
    });

    for (let i = firstDay - 1; i >= 0; i -= 1) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        grid.appendChild(createDayCell(day, date, { otherMonth: true }, tooltipManager));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const isToday = day === state.today.getDate() &&
            month === state.today.getMonth() &&
            year === state.today.getFullYear();
        grid.appendChild(createDayCell(day, date, { isToday }, tooltipManager));
    }

    const totalCells = firstDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day += 1) {
        const date = new Date(year, month + 1, day);
        grid.appendChild(createDayCell(day, date, { otherMonth: true }, tooltipManager));
    }
}
