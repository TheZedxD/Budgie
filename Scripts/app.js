/**
 * Main Application Entry Point
 * Bootstraps the budgeting application and coordinates all modules
 */

'use strict';

// Import from modules
import {
    STORAGE_KEYS,
    DEFAULT_CATEGORY_LABEL,
    DEFAULT_CATEGORIES,
    state,
    cache,
    history,
    registerStateCallbacks,
    invalidateCaches,
    ensureCacheSync,
    normalizeTagLabel,
    ensureCategoriesStructure,
    sortCategoriesInGroup,
    persistCategories,
    saveStateSnapshot,
    undo,
    redo,
    loadState,
    persistState,
    clearStoredData
} from './state.js';

import {
    formatCurrency,
    escapeHtml,
    ensureDate,
    debounce
} from './utils.js';

import {
    DAY_IN_MS,
    formatDateKey,
    isIncomeType,
    getCategoryGroupForTransactionType,
    occursOnDate,
    filterTransactions,
    applyFilter,
    clearFilter,
    getFilteredTransactions,
    getTransactionsForDate,
    getMonthlyTransactionOccurrences,
    calculateBalanceForDate,
    getProjectedMonthlyBalances,
    getMonthlyExpenseBreakdown,
    getDateRangeDailySummaries,
    getDateRangeExpenseBreakdown
} from './transactions.js';

import {
    MONTH_NAMES,
    DAY_HEADERS,
    renderCalendar as renderCalendarModule
} from './calendar.js';

import {
    setOverlayVisibility as setOverlayVisibilityModule,
    getFocusableElements,
    handleModalTabTrap,
    openModal as openModalModule,
    closeModal as closeModalModule,
    closeAllModals as closeAllModalsModule
} from './modals.js';

import {
    reportsState,
    historicalReportsState,
    showReportsTooltip,
    hideReportsTooltip,
    showHistoricalReportsTooltip,
    hideHistoricalReportsTooltip,
    renderReportsLineChart,
    renderReportsPieChart,
    handleReportsLineHover,
    handleReportsPieHover,
    initializeReportsInteractivity,
    renderHistoricalLineChart,
    renderHistoricalPieChart,
    initializeHistoricalReportsInteractivity
} from './charts.js';

// DOM element references
const elements = {
    overlay: document.getElementById('overlay'),
    hamburger: document.getElementById('hamburger'),
    sidePanel: document.getElementById('sidePanel'),
    panelArrow: document.getElementById('panelArrow'),
    rightPanel: document.getElementById('rightPanel'),
    mainContent: document.querySelector('.main-content'),
    themeToggle: document.getElementById('themeToggle'),
    openSettings: document.getElementById('openSettings'),
    openReports: document.getElementById('openReports'),
    openHistoricalReports: document.getElementById('openHistoricalReports'),
    openCategories: document.getElementById('openCategories'),
    exportData: document.getElementById('exportDataBtn'),
    clearData: document.getElementById('clearDataBtn'),
    viewTransactions: document.getElementById('viewTransactionsBtn'),
    dayContextMenu: document.getElementById('dayContextMenu'),
    calendarGrid: document.getElementById('calendarGrid'),
    currentMonthLabel: document.getElementById('currentMonth'),
    nav: {
        prev: document.getElementById('prevMonth'),
        next: document.getElementById('nextMonth'),
        today: document.getElementById('today')
    },
    stats: {
        monthIncome: document.getElementById('monthIncome'),
        monthExpenses: document.getElementById('monthExpenses'),
        monthNet: document.getElementById('monthNet'),
        totalBalance: document.getElementById('totalBalance'),
        summaryPaycheck: document.getElementById('summaryPaycheck'),
        summaryExpenses: document.getElementById('summaryExpenses'),
        summaryNet: document.getElementById('summaryNet')
    },
    weeklyProjections: document.getElementById('weeklyProjections'),
    addButtons: {
        paycheck: document.getElementById('addPaycheckBtn'),
        expense: document.getElementById('addExpenseBtn')
    },
    quickExpense: document.getElementById('quickExpenseBtn'),
    modals: {
        settings: {
            root: document.getElementById('settingsModal'),
            close: document.getElementById('settingsModalClose'),
            form: document.getElementById('settingsForm'),
            input: document.getElementById('startingBalanceInput'),
            dateInput: document.getElementById('startingBalanceDateInput'),
            cancel: document.getElementById('cancelSettings')
        },
        transaction: {
            root: document.getElementById('transactionModal'),
            close: document.getElementById('transactionModalClose'),
            form: document.getElementById('transactionForm'),
            cancel: document.getElementById('cancelTransaction'),
            type: document.getElementById('transactionType'),
            amount: document.getElementById('transactionAmount'),
            description: document.getElementById('transactionDescription'),
            categoryInput: document.getElementById('transactionCategory'),
            categoryList: document.getElementById('transactionCategoryChips'),
            date: document.getElementById('transactionDate'),
            frequency: document.getElementById('transactionFrequency'),
            title: document.getElementById('transactionModalTitle')
        },
        confirm: {
            root: document.getElementById('confirmClearModal'),
            close: document.getElementById('confirmClearClose'),
            confirm: document.getElementById('confirmClearData'),
            cancel: document.getElementById('cancelClearData')
        },
        day: {
            root: document.getElementById('dayModal'),
            close: document.getElementById('modalClose'),
            title: document.getElementById('modalTitle'),
            startBalance: document.getElementById('modalStartBalance'),
            income: document.getElementById('modalIncome'),
            expenses: document.getElementById('modalExpenses'),
            endBalance: document.getElementById('modalEndBalance'),
            list: document.getElementById('modalTransactions')
        },
        transactions: {
            root: document.getElementById('transactionsModal'),
            close: document.getElementById('transactionsModalClose'),
            list: document.getElementById('transactionsList'),
            empty: document.getElementById('transactionsEmptyMessage'),
            monthLabel: document.getElementById('transactionsMonthLabel'),
            income: document.getElementById('transactionsMonthIncome'),
            expenses: document.getElementById('transactionsMonthExpenses'),
            net: document.getElementById('transactionsMonthNet')
        },
        reports: {
            root: document.getElementById('reportsModal'),
            close: document.getElementById('reportsModalClose'),
            lineCanvas: document.getElementById('reportsLineChart'),
            lineEmpty: document.getElementById('reportsLineEmpty'),
            lineLegend: document.getElementById('reportsLineLegend'),
            pieCanvas: document.getElementById('reportsPieChart'),
            pieEmpty: document.getElementById('reportsPieEmpty'),
            pieLegend: document.getElementById('reportsPieLegend'),
            tooltip: document.getElementById('reportsTooltip')
        },
        historicalReports: {
            root: document.getElementById('historicalReportsModal'),
            close: document.getElementById('historicalReportsClose'),
            form: document.getElementById('historicalReportsForm'),
            startInput: document.getElementById('historicalStartDate'),
            endInput: document.getElementById('historicalEndDate'),
            error: document.getElementById('historicalReportsError'),
            lineCanvas: document.getElementById('historicalLineChart'),
            lineEmpty: document.getElementById('historicalLineEmpty'),
            pieCanvas: document.getElementById('historicalPieChart'),
            pieEmpty: document.getElementById('historicalPieEmpty'),
            pieLegend: document.getElementById('historicalPieLegend'),
            tooltip: document.getElementById('historicalReportsTooltip'),
            incomeTotal: document.getElementById('historicalIncomeTotal'),
            expenseTotal: document.getElementById('historicalExpenseTotal'),
            netTotal: document.getElementById('historicalNetTotal')
        },
        categories: {
            root: document.getElementById('categoriesModal'),
            close: document.getElementById('categoriesModalClose'),
            expenseList: document.getElementById('expenseTagsList'),
            incomeList: document.getElementById('incomeTagsList'),
            expenseSelect: document.getElementById('expenseTagSelect'),
            incomeSelect: document.getElementById('incomeTagSelect'),
            expenseForm: document.getElementById('expenseTagForm'),
            expenseInput: document.getElementById('expenseTagInput'),
            incomeForm: document.getElementById('incomeTagForm'),
            incomeInput: document.getElementById('incomeTagInput')
        }
    }
};

const allModals = [
    elements.modals.settings.root,
    elements.modals.transaction.root,
    elements.modals.confirm.root,
    elements.modals.day.root,
    elements.modals.transactions.root,
    elements.modals.reports.root,
    elements.modals.historicalReports.root,
    elements.modals.categories.root
];

const contextMenuButtons = elements.dayContextMenu
    ? Array.from(elements.dayContextMenu.querySelectorAll('button'))
    : [];

// Loading state management
const loadingState = {
    element: null,
    count: 0
};

function showLoading(msg = 'Loading...') {
    loadingState.count++;

    if (!loadingState.element) {
        const loader = document.createElement('div');
        loader.className = 'app-loader';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-message">${escapeHtml(msg)}</div>
        `;
        document.body.appendChild(loader);
        loadingState.element = loader;
    }

    // Update message if provided
    const messageEl = loadingState.element.querySelector('.loader-message');
    if (messageEl) {
        messageEl.textContent = msg;
    }

    loadingState.element.classList.add('visible');
}

function hideLoading() {
    loadingState.count = Math.max(0, loadingState.count - 1);

    if (loadingState.count === 0 && loadingState.element) {
        loadingState.element.classList.remove('visible');
    }
}

// Tooltip system
const tooltipManager = (() => {
    const state = {
        element: null,
        activeTarget: null,
        html: false,
        initialized: false
    };

    function ensureElement() {
        if (state.element) {
            return state.element;
        }
        const element = document.createElement('div');
        element.className = 'app-tooltip';
        element.setAttribute('role', 'tooltip');
        document.body.appendChild(element);
        state.element = element;
        return element;
    }

    function setContent(content, { html } = {}) {
        const element = ensureElement();
        if (html) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }

    function show(content, { html = false } = {}) {
        if (!content) {
            return;
        }
        const element = ensureElement();
        setContent(content, { html });
        element.classList.add('visible');
        state.html = html;
    }

    function hide() {
        if (!state.element) {
            return;
        }
        state.element.classList.remove('visible');
        state.activeTarget = null;
    }

    function updatePosition(x, y) {
        if (!state.element) {
            return;
        }
        const tooltip = state.element;
        const offset = 16;
        const bounds = tooltip.getBoundingClientRect();
        const width = bounds.width || tooltip.offsetWidth || 0;
        const height = bounds.height || tooltip.offsetHeight || 0;
        const margin = 8;
        let left = x + offset;
        let top = y + offset;
        if (left + width + margin > window.innerWidth) {
            left = x - width - offset;
        }
        if (top + height + margin > window.innerHeight) {
            top = y - height - offset;
        }
        left = Math.max(margin, left);
        top = Math.max(margin, top);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    function findTarget(node) {
        let current = node instanceof Element ? node : null;
        while (current && current !== document.body) {
            if (current.__tooltipOptions || (typeof current.hasAttribute === 'function' && current.hasAttribute('data-tooltip')) || current instanceof HTMLButtonElement) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    function resolveOptions(target) {
        if (!target) {
            return null;
        }
        if (target.__tooltipOptions) {
            const { getContent, content, html } = target.__tooltipOptions;
            const resolved = typeof getContent === 'function'
                ? getContent(target)
                : (typeof content === 'function' ? content(target) : content);
            return {
                content: resolved,
                html: Boolean(html)
            };
        }
        if (typeof target.hasAttribute === 'function' && target.hasAttribute('data-tooltip')) {
            return {
                content: target.getAttribute('data-tooltip') || '',
                html: target.getAttribute('data-tooltip-html') === 'true'
            };
        }
        if (target instanceof HTMLButtonElement) {
            const fallback = (target.getAttribute('aria-label') || target.textContent || '')
                .replace(/\s+/g, ' ')
                .trim();
            if (fallback) {
                return {
                    content: fallback,
                    html: false
                };
            }
        }
        return null;
    }

    function handlePointerEnter(event) {
        const target = findTarget(event.target);
        if (!target) {
            return;
        }
        const options = resolveOptions(target);
        if (!options?.content) {
            return;
        }
        state.activeTarget = target;
        show(options.content, { html: options.html });
        updatePosition(event.clientX, event.clientY);
    }

    function handlePointerMove(event) {
        if (!state.activeTarget) {
            return;
        }
        if (!document.body.contains(state.activeTarget)) {
            hide();
            return;
        }
        if (state.activeTarget === event.target || state.activeTarget.contains(event.target)) {
            updatePosition(event.clientX, event.clientY);
        }
    }

    function handlePointerLeave(event) {
        if (!state.activeTarget) {
            return;
        }
        if (event.target === state.activeTarget) {
            hide();
            return;
        }
        if (event.target === document.body || event.target === document.documentElement) {
            hide();
        }
    }

    function handleScroll() {
        if (state.activeTarget) {
            hide();
        }
    }

    function init() {
        if (state.initialized) {
            return;
        }
        ensureElement();
        document.addEventListener('mouseenter', handlePointerEnter, true);
        document.addEventListener('mousemove', handlePointerMove, true);
        document.addEventListener('mouseleave', handlePointerLeave, true);
        document.addEventListener('scroll', handleScroll, true);
        document.addEventListener('pointerdown', hide, true);
        window.addEventListener('blur', hide);
        state.initialized = true;
    }

    function attach(element, options = {}) {
        if (!element) {
            return;
        }
        const resolvedOptions = {
            getContent: options.getContent,
            content: options.content,
            html: Boolean(options.html)
        };
        element.__tooltipOptions = resolvedOptions;
    }

    return {
        init,
        attach,
        hide,
        updatePosition
    };
})();

// Wrapper functions to pass elements to modal functions
function setOverlayVisibility() {
    setOverlayVisibilityModule(elements, allModals);
}

function openModal(modal) {
    openModalModule(modal, tooltipManager, elements);
    setOverlayVisibility();
}

function closeModal(modal) {
    closeModalModule(modal, elements);
    setOverlayVisibility();
}

function closeAllModals() {
    closeAllModalsModule(allModals, elements);
    setOverlayVisibility();
}

// Wrapper function for renderCalendar
function renderCalendar() {
    renderCalendarModule(elements, hideDayContextMenu, tooltipManager);
    updateStats();
    renderTransactionsModal();
    maybeRenderReports();
}

// Register callbacks for state module
registerStateCallbacks({
    invalidateCaches,
    renderCalendar,
    updateSummary: updateStats,
    persistState
});

// Category management functions
function renderCategoryList(type) {
    const modal = elements.modals.categories;
    if (!modal) {
        return;
    }
    const targetList = type === 'income' ? modal.incomeList : modal.expenseList;
    const targetSelect = type === 'income' ? modal.incomeSelect : modal.expenseSelect;
    if (!targetList) {
        return;
    }
    const entries = state.categories[type] || [];
    if (!entries.length) {
        targetList.innerHTML = '<span class="tag-empty">No tags yet.</span>';
        if (targetSelect) {
            targetSelect.innerHTML = '';
        }
        return;
    }
    const defaultLower = DEFAULT_CATEGORY_LABEL.toLowerCase();
    targetList.innerHTML = entries.map(label => {
        const isDefault = label.toLowerCase() === defaultLower;
        const removeButton = isDefault
            ? '<button type="button" class="tag-remove" aria-disabled="true" disabled title="Default tag cannot be removed">×</button>'
            : `<button type="button" class="tag-remove" data-action="remove" aria-label="Remove ${escapeHtml(label)}">×</button>`;
        return `
            <span class="tag-pill${isDefault ? ' tag-pill-default' : ''}" data-type="${type}" data-label="${escapeHtml(label)}">
                <span>${escapeHtml(label)}</span>
                ${removeButton}
            </span>
        `;
    }).join('');
    if (targetSelect) {
        targetSelect.innerHTML = entries.map(label => `
            <option value="${escapeHtml(label)}">${escapeHtml(label)}</option>
        `).join('');
    }
}

function renderCategoriesModal() {
    renderCategoryList('expense');
    renderCategoryList('income');
}

function maybeRenderCategories() {
    if (elements.modals.categories.root?.classList.contains('active')) {
        renderCategoriesModal();
    }
    refreshTransactionModalCategories();
}

function addCategoryTag(type, label) {
    const normalizedType = type === 'income' ? 'income' : 'expense';
    const normalizedLabel = normalizeTagLabel(label);
    if (!normalizedLabel) {
        return false;
    }
    if (normalizedLabel.toLowerCase() === DEFAULT_CATEGORY_LABEL.toLowerCase()) {
        return false;
    }
    const bucket = state.categories[normalizedType];
    const exists = bucket.some(entry => entry.toLowerCase() === normalizedLabel.toLowerCase());
    if (exists) {
        return false;
    }
    bucket.push(normalizedLabel);
    sortCategoriesInGroup(normalizedType);
    persistCategories();
    maybeRenderCategories();
    refreshTransactionModalCategories();
    return true;
}

function removeCategoryTag(type, label) {
    const normalizedType = type === 'income' ? 'income' : 'expense';
    if (label.toLowerCase() === DEFAULT_CATEGORY_LABEL.toLowerCase()) {
        return;
    }
    const bucket = state.categories[normalizedType];
    const index = bucket.findIndex(entry => entry.toLowerCase() === label.toLowerCase());
    if (index === -1) {
        return;
    }
    bucket.splice(index, 1);
    if (!bucket.length) {
        DEFAULT_CATEGORIES[normalizedType].forEach(item => {
            if (!bucket.some(entry => entry.toLowerCase() === item.toLowerCase())) {
                bucket.push(item);
            }
        });
    }
    sortCategoriesInGroup(normalizedType);
    persistCategories();
    maybeRenderCategories();
    state.transactions.forEach(transaction => {
        const transactionType = isIncomeType(transaction.type) ? 'income' : 'expense';
        if (transactionType === normalizedType && transaction.category && transaction.category.toLowerCase() === label.toLowerCase()) {
            transaction.category = bucket[0] || DEFAULT_CATEGORY_LABEL;
        }
    });
    persistState();
    refreshTransactionModalCategories();
    renderCalendar();
    renderTransactionsModal({ force: true });
    maybeRenderReports();
    hideDayContextMenu();
}

function handleCategorySelectKeydown(event, type) {
    if (!['Delete', 'Backspace'].includes(event.key)) {
        return;
    }
    const select = type === 'income'
        ? elements.modals.categories.incomeSelect
        : elements.modals.categories.expenseSelect;
    if (!select) {
        return;
    }
    const selectedOptions = Array.from(select.selectedOptions);
    if (!selectedOptions.length) {
        return;
    }
    event.preventDefault();
    selectedOptions.forEach(option => {
        if (option.value) {
            removeCategoryTag(type, option.value);
        }
    });
}

// Transaction category functions
function setTransactionCategorySelection(label, { focusChip = false } = {}) {
    const modal = elements.modals.transaction;
    if (!modal?.categoryList || !modal.categoryInput) {
        return;
    }
    const buttons = Array.from(modal.categoryList.querySelectorAll('.category-chip'));
    if (!buttons.length) {
        modal.categoryInput.value = DEFAULT_CATEGORY_LABEL;
        return;
    }
    const normalizedSelected = normalizeTagLabel(label || '');
    let selectedButton = null;
    buttons.forEach(button => {
        const value = normalizeTagLabel(button.dataset.value || '');
        const isMatch = normalizedSelected && value &&
            value.toLowerCase() === normalizedSelected.toLowerCase();
        if (isMatch) {
            selectedButton = button;
        }
    });
    if (!selectedButton) {
        selectedButton = buttons[0];
    }
    const selectedValue = normalizeTagLabel(selectedButton?.dataset.value || '') || DEFAULT_CATEGORY_LABEL;
    modal.categoryInput.value = selectedValue;
    const selectedLower = selectedValue.toLowerCase();
    buttons.forEach(button => {
        const valueLower = normalizeTagLabel(button.dataset.value || '').toLowerCase();
        const isSelected = valueLower === selectedLower;
        button.classList.toggle('selected', isSelected);
        button.setAttribute('aria-checked', isSelected ? 'true' : 'false');
        button.tabIndex = isSelected ? 0 : -1;
    });
    if (focusChip && selectedButton) {
        selectedButton.focus();
    }
}

function handleTransactionCategoryChipKeydown(event) {
    const modal = elements.modals.transaction;
    if (!modal?.categoryList) {
        return;
    }
    const buttons = Array.from(modal.categoryList.querySelectorAll('.category-chip'));
    if (!buttons.length) {
        return;
    }
    const currentButton = event.currentTarget;
    const currentIndex = buttons.indexOf(currentButton);
    if (currentIndex === -1) {
        return;
    }
    let targetIndex = -1;
    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            targetIndex = (currentIndex + 1) % buttons.length;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            targetIndex = (currentIndex - 1 + buttons.length) % buttons.length;
            break;
        case 'Home':
            targetIndex = 0;
            break;
        case 'End':
            targetIndex = buttons.length - 1;
            break;
        case ' ':
        case 'Enter':
            event.preventDefault();
            setTransactionCategorySelection(currentButton.dataset.value || '', { focusChip: true });
            return;
        default:
            return;
    }
    if (targetIndex !== -1) {
        event.preventDefault();
        const targetButton = buttons[targetIndex];
        setTransactionCategorySelection(targetButton?.dataset.value || '', { focusChip: true });
    }
}

function populateTransactionCategoryChoices(transactionType, selectedLabel) {
    const modal = elements.modals.transaction;
    if (!modal?.categoryList) {
        return;
    }
    const group = getCategoryGroupForTransactionType(transactionType);
    sortCategoriesInGroup(group);
    let options = state.categories[group] || [];
    if (!options.length) {
        options = [DEFAULT_CATEGORY_LABEL];
        state.categories[group] = options;
        persistCategories();
    }
    const normalizedSelected = normalizeTagLabel(selectedLabel || '');
    modal.categoryList.innerHTML = '';
    options.forEach(label => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-chip';
        button.textContent = label;
        button.dataset.value = label;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', 'false');
        button.tabIndex = -1;
        button.addEventListener('click', () => {
            setTransactionCategorySelection(label, { focusChip: true });
        });
        button.addEventListener('keydown', handleTransactionCategoryChipKeydown);
        modal.categoryList.appendChild(button);
    });
    const match = options.find(label => label.toLowerCase() === normalizedSelected.toLowerCase());
    setTransactionCategorySelection(match || options[0] || DEFAULT_CATEGORY_LABEL);
}

function ensureTransactionCategories() {
    let categoriesChanged = false;
    state.transactions.forEach(transaction => {
        const group = getCategoryGroupForTransactionType(transaction.type);
        const bucket = state.categories[group] || [];
        let category = normalizeTagLabel(transaction.category);
        if (!category) {
            category = DEFAULT_CATEGORY_LABEL;
        }
        if (!bucket.some(entry => entry.toLowerCase() === category.toLowerCase())) {
            bucket.push(category);
            categoriesChanged = true;
        }
        transaction.category = category;
    });
    ['expense', 'income'].forEach(sortCategoriesInGroup);
    if (categoriesChanged) {
        persistCategories();
    }
}

function refreshTransactionModalCategories() {
    const modal = elements.modals.transaction;
    if (!modal?.root?.classList.contains('active')) {
        return;
    }
    const transactionType = modal.type?.value || 'paycheck';
    const currentCategory = modal.categoryInput?.value;
    populateTransactionCategoryChoices(transactionType, currentCategory);
}

// Side panel
function toggleSidePanel(forceOpen) {
    if (!elements.sidePanel) {
        return;
    }
    tooltipManager.hide();
    const nextState = typeof forceOpen === 'boolean'
        ? forceOpen
        : !elements.sidePanel.classList.contains('open');
    elements.sidePanel.classList.toggle('open', nextState);
    elements.hamburger?.setAttribute('aria-expanded', nextState ? 'true' : 'false');
    setOverlayVisibility();
}

// Context menu
function hideDayContextMenu() {
    if (!elements.dayContextMenu) {
        return;
    }
    elements.dayContextMenu.classList.remove('active');
    state.contextMenuDate = null;
}

function showDayContextMenu(x, y, date) {
    if (!elements.dayContextMenu) {
        return;
    }
    const normalized = ensureDate(date);
    if (!normalized) {
        return;
    }

    hideDayContextMenu();
    tooltipManager.hide();
    state.contextMenuDate = normalized;

    const menu = elements.dayContextMenu;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.add('active');

    const rect = menu.getBoundingClientRect();
    let adjustedX = x;
    let adjustedY = y;

    if (rect.right > window.innerWidth) {
        adjustedX = window.innerWidth - rect.width - 12;
    }
    if (rect.bottom > window.innerHeight) {
        adjustedY = window.innerHeight - rect.height - 12;
    }

    menu.style.left = `${Math.max(12, adjustedX)}px`;
    menu.style.top = `${Math.max(12, adjustedY)}px`;
}

// Theme management
function readThemePreference() {
    try {
        return localStorage.getItem(STORAGE_KEYS.theme);
    } catch (error) {
        console.warn('Unable to read theme preference:', error);
        return null;
    }
}

function persistThemePreference(theme) {
    try {
        localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch (error) {
        console.warn('Unable to store theme preference:', error);
    }
}

function applyTheme(theme, { persist = true } = {}) {
    const normalized = theme === 'dark' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', normalized);

    if (elements.themeToggle) {
        const isDark = normalized === 'dark';
        elements.themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        elements.themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    if (persist) {
        persistThemePreference(normalized);
    }
}

function initTheme() {
    const savedTheme = readThemePreference();
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const prefersDark = mediaQuery?.matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'), { persist: Boolean(savedTheme) });

    if (!savedTheme && mediaQuery) {
        const handleChange = event => {
            if (readThemePreference()) {
                return;
            }
            applyTheme(event.matches ? 'dark' : 'light', { persist: false });
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleChange);
        }
    }
}

// Stats and projections
function updateStats() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let monthIncome = 0;
    let monthExpenses = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const dayTransactions = getTransactionsForDate(date);
        dayTransactions.forEach(transaction => {
            if (isIncomeType(transaction.type)) {
                monthIncome += transaction.amount;
            } else {
                monthExpenses += transaction.amount;
            }
        });
    }

    const net = monthIncome - monthExpenses;
    const currentBalance = calculateBalanceForDate(new Date());

    if (elements.stats.monthIncome) {
        elements.stats.monthIncome.textContent = formatCurrency(monthIncome);
    }
    if (elements.stats.monthExpenses) {
        elements.stats.monthExpenses.textContent = formatCurrency(monthExpenses);
    }
    if (elements.stats.monthNet) {
        elements.stats.monthNet.textContent = formatCurrency(net);
    }
    if (elements.stats.totalBalance) {
        elements.stats.totalBalance.textContent = formatCurrency(currentBalance);
        elements.stats.totalBalance.className = `total-balance ${currentBalance >= 0 ? 'positive' : 'negative'}`;
    }

    if (elements.stats.summaryPaycheck) {
        elements.stats.summaryPaycheck.textContent = formatCurrency(monthIncome);
        elements.stats.summaryPaycheck.className = `summary-value ${monthIncome >= 0 ? 'positive' : 'negative'}`;
    }
    if (elements.stats.summaryExpenses) {
        elements.stats.summaryExpenses.textContent = formatCurrency(monthExpenses);
        elements.stats.summaryExpenses.className = `summary-value ${monthExpenses > 0 ? 'negative' : 'positive'}`;
    }
    if (elements.stats.summaryNet) {
        elements.stats.summaryNet.textContent = formatCurrency(net);
        elements.stats.summaryNet.className = `summary-value ${net >= 0 ? 'positive' : 'negative'}`;
    }

    updateWeeklyProjections();
}

function updateWeeklyProjections() {
    if (!elements.weeklyProjections) {
        return;
    }

    const today = ensureDate(new Date());
    if (!today) {
        elements.weeklyProjections.innerHTML = '<div class="no-transactions">Unable to calculate projections</div>';
        return;
    }

    const firstWeekEnd = new Date(today);
    const daysUntilWeekEnd = (6 - firstWeekEnd.getDay() + 7) % 7;
    firstWeekEnd.setDate(firstWeekEnd.getDate() + daysUntilWeekEnd);

    const projections = Array.from({ length: 7 }, (_, index) => {
        const weekEnd = new Date(firstWeekEnd);
        weekEnd.setDate(firstWeekEnd.getDate() + index * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        return {
            week: index + 1,
            rangeLabel: `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
            balance: calculateBalanceForDate(weekEnd)
        };
    });

    elements.weeklyProjections.innerHTML = projections.map(projection => `
        <div class="weekly-projection">
            <div class="projection-label">Week ${projection.week}: ${projection.rangeLabel}</div>
            <div class="projection-amount">${formatCurrency(projection.balance)}</div>
        </div>
    `).join('');
}

// Day modal
function getFrequencyLabel(frequency) {
    switch (frequency) {
        case 'once':
            return 'One-time';
        case 'daily':
            return 'Daily';
        case 'weekly':
            return 'Weekly';
        case 'biweekly':
            return 'Bi-weekly';
        case 'monthly':
            return 'Monthly';
        default:
            return frequency || '';
    }
}

function showDayModal(date, dayNumber) {
    const normalized = ensureDate(date);
    if (!normalized) {
        return;
    }

    const dayIso = normalized.toISOString().slice(0, 10);
    const transactionsForDay = getTransactionsForDate(normalized);
    const endBalance = calculateBalanceForDate(normalized);
    const previousDay = new Date(normalized);
    previousDay.setDate(previousDay.getDate() - 1);
    const startBalance = calculateBalanceForDate(previousDay);

    let dayIncome = 0;
    let dayExpenses = 0;
    transactionsForDay.forEach(transaction => {
        if (isIncomeType(transaction.type)) {
            dayIncome += transaction.amount;
        } else {
            dayExpenses += transaction.amount;
        }
    });

    const modal = elements.modals.day;
    if (!modal) {
        return;
    }

    modal.title.textContent = `${MONTH_NAMES[normalized.getMonth()]} ${dayNumber}, ${normalized.getFullYear()}`;
    modal.startBalance.textContent = formatCurrency(startBalance);
    modal.income.textContent = formatCurrency(dayIncome);
    modal.expenses.textContent = formatCurrency(dayExpenses);
    modal.endBalance.textContent = formatCurrency(endBalance);
    modal.endBalance.classList.toggle('text-income', endBalance >= 0);
    modal.endBalance.classList.toggle('text-expense', endBalance < 0);

    if (transactionsForDay.length) {
        modal.list.innerHTML = transactionsForDay.map(transaction => {
            const categoryLabel = escapeHtml(transaction.category || DEFAULT_CATEGORY_LABEL);
            const notes = escapeHtml(transaction.description || '');
            const frequencyLabel = escapeHtml(getFrequencyLabel(transaction.frequency));
            const transactionIndex = state.transactions.indexOf(transaction);
            const editButton = transactionIndex >= 0
                ? `<button type="button" class="transaction-edit-btn" data-action="edit" data-index="${transactionIndex}" data-date="${dayIso}">Edit</button>`
                : '';
            return `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-info">
                        <div class="transaction-category">${categoryLabel}</div>
                        ${notes ? `<div class="transaction-notes">${notes}</div>` : ''}
                        <div class="transaction-freq">${frequencyLabel}</div>
                    </div>
                    <div class="transaction-side">
                        <div class="transaction-amount ${transaction.type}">
                            ${isIncomeType(transaction.type) ? '+' : '-'}${formatCurrency(transaction.amount)}
                        </div>
                        ${editButton}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        modal.list.innerHTML = '<div class="no-transactions">No transactions on this day</div>';
    }

    openModal(modal.root);
}

// Transaction modal
function resetTransactionForm() {
    const modal = elements.modals.transaction;
    if (!modal) {
        return;
    }
    state.editingTransactionIndex = null;
    modal.form.reset();
    modal.type.value = 'paycheck';
    populateTransactionCategoryChoices('paycheck');
    modal.frequency.value = 'once';
    modal.date.valueAsDate = new Date();
    modal.title.textContent = 'Add Paycheck';
    if (modal.description) {
        modal.description.value = '';
    }
}

function openTransactionModal(type, presetDate = null) {
    const modal = elements.modals.transaction;
    if (!modal) {
        return;
    }
    hideDayContextMenu();
    resetTransactionForm();
    state.transactionsModalReturn = false;
    const normalizedType = type === 'expense' ? 'expense' : 'paycheck';
    modal.type.value = normalizedType;
    modal.title.textContent = normalizedType === 'expense' ? 'Add Expense' : 'Add Paycheck';
    populateTransactionCategoryChoices(normalizedType);

    if (presetDate) {
        const normalized = ensureDate(presetDate);
        if (normalized) {
            modal.date.valueAsDate = new Date(normalized.getTime());
        }
    }

    if (elements.sidePanel) {
        elements.sidePanel.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
    }

    openModal(modal.root);
    window.requestAnimationFrame(() => {
        modal.amount.focus();
    });
}

function handleTransactionSubmit(event) {
    event.preventDefault();
    const modal = elements.modals.transaction;

    const type = modal.type.value === 'expense' ? 'expense' : 'paycheck';
    const amountValue = Number.parseFloat(modal.amount.value);
    const description = modal.description.value.trim();
    const frequency = modal.frequency.value || 'once';
    const dateValue = modal.date.value ? new Date(`${modal.date.value}T00:00:00`) : new Date();
    const normalizedDate = ensureDate(dateValue);
    const categoryValueInput = modal.categoryInput;
    const categoryGroup = getCategoryGroupForTransactionType(type);
    let category = categoryValueInput ? normalizeTagLabel(categoryValueInput.value) : '';
    if (!category) {
        category = DEFAULT_CATEGORY_LABEL;
    }
    if (!state.categories[categoryGroup].some(entry => entry.toLowerCase() === category.toLowerCase())) {
        state.categories[categoryGroup].push(category);
        sortCategoriesInGroup(categoryGroup);
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
        modal.amount.focus();
        return;
    }
    if (!normalizedDate) {
        modal.date.focus();
        return;
    }

    const normalizedAmount = Math.round(amountValue * 100) / 100;
    const isEditing = Number.isInteger(state.editingTransactionIndex) && state.editingTransactionIndex >= 0;

    if (isEditing && state.editingTransactionIndex < state.transactions.length) {
        const target = state.transactions[state.editingTransactionIndex];
        target.type = type;
        target.amount = normalizedAmount;
        target.description = description;
        target.date = normalizedDate;
        target.frequency = frequency;
        target.category = category;
    } else {
        state.transactions.push({
            type,
            amount: normalizedAmount,
            description,
            date: normalizedDate,
            frequency,
            category
        });
    }
    state.transactions.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

    invalidateCaches();
    persistState();
    closeModal(modal.root);
    resetTransactionForm();
    renderCalendar();
    renderTransactionsModal({ force: true });
    maybeReopenTransactionsModal();
}

// Settings modal
function handleSettingsSubmit(event) {
    event.preventDefault();
    const modal = elements.modals.settings;
    const value = Number.parseFloat(modal.input.value);
    const selectedDate = modal.dateInput?.valueAsDate || null;
    state.startingBalance = Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
    state.startingBalanceDate = selectedDate ? ensureDate(selectedDate) : null;
    invalidateCaches();
    persistState();
    closeModal(modal.root);
    renderCalendar();
}

// Transactions list modal
function renderTransactionsModal({ force = false } = {}) {
    const modal = elements.modals.transactions;
    if (!modal?.root) {
        return;
    }
    if (!force && !modal.root.classList.contains('active')) {
        return;
    }

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const occurrences = getMonthlyTransactionOccurrences(year, month);

    if (modal.monthLabel) {
        modal.monthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;
    }

    let incomeTotal = 0;
    let expenseTotal = 0;

    const listContent = occurrences.map(entry => {
        const { transaction, occurrenceDate, index } = entry;
        const amountValue = Number.isFinite(transaction.amount) ? transaction.amount : 0;
        if (isIncomeType(transaction.type)) {
            incomeTotal += amountValue;
        } else {
            expenseTotal += amountValue;
        }

        const dateLabel = occurrenceDate
            ? occurrenceDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : '';
        const amountLabel = `${isIncomeType(transaction.type) ? '+' : '-'}${formatCurrency(amountValue)}`;
        const categoryLabel = escapeHtml(transaction.category || DEFAULT_CATEGORY_LABEL);
        const notes = escapeHtml(transaction.description || '');
        const frequencyLabel = getFrequencyLabel(transaction.frequency);
        const typeLabel = isIncomeType(transaction.type) ? 'Paycheck' : 'Expense';
        const metaParts = [`Type: ${typeLabel}`, `Frequency: ${frequencyLabel}`];
        if (transaction.frequency !== 'once' && transaction.date instanceof Date) {
            const startLabel = transaction.date.toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', year: 'numeric' }
            );
            metaParts.push(`Starts: ${startLabel}`);
        }
        const meta = metaParts.map(part => `<span>${escapeHtml(part)}</span>`).join('');
        const occurrenceDateValue = occurrenceDate
            ? occurrenceDate.toISOString().slice(0, 10)
            : '';

        return `
            <div class="transactions-item ${isIncomeType(transaction.type) ? 'income' : 'expense'}">
                <div class="transactions-item-main">
                    <div class="transactions-item-top">
                        <span class="transactions-date">${escapeHtml(dateLabel)}</span>
                        <span class="transactions-amount">${escapeHtml(amountLabel)}</span>
                    </div>
                    <div class="transactions-desc">
                        <span class="transactions-category">${categoryLabel}</span>
                        ${notes ? `<span class="transactions-notes">${notes}</span>` : ''}
                    </div>
                    <div class="transactions-meta">${meta}</div>
                </div>
                <div class="transactions-item-actions">
                    <button type="button" class="transactions-action-btn edit" data-action="edit" data-index="${index}" data-date="${occurrenceDateValue}">Edit</button>
                    <button type="button" class="transactions-action-btn delete" data-action="delete" data-index="${index}">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    if (modal.list) {
        modal.list.innerHTML = listContent;
        modal.list.classList.toggle('visible', occurrences.length > 0);
    }

    if (modal.empty) {
        modal.empty.style.display = occurrences.length ? 'none' : 'block';
    }

    if (modal.income) {
        modal.income.textContent = formatCurrency(incomeTotal);
    }
    if (modal.expenses) {
        modal.expenses.textContent = formatCurrency(expenseTotal);
    }

    const netTotal = incomeTotal - expenseTotal;
    if (modal.net) {
        modal.net.textContent = formatCurrency(netTotal);
        modal.net.classList.remove('positive', 'negative');
        modal.net.classList.add(netTotal >= 0 ? 'positive' : 'negative');
        const parent = modal.net.parentElement;
        if (parent?.classList.contains('stat')) {
            parent.classList.remove('positive', 'negative');
            parent.classList.add(netTotal >= 0 ? 'positive' : 'negative');
        }
    }
}

function openTransactionsModal() {
    if (!elements.modals.transactions.root) {
        return;
    }
    hideDayContextMenu();
    elements.sidePanel?.classList.remove('open');
    elements.hamburger?.setAttribute('aria-expanded', 'false');
    state.transactionsModalReturn = false;
    renderTransactionsModal({ force: true });
    openModal(elements.modals.transactions.root);
}

function startEditTransaction(index, { occurrenceDate = null, reopenAfter = false } = {}) {
    const transaction = state.transactions[index];
    const modal = elements.modals.transaction;
    if (!transaction || !modal) {
        return;
    }

    hideDayContextMenu();
    state.editingTransactionIndex = index;
    state.transactionsModalReturn = Boolean(reopenAfter);

    const normalizedType = transaction.type === 'expense' ? 'expense' : 'paycheck';
    modal.type.value = normalizedType;
    modal.title.textContent = `Edit ${normalizedType === 'expense' ? 'Expense' : 'Paycheck'}`;
    populateTransactionCategoryChoices(normalizedType, transaction.category);

    const amountValue = Number.isFinite(transaction.amount) ? transaction.amount : 0;
    modal.amount.value = amountValue.toFixed(2);
    modal.description.value = transaction.description || '';
    modal.frequency.value = transaction.frequency || 'once';

    const fallbackDate = ensureDate(transaction.date) || new Date();
    const resolvedDate = occurrenceDate instanceof Date && !Number.isNaN(occurrenceDate.getTime())
        ? occurrenceDate
        : fallbackDate;
    modal.date.valueAsDate = new Date(resolvedDate.getTime());

    if (elements.sidePanel) {
        elements.sidePanel.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
    }

    openModal(modal.root);
    window.requestAnimationFrame(() => {
        modal.amount.focus();
        if (typeof modal.amount.select === 'function') {
            modal.amount.select();
        }
    });
}

function deleteTransaction(index) {
    if (index < 0 || index >= state.transactions.length) {
        return;
    }
    state.transactions.splice(index, 1);
    if (state.editingTransactionIndex === index) {
        state.editingTransactionIndex = null;
    } else if (state.editingTransactionIndex > index) {
        state.editingTransactionIndex -= 1;
    }
    invalidateCaches();
    persistState();
    renderCalendar();
    if (elements.modals.transactions.root?.classList.contains('active')) {
        renderTransactionsModal({ force: true });
    }
}

function handleDayModalListClick(event) {
    if (!elements.modals.day.list) {
        return;
    }
    const actionButton = event.target.closest('[data-action="edit"]');
    if (!actionButton || !elements.modals.day.list.contains(actionButton)) {
        return;
    }
    const index = Number.parseInt(actionButton.dataset.index, 10);
    if (!Number.isFinite(index)) {
        return;
    }
    const dateValue = actionButton.dataset.date
        ? ensureDate(`${actionButton.dataset.date}T00:00:00`)
        : null;
    closeModal(elements.modals.day.root);
    startEditTransaction(index, {
        occurrenceDate: dateValue,
        reopenAfter: false
    });
}

function handleTransactionsListClick(event) {
    if (!elements.modals.transactions.list) {
        return;
    }
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton || !elements.modals.transactions.list.contains(actionButton)) {
        return;
    }
    const index = Number.parseInt(actionButton.dataset.index, 10);
    if (!Number.isFinite(index)) {
        return;
    }
    const action = actionButton.dataset.action;
    if (action === 'edit') {
        const dateValue = actionButton.dataset.date
            ? ensureDate(`${actionButton.dataset.date}T00:00:00`)
            : null;
        closeModal(elements.modals.transactions.root);
        startEditTransaction(index, {
            occurrenceDate: dateValue,
            reopenAfter: true
        });
    } else if (action === 'delete') {
        const confirmed = window.confirm('Delete this transaction? This will remove the entire schedule.');
        if (!confirmed) {
            return;
        }
        deleteTransaction(index);
    }
}

function maybeReopenTransactionsModal() {
    if (!state.transactionsModalReturn) {
        return;
    }
    state.transactionsModalReturn = false;
    openTransactionsModal();
}

// Reports
function maybeRenderReports() {
    if (elements.modals.reports.root?.classList.contains('active')) {
        renderReports();
    }
}

function maybeRenderHistoricalReports() {
    const modal = elements.modals.historicalReports;
    if (!modal?.root?.classList.contains('active')) {
        return;
    }
    const { start, end } = historicalReportsState.line.range || {};
    if (start && end) {
        renderHistoricalReports({ start, end });
    }
}

function renderReports() {
    try {
        showLoading('Generating reports...');
        renderReportsLineChart(elements);
        renderReportsPieChart(elements);
        initializeReportsInteractivity(elements);
    } finally {
        hideLoading();
    }
}

function clampHistoricalDate(value) {
    const date = ensureDate(value);
    return date;
}

function validateHistoricalRange(start, end) {
    const today = ensureDate(new Date());
    if (!start || !end) {
        return 'Please choose both a start and end date.';
    }
    if (end.getTime() < start.getTime()) {
        return 'End date must be on or after the start date.';
    }
    if (end.getTime() > today.getTime()) {
        return 'Historical reports are limited to dates up to today.';
    }
    return '';
}

function openHistoricalReportsModal() {
    const modal = elements.modals.historicalReports;
    if (!modal?.root) {
        return;
    }
    hideDayContextMenu();
    const today = ensureDate(new Date()) || new Date();
    let defaultEnd = today;
    let defaultStart = new Date(today);
    defaultStart.setDate(defaultStart.getDate() - 29);
    const earliestTransaction = ensureDate(state.transactions[0]?.date);
    if (earliestTransaction && earliestTransaction.getTime() > defaultStart.getTime()) {
        defaultStart = new Date(earliestTransaction.getTime());
    }
    if (defaultStart.getTime() > defaultEnd.getTime()) {
        defaultStart = new Date(defaultEnd.getTime());
    }
    if (modal.startInput) {
        modal.startInput.valueAsDate = defaultStart;
    }
    if (modal.endInput) {
        modal.endInput.valueAsDate = defaultEnd;
    }
    if (modal.error) {
        modal.error.textContent = '';
    }
    if (modal.incomeTotal) {
        modal.incomeTotal.textContent = formatCurrency(0);
    }
    if (modal.expenseTotal) {
        modal.expenseTotal.textContent = formatCurrency(0);
    }
    if (modal.netTotal) {
        modal.netTotal.textContent = formatCurrency(0);
        modal.netTotal.classList.remove('positive', 'negative');
    }
    initializeHistoricalReportsInteractivity(elements);
    renderHistoricalReports({ start: defaultStart, end: defaultEnd });
    openModal(modal.root);
    window.requestAnimationFrame(() => {
        modal.startInput?.focus();
    });
}

function handleHistoricalReportsSubmit(event) {
    event.preventDefault();
    const modal = elements.modals.historicalReports;
    if (!modal) {
        return;
    }
    const startValue = modal.startInput?.value;
    const endValue = modal.endInput?.value;
    const start = clampHistoricalDate(startValue);
    const end = clampHistoricalDate(endValue);
    const validationError = validateHistoricalRange(start, end);
    if (validationError) {
        if (modal.error) {
            modal.error.textContent = validationError;
        }
        return;
    }
    if (modal.error) {
        modal.error.textContent = '';
    }
    renderHistoricalReports({ start, end });
}

function renderHistoricalReports(range) {
    if (!elements.modals.historicalReports.root) {
        return;
    }
    const start = ensureDate(range?.start);
    const end = ensureDate(range?.end);
    if (!start || !end || end < start) {
        return;
    }

    try {
        showLoading('Generating historical reports...');
        hideHistoricalReportsTooltip(elements);
        historicalReportsState.line.range = { start, end };
        const summaries = getDateRangeDailySummaries(start, end);
        historicalReportsState.line.data = summaries;
        historicalReportsState.line.hoverIndex = null;

        const expenseBreakdown = getDateRangeExpenseBreakdown(start, end);
        historicalReportsState.pie.slicesData = expenseBreakdown;
        historicalReportsState.pie.hoverIndex = null;

        const totalIncome = summaries.reduce((sum, day) => sum + day.income, 0);
        const totalExpenses = summaries.reduce((sum, day) => sum + day.expenses, 0);
        const net = totalIncome - totalExpenses;
        const modal = elements.modals.historicalReports;
        if (modal.incomeTotal) {
            modal.incomeTotal.textContent = formatCurrency(totalIncome);
        }
        if (modal.expenseTotal) {
            modal.expenseTotal.textContent = formatCurrency(totalExpenses);
        }
        if (modal.netTotal) {
            modal.netTotal.textContent = formatCurrency(net);
            modal.netTotal.classList.remove('positive', 'negative');
            modal.netTotal.classList.add(net >= 0 ? 'positive' : 'negative');
        }

        renderHistoricalLineChart(elements);
        renderHistoricalPieChart(elements);
    } finally {
        hideLoading();
    }
}

// Import/Export
function exportData() {
    hideDayContextMenu();
    const sorted = [...state.transactions].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
    const payload = {
        startingBalance: state.startingBalance,
        balanceEffectiveDate: state.startingBalanceDate ? state.startingBalanceDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
        transactions: sorted.map(transaction => ({
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date?.toISOString(),
            frequency: transaction.frequency,
            category: transaction.category
        })),
        categories: state.categories
    };

    const timestamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `budget-data-${timestamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

function importData(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') {
        throw new Error('Invalid input: Expected a JSON string');
    }

    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch (e) {
        throw new Error(`Invalid JSON: ${e.message}`);
    }

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid data: Expected an object');
    }

    if (!Array.isArray(parsed.transactions)) {
        throw new Error('Invalid data: Missing or invalid transactions array');
    }

    function sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .slice(0, 500);
    }

    const validTransactions = [];
    const seenKeys = new Set();

    for (let i = 0; i < parsed.transactions.length; i++) {
        const txn = parsed.transactions[i];

        if (!txn || typeof txn !== 'object') {
            console.warn(`Skipping invalid transaction at index ${i}: not an object`);
            continue;
        }

        const validTypes = ['paycheck', 'income', 'expense'];
        let type = String(txn.type || '').toLowerCase();
        if (type === 'income') type = 'paycheck';
        if (!validTypes.includes(type)) {
            console.warn(`Skipping transaction at index ${i}: invalid type "${txn.type}"`);
            continue;
        }

        const amount = Number.parseFloat(txn.amount);
        if (!Number.isFinite(amount) || amount < 0) {
            console.warn(`Skipping transaction at index ${i}: invalid amount "${txn.amount}"`);
            continue;
        }

        const roundedAmount = Math.round(amount * 100) / 100;

        const dateValue = ensureDate(txn.date);
        if (!dateValue) {
            console.warn(`Skipping transaction at index ${i}: invalid date "${txn.date}"`);
            continue;
        }

        const description = sanitizeString(txn.description || '');

        const validFrequencies = ['once', 'daily', 'weekly', 'biweekly', 'monthly'];
        const frequency = validFrequencies.includes(txn.frequency) ? txn.frequency : 'once';

        const category = normalizeTagLabel(txn.category || '');

        const stableKey = txn.id
            ? `id:${txn.id}`
            : `${type}:${roundedAmount}:${dateValue.toISOString()}:${description}:${frequency}:${category}`;

        if (seenKeys.has(stableKey)) {
            console.warn(`Skipping duplicate transaction at index ${i}`);
            continue;
        }
        seenKeys.add(stableKey);

        validTransactions.push({
            type,
            amount: roundedAmount,
            description,
            date: dateValue,
            frequency,
            category
        });
    }

    if (validTransactions.length === 0) {
        throw new Error('No valid transactions found in import data');
    }

    state.transactions = [...state.transactions, ...validTransactions];
    state.transactions.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

    ensureTransactionCategories();

    if (typeof parsed.startingBalance === 'number' && Number.isFinite(parsed.startingBalance)) {
        state.startingBalance = parsed.startingBalance;
    }

    if (parsed.balanceEffectiveDate) {
        const effectiveDate = ensureDate(parsed.balanceEffectiveDate);
        if (effectiveDate) {
            state.startingBalanceDate = effectiveDate;
        }
    }

    if (parsed.categories && typeof parsed.categories === 'object') {
        const importedCategories = ensureCategoriesStructure(parsed.categories);
        ['expense', 'income'].forEach(group => {
            if (Array.isArray(importedCategories[group])) {
                importedCategories[group].forEach(cat => {
                    const normalized = normalizeTagLabel(cat);
                    if (normalized && !state.categories[group].some(c => c.toLowerCase() === normalized.toLowerCase())) {
                        state.categories[group].push(normalized);
                    }
                });
            }
        });
        ['expense', 'income'].forEach(sortCategoriesInGroup);
    }

    invalidateCaches();
    persistState();

    return {
        imported: validTransactions.length,
        skipped: parsed.transactions.length - validTransactions.length
    };
}

// Clear data
function clearAllData() {
    hideDayContextMenu();
    clearStoredData();
    state.transactions = [];
    state.startingBalance = 0;
    state.startingBalanceDate = null;
    state.categories = ensureCategoriesStructure(DEFAULT_CATEGORIES);
    ['expense', 'income'].forEach(sortCategoriesInGroup);
    persistCategories();
    invalidateCaches();
    refreshTransactionModalCategories();
    historicalReportsState.line.data = [];
    historicalReportsState.line.range = { start: null, end: null };
    historicalReportsState.line.hoverIndex = null;
    historicalReportsState.pie.slicesData = [];
    historicalReportsState.pie.total = 0;
    historicalReportsState.pie.slices = [];
    historicalReportsState.pie.hoverIndex = null;
    hideHistoricalReportsTooltip(elements);

    resetTransactionForm();
    if (elements.modals.settings.input) {
        elements.modals.settings.input.value = state.startingBalance.toFixed(2);
    }
    if (elements.modals.settings.dateInput) {
        elements.modals.settings.dateInput.value = '';
    }

    applyTheme(document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', { persist: false });

    closeModal(elements.modals.confirm.root);
    renderCalendar();
    renderTransactionsModal({ force: true });
    maybeRenderCategories();
}

// Event listener registration
function registerEventListeners() {
    elements.hamburger?.addEventListener('click', () => {
        hideDayContextMenu();
        toggleSidePanel();
    });

    elements.overlay?.addEventListener('click', () => {
        elements.sidePanel?.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
        state.transactionsModalReturn = false;
        closeAllModals();
        hideDayContextMenu();
    });

    elements.modals.day.close?.addEventListener('click', () => closeModal(elements.modals.day.root));
    elements.modals.transaction.close?.addEventListener('click', () => {
        closeModal(elements.modals.transaction.root);
        resetTransactionForm();
        maybeReopenTransactionsModal();
    });
    elements.modals.transaction.cancel?.addEventListener('click', () => {
        closeModal(elements.modals.transaction.root);
        resetTransactionForm();
        maybeReopenTransactionsModal();
    });
    elements.modals.settings.close?.addEventListener('click', () => closeModal(elements.modals.settings.root));
    elements.modals.settings.cancel?.addEventListener('click', () => closeModal(elements.modals.settings.root));
    elements.modals.confirm.close?.addEventListener('click', () => closeModal(elements.modals.confirm.root));
    elements.modals.confirm.cancel?.addEventListener('click', () => closeModal(elements.modals.confirm.root));
    elements.modals.confirm.confirm?.addEventListener('click', clearAllData);
    elements.modals.transactions.close?.addEventListener('click', () => {
        state.transactionsModalReturn = false;
        closeModal(elements.modals.transactions.root);
    });
    elements.modals.reports.close?.addEventListener('click', () => {
        closeModal(elements.modals.reports.root);
    });
    elements.modals.historicalReports.close?.addEventListener('click', () => {
        closeModal(elements.modals.historicalReports.root);
    });
    elements.modals.categories.close?.addEventListener('click', () => {
        closeModal(elements.modals.categories.root);
    });

    elements.openSettings?.addEventListener('click', () => {
        hideDayContextMenu();
        elements.sidePanel?.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
        elements.modals.settings.input.value = state.startingBalance.toFixed(2);
        if (elements.modals.settings.dateInput) {
            if (state.startingBalanceDate) {
                elements.modals.settings.dateInput.valueAsDate = new Date(state.startingBalanceDate);
            } else {
                elements.modals.settings.dateInput.value = '';
            }
        }
        openModal(elements.modals.settings.root);
    });

    elements.modals.settings.form?.addEventListener('submit', handleSettingsSubmit);
    elements.exportData?.addEventListener('click', exportData);
    elements.clearData?.addEventListener('click', () => {
        hideDayContextMenu();
        elements.sidePanel?.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
        openModal(elements.modals.confirm.root);
    });
    elements.viewTransactions?.addEventListener('click', () => {
        openTransactionsModal();
    });
    elements.openReports?.addEventListener('click', () => {
        hideDayContextMenu();
        elements.sidePanel?.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
        openModal(elements.modals.reports.root);
        renderReports();
    });
    elements.openHistoricalReports?.addEventListener('click', () => {
        hideDayContextMenu();
        elements.sidePanel?.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
        if (elements.modals.reports.root?.classList.contains('active')) {
            closeModal(elements.modals.reports.root);
        }
        openHistoricalReportsModal();
    });
    elements.openCategories?.addEventListener('click', () => {
        hideDayContextMenu();
        elements.sidePanel?.classList.remove('open');
        elements.hamburger?.setAttribute('aria-expanded', 'false');
        renderCategoriesModal();
        if (elements.modals.categories.expenseInput) {
            elements.modals.categories.expenseInput.value = '';
            elements.modals.categories.expenseInput.setCustomValidity('');
        }
        if (elements.modals.categories.incomeInput) {
            elements.modals.categories.incomeInput.value = '';
            elements.modals.categories.incomeInput.setCustomValidity('');
        }
        if (elements.modals.categories.expenseSelect) {
            elements.modals.categories.expenseSelect.selectedIndex = -1;
        }
        if (elements.modals.categories.incomeSelect) {
            elements.modals.categories.incomeSelect.selectedIndex = -1;
        }
        openModal(elements.modals.categories.root);
        window.requestAnimationFrame(() => {
            elements.modals.categories.expenseInput?.focus();
        });
    });

    elements.modals.categories.expenseForm?.addEventListener('submit', event => {
        event.preventDefault();
        const input = elements.modals.categories.expenseInput;
        if (!input) {
            return;
        }
        input.setCustomValidity('');
        const added = addCategoryTag('expense', input.value || '');
        if (added) {
            input.value = '';
            input.focus();
        } else {
            input.setCustomValidity('Tag already exists.');
            input.reportValidity();
        }
    });

    elements.modals.categories.incomeForm?.addEventListener('submit', event => {
        event.preventDefault();
        const input = elements.modals.categories.incomeInput;
        if (!input) {
            return;
        }
        input.setCustomValidity('');
        const added = addCategoryTag('income', input.value || '');
        if (added) {
            input.value = '';
            input.focus();
        } else {
            input.setCustomValidity('Tag already exists.');
            input.reportValidity();
        }
    });

    elements.modals.categories.root?.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        if (target.dataset.action === 'remove') {
            const pill = target.closest('.tag-pill');
            const type = pill?.dataset.type;
            const label = pill?.dataset.label;
            if (type && label) {
                removeCategoryTag(type, label);
            }
        }
    });

    elements.modals.categories.expenseSelect?.addEventListener('keydown', event => {
        handleCategorySelectKeydown(event, 'expense');
    });

    elements.modals.categories.incomeSelect?.addEventListener('keydown', event => {
        handleCategorySelectKeydown(event, 'income');
    });

    elements.modals.historicalReports.form?.addEventListener('submit', handleHistoricalReportsSubmit);

    elements.themeToggle?.addEventListener('click', () => {
        const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        maybeRenderReports();
        maybeRenderHistoricalReports();
    });

    elements.nav.prev?.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderCalendar();
    });
    elements.nav.next?.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderCalendar();
    });
    elements.nav.today?.addEventListener('click', () => {
        state.currentDate = new Date();
        renderCalendar();
    });

    elements.calendarGrid?.addEventListener('click', event => {
        const target = event.target instanceof Element ? event.target : null;
        const cell = target?.closest('.day-cell');
        if (cell && cell.hasAttribute('data-date')) {
            const isoDate = cell.getAttribute('data-date');
            const date = new Date(`${isoDate}T00:00:00`);
            const day = date.getDate();
            hideDayContextMenu();
            showDayModal(date, day);
        }
    });

    elements.calendarGrid?.addEventListener('contextmenu', event => {
        event.preventDefault();
        const target = event.target instanceof Element ? event.target : null;
        const cell = target?.closest('.day-cell');
        if (cell && cell.hasAttribute('data-date')) {
            const isoDate = cell.getAttribute('data-date');
            const date = new Date(`${isoDate}T00:00:00`);
            showDayContextMenu(event.clientX, event.clientY, date);
        }
    });

    elements.addButtons.paycheck?.addEventListener('click', () => openTransactionModal('paycheck'));
    elements.addButtons.expense?.addEventListener('click', () => openTransactionModal('expense'));
    elements.quickExpense?.addEventListener('click', () => openTransactionModal('expense', new Date()));

    elements.modals.transaction.form?.addEventListener('submit', handleTransactionSubmit);
    elements.modals.transactions.list?.addEventListener('click', handleTransactionsListClick);
    elements.modals.day.list?.addEventListener('click', handleDayModalListClick);

    contextMenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!state.contextMenuDate) {
                return;
            }
            const type = button.dataset.type === 'expense' ? 'expense' : 'paycheck';
            openTransactionModal(type, state.contextMenuDate);
        });
    });

    document.addEventListener('click', event => {
        if (elements.dayContextMenu?.classList.contains('active') && !elements.dayContextMenu.contains(event.target)) {
            hideDayContextMenu();
        }
    });
    document.addEventListener('scroll', hideDayContextMenu, true);
    window.addEventListener('resize', hideDayContextMenu);
    window.addEventListener('resize', debounce(() => {
        window.requestAnimationFrame(() => {
            maybeRenderReports();
            maybeRenderHistoricalReports();
        });
    }, 150));

    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && !event.altKey) {
            if (event.shiftKey && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (redo()) {
                    console.log('Redo applied');
                }
                return;
            } else if (!event.shiftKey && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                if (undo()) {
                    console.log('Undo applied');
                }
                return;
            }
        }

        if (event.key === 'Escape') {
            tooltipManager.hide();
            hideHistoricalReportsTooltip(elements);
            if (elements.dayContextMenu?.classList.contains('active')) {
                hideDayContextMenu();
                return;
            }
            elements.sidePanel?.classList.remove('open');
            elements.hamburger?.setAttribute('aria-expanded', 'false');
            state.transactionsModalReturn = false;
            closeAllModals();
        }
    });

    elements.panelArrow?.addEventListener('click', () => {
        hideDayContextMenu();
        const collapsed = Boolean(elements.rightPanel?.classList.toggle('collapsed'));
        elements.panelArrow?.classList.toggle('collapsed', collapsed);
        elements.panelArrow?.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (elements.mainContent) {
            elements.mainContent.classList.toggle('panel-open', !collapsed);
        }
    });
}

// Initialize application
function initialize() {
    loadState(ensureTransactionCategories);
    initTheme();
    registerEventListeners();
    tooltipManager.init();
    resetTransactionForm();
    elements.sidePanel?.classList.remove('open');
    elements.hamburger?.setAttribute('aria-expanded', 'false');
    elements.rightPanel?.classList.add('collapsed');
    elements.panelArrow?.classList.add('collapsed');
    elements.panelArrow?.setAttribute('aria-expanded', 'false');
    elements.mainContent?.classList.remove('panel-open');
    setOverlayVisibility();
    renderCalendar();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}
