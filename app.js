(() => {
    'use strict';

    const STORAGE_KEYS = {
        transactions: 'budgetTransactions',
        balance: 'startingBalance',
        balanceDate: 'startingBalanceDate',
        theme: 'budgetTheme',
        categories: 'budgetCategories'
    };

    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    });

    const DAY_IN_MS = 24 * 60 * 60 * 1000;

    const DEFAULT_CATEGORY_LABEL = 'Uncategorized';
    const DEFAULT_CATEGORIES = {
        expense: [DEFAULT_CATEGORY_LABEL, 'Housing', 'Utilities', 'Groceries', 'Transportation', 'Entertainment'],
        income: [DEFAULT_CATEGORY_LABEL, 'Salary', 'Bonus', 'Other']
    };

    const state = {
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
        }
    };

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

    const cache = {
        version: 0,
        transactionsByDate: new Map(),
        balanceByDate: new Map(),
        balanceComputedUntil: null
    };

    const reportsState = {
        interactivityInitialized: false,
        line: {
            points: [],
            hoverIndex: null,
            data: []
        },
        pie: {
            slices: [],
            hoverIndex: null
        }
    };

    const historicalReportsState = {
        interactivityInitialized: false,
        line: {
            points: [],
            hoverIndex: null,
            data: [],
            range: {
                start: null,
                end: null
            }
        },
        pie: {
            slices: [],
            hoverIndex: null,
            slicesData: [],
            total: 0
        }
    };

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
    function invalidateCaches() {
        state.cacheVersion += 1;
        cache.version = state.cacheVersion;
        cache.transactionsByDate.clear();
        cache.balanceByDate.clear();
        cache.balanceComputedUntil = null;
    }

    function ensureCacheSync() {
        if (cache.version !== state.cacheVersion) {
            cache.transactionsByDate.clear();
            cache.balanceByDate.clear();
            cache.balanceComputedUntil = null;
            cache.version = state.cacheVersion;
        }
    }

    function formatDateKey(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-');
    }

    function ensureCategoriesStructure(value) {
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

    function normalizeTagLabel(label) {
        if (typeof label !== 'string') {
            return '';
        }
        return label.trim().slice(0, 64);
    }

    function sortCategoriesInGroup(group) {
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

    function persistCategories() {
        try {
            localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.categories));
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    }

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

    function getCategoryGroupForTransactionType(type) {
        return isIncomeType(type) ? 'income' : 'expense';
    }

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

    function formatCurrency(value) {
        const numeric = Number.isFinite(value) ? value : 0;
        return currencyFormatter.format(numeric);
    }

    function escapeHtml(value) {
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

    function ensureDate(value) {
        const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function isIncomeType(type) {
        return type === 'income' || type === 'paycheck';
    }

    function occursOnDate(transaction, date) {
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
            case 'monthly':
                if (target.getDate() === start.getDate()) {
                    return true;
                }
                // If the original date is near the end of the month, allow it to fall on the final day of shorter months.
                if (start.getDate() > 28) {
                    const lastDayOfTargetMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
                    return target.getDate() === lastDayOfTargetMonth && start.getDate() > lastDayOfTargetMonth;
                }
                return false;
            default:
                return false;
        }
    }

    function setOverlayVisibility() {
        if (!elements.overlay) {
            return;
        }
        const panelOpen = elements.sidePanel?.classList.contains('open');
        const modalOpen = allModals.some(modal => modal?.classList.contains('active'));
        elements.overlay.classList.toggle('active', Boolean(panelOpen || modalOpen));
    }

    function openModal(modal) {
        if (!modal) {
            return;
        }
        tooltipManager.hide();
        hideHistoricalReportsTooltip();
        modal.classList.add('active');
        setOverlayVisibility();
    }

    function closeModal(modal) {
        if (!modal) {
            return;
        }
        modal.classList.remove('active');
        if (modal === elements.modals.reports.root) {
            reportsState.line.hoverIndex = null;
            reportsState.pie.hoverIndex = null;
            hideReportsTooltip();
            renderReportsLineChart();
            renderReportsPieChart();
        } else if (modal === elements.modals.historicalReports.root) {
            historicalReportsState.line.hoverIndex = null;
            historicalReportsState.pie.hoverIndex = null;
            hideHistoricalReportsTooltip();
        }
        setOverlayVisibility();
    }

    function closeAllModals() {
        allModals.forEach(modal => modal?.classList.remove('active'));
        reportsState.line.hoverIndex = null;
        reportsState.pie.hoverIndex = null;
        hideReportsTooltip();
        historicalReportsState.line.hoverIndex = null;
        historicalReportsState.pie.hoverIndex = null;
        hideHistoricalReportsTooltip();
        setOverlayVisibility();
    }

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

    function loadState() {
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
        ensureTransactionCategories();
        invalidateCaches();
    }

    function persistState() {
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
            console.error('Error saving data:', error);
        }
    }

    function clearStoredData() {
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

    function getTransactionsForDate(date) {
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

    function getMonthlyTransactionOccurrences(year, month) {
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

    function getProjectedMonthlyBalances(monthCount = 24) {
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

    function getMonthlyExpenseBreakdown() {
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

    function renderReportsLineChart() {
        const modal = elements.modals.reports;
        if (!modal?.lineCanvas) {
            return;
        }

        const ctx = modal.lineCanvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const data = getProjectedMonthlyBalances(24);
        const hasData = data.length > 0;
        if (modal.lineEmpty) {
            modal.lineEmpty.classList.toggle('visible', !hasData);
        }
        modal.lineCanvas.style.display = hasData ? 'block' : 'none';
        if (modal.lineLegend) {
            modal.lineLegend.innerHTML = '';
        }
        if (!hasData) {
            ctx.clearRect(0, 0, modal.lineCanvas.width, modal.lineCanvas.height);
            reportsState.line.points = [];
            reportsState.line.data = [];
            reportsState.line.hoverIndex = null;
            modal.lineCanvas.style.cursor = 'default';
            return;
        }

        if (reportsState.line.hoverIndex !== null && reportsState.line.hoverIndex >= data.length) {
            reportsState.line.hoverIndex = null;
        }
        reportsState.line.data = data;
        reportsState.line.points = [];

        const values = data.map(point => point.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const padding = (maxValue - minValue) * 0.08 || Math.max(Math.abs(maxValue), Math.abs(minValue), 1) * 0.05;
        const chartMin = minValue - padding;
        const chartMax = maxValue + padding;

        const canvas = modal.lineCanvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDarkTheme ? 'rgba(251, 146, 60, 0.12)' : 'rgba(250, 165, 74, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const margin = { top: 52, right: 32, bottom: 60, left: 90 };
        const width = canvas.width - margin.left - margin.right;
        const height = canvas.height - margin.top - margin.bottom;

        const scaleX = index => {
            if (data.length === 1) {
                return margin.left + width / 2;
            }
            return margin.left + (index / (data.length - 1)) * width;
        };
        const scaleY = value => {
            if (chartMax === chartMin) {
                return margin.top + height / 2;
            }
            return margin.top + height - ((value - chartMin) / (chartMax - chartMin)) * height;
        };

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + height);
        ctx.lineTo(margin.left + width, margin.top + height);
        ctx.stroke();

        const gridLines = 4;
        ctx.setLineDash([4, 6]);
        for (let i = 1; i <= gridLines; i += 1) {
            const y = margin.top + (i / (gridLines + 1)) * height;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + width, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + height);
        const lineColor = isDarkTheme ? '#fb923c' : '#ea580c';
        gradient.addColorStop(0, isDarkTheme ? 'rgba(251, 146, 60, 0.45)' : 'rgba(234, 88, 12, 0.35)');
        gradient.addColorStop(0.7, isDarkTheme ? 'rgba(251, 146, 60, 0.15)' : 'rgba(234, 88, 12, 0.12)');
        gradient.addColorStop(1, isDarkTheme ? 'rgba(251, 146, 60, 0.05)' : 'rgba(234, 88, 12, 0.02)');

        ctx.beginPath();
        data.forEach((point, index) => {
            const x = scaleX(index);
            const y = scaleY(point.value);
            reportsState.line.points.push({
                x,
                y,
                label: point.label,
                value: point.value
            });
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.lineTo(scaleX(data.length - 1), margin.top + height);
        ctx.lineTo(scaleX(0), margin.top + height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.fillStyle = lineColor;
        reportsState.line.points.forEach((point, index) => {
            const { x, y, value } = point;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isDarkTheme ? '#0f172a' : '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            if (reportsState.line.hoverIndex === index) {
                ctx.beginPath();
                ctx.arc(x, y, 7, 0, Math.PI * 2);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.setLineDash([6, 6]);
                ctx.moveTo(x, margin.top + height);
                ctx.lineTo(x, margin.top);
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.setLineDash([]);

                const previousBaseline = ctx.textBaseline;
                ctx.fillStyle = isDarkTheme ? '#e2e8f0' : '#0f172a';
                ctx.font = '12px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(formatCurrency(value), x, margin.top - 6);
                ctx.fillStyle = lineColor;
                ctx.textBaseline = previousBaseline;
            }
        });

        ctx.fillStyle = isDarkTheme ? '#e2e8f0' : '#4b5563';
        ctx.font = '14px "Segoe UI", sans-serif';
        ctx.textBaseline = 'top';
        const labelStep = Math.max(1, Math.floor(data.length / 6));
        data.forEach((point, index) => {
            if (index % labelStep !== 0 && index !== data.length - 1) {
                return;
            }
            const x = scaleX(index);
            const y = margin.top + height + 24;
            ctx.textAlign = index === data.length - 1 ? 'right' : 'center';
            ctx.fillText(point.label, x, y);
        });

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.fillText(formatCurrency(chartMax), margin.left - 12, margin.top + 8);
        ctx.fillText(formatCurrency(chartMin), margin.left - 12, margin.top + height - 8);

        if (modal.lineLegend) {
            const start = data[0];
            const end = data[data.length - 1];
            const delta = end.value - start.value;
            const deltaLabel = `${delta >= 0 ? '+' : ''}${formatCurrency(delta)}`;
            const trendColor = delta >= 0 ? '#16a34a' : '#dc2626';
            modal.lineLegend.innerHTML = `
                <div class="report-legend-item">
                    <span class="report-legend-swatch" style="background:${lineColor};"></span>
                    <span>Projected balance</span>
                </div>
                <div class="report-legend-item">
                    <strong>Current:</strong> ${escapeHtml(formatCurrency(start.value))}
                </div>
                <div class="report-legend-item">
                    <strong style="color:${trendColor};">24 Months:</strong>
                    <span style="color:${trendColor};">${escapeHtml(formatCurrency(end.value))} (${escapeHtml(deltaLabel)})</span>
                </div>
            `;
        }

        modal.lineCanvas.style.cursor = reportsState.line.hoverIndex !== null ? 'pointer' : 'default';
    }

    function renderReportsPieChart() {
        const modal = elements.modals.reports;
        if (!modal?.pieCanvas) {
            return;
        }

        const ctx = modal.pieCanvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const data = getMonthlyExpenseBreakdown();
        const hasData = data.length > 0;
        if (modal.pieEmpty) {
            modal.pieEmpty.classList.toggle('visible', !hasData);
        }
        modal.pieCanvas.style.display = hasData ? 'block' : 'none';
        if (modal.pieLegend) {
            modal.pieLegend.innerHTML = '';
        }
        if (!hasData) {
            ctx.clearRect(0, 0, modal.pieCanvas.width, modal.pieCanvas.height);
            reportsState.pie.slices = [];
            reportsState.pie.hoverIndex = null;
            modal.pieCanvas.style.cursor = 'default';
            return;
        }

        if (reportsState.pie.hoverIndex !== null && reportsState.pie.hoverIndex >= data.length) {
            reportsState.pie.hoverIndex = null;
        }
        reportsState.pie.slices = [];

        const total = data.reduce((sum, item) => sum + item.value, 0);
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        const colors = [
            '#ea580c', '#f97316', '#facc15', '#22c55e', '#f43f5e',
            '#c084fc', '#0ea5e9', '#14b8a6', '#f472b6', '#f87171'
        ];

        const canvas = modal.pieCanvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 16;

        let startAngle = -Math.PI / 2;
        let accumulatedAngle = 0;
        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;
            const color = colors[index % colors.length];

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            ctx.lineWidth = 2;
            ctx.strokeStyle = isDarkTheme ? '#0f172a' : '#ffffff';
            ctx.stroke();

            const midAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(midAngle) * (radius * 0.6);
            const labelY = centerY + Math.sin(midAngle) * (radius * 0.6);
            ctx.fillStyle = isDarkTheme ? '#e2e8f0' : '#0f172a';
            ctx.font = 'bold 13px "Segoe UI", sans-serif';
            const percent = Math.round((item.value / total) * 100);
            const label = `${percent}%`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, labelX, labelY);

            reportsState.pie.slices.push({
                startAngle,
                endAngle,
                normalizedStart: accumulatedAngle,
                normalizedEnd: accumulatedAngle + sliceAngle,
                color,
                label: item.label,
                value: item.value,
                percentage: item.value / total,
                centerX,
                centerY,
                radius
            });

            if (reportsState.pie.hoverIndex === index) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 4, startAngle, endAngle);
                ctx.strokeStyle = isDarkTheme ? 'rgba(15, 23, 42, 0.75)' : 'rgba(17, 24, 39, 0.25)';
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            startAngle = endAngle;
            accumulatedAngle += sliceAngle;
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = isDarkTheme ? 'rgba(234, 88, 12, 0.22)' : 'rgba(234, 88, 12, 0.08)';
        ctx.fill();

        reportsState.pie.centerX = centerX;
        reportsState.pie.centerY = centerY;
        reportsState.pie.radius = radius;
        reportsState.pie.total = total;

        if (modal.pieLegend) {
            modal.pieLegend.innerHTML = data.map((item, index) => {
                const color = colors[index % colors.length];
                const percentage = ((item.value / total) * 100).toFixed(1).replace(/\.0$/, '');
                return `
                    <div class="report-legend-item">
                        <span class="report-legend-swatch" style="background:${color};"></span>
                        <span>${escapeHtml(item.label)} — ${escapeHtml(formatCurrency(item.value))} (${escapeHtml(percentage)}%)</span>
                    </div>
                `;
            }).join('');
        }

        modal.pieCanvas.style.cursor = reportsState.pie.hoverIndex !== null ? 'pointer' : 'default';
    }

    function showReportsTooltip(content, clientX, clientY) {
        const tooltip = elements.modals.reports.tooltip;
        const modalRoot = elements.modals.reports.root;
        const modalBody = modalRoot?.querySelector('.modal-body');
        if (!tooltip || !modalRoot || !modalBody) {
            return;
        }

        tooltip.innerHTML = content;
        tooltip.classList.add('visible');

        const bodyRect = modalBody.getBoundingClientRect();
        const relativeX = clientX - bodyRect.left;
        const relativeY = clientY - bodyRect.top;

        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;

        const horizontalPadding = 12;
        const verticalPadding = 12;
        const offsetX = 16;
        const offsetY = 16;

        let adjustedX = relativeX + offsetX;
        let adjustedY = relativeY + offsetY;

        if (adjustedX + tooltipWidth > bodyRect.width - horizontalPadding) {
            adjustedX = bodyRect.width - horizontalPadding - tooltipWidth;
        }
        if (adjustedY + tooltipHeight > bodyRect.height - verticalPadding) {
            adjustedY = bodyRect.height - verticalPadding - tooltipHeight;
        }
        if (adjustedX < horizontalPadding) {
            adjustedX = horizontalPadding;
        }
        if (adjustedY < verticalPadding) {
            adjustedY = verticalPadding;
        }

        tooltip.style.left = `${adjustedX}px`;
        tooltip.style.top = `${adjustedY}px`;
    }

    function hideReportsTooltip() {
        const tooltip = elements.modals.reports.tooltip;
        if (!tooltip) {
            return;
        }
        tooltip.classList.remove('visible');
    }

    function initializeReportsInteractivity() {
        if (reportsState.interactivityInitialized) {
            return;
        }
        const modal = elements.modals.reports;
        if (!modal?.lineCanvas || !modal?.pieCanvas) {
            return;
        }

        modal.lineCanvas.addEventListener('mousemove', handleReportsLineHover);
        modal.lineCanvas.addEventListener('mouseleave', () => handleReportsLineHover(null));
        modal.pieCanvas.addEventListener('mousemove', handleReportsPieHover);
        modal.pieCanvas.addEventListener('mouseleave', () => handleReportsPieHover(null));
        reportsState.interactivityInitialized = true;
    }

    function handleReportsLineHover(event) {
        const canvas = elements.modals.reports.lineCanvas;
        if (!canvas) {
            return;
        }

        if (!event) {
            if (reportsState.line.hoverIndex !== null) {
                reportsState.line.hoverIndex = null;
                renderReportsLineChart();
            }
            canvas.style.cursor = 'default';
            hideReportsTooltip();
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        let closestIndex = -1;
        let closestDistance = Infinity;
        reportsState.line.points.forEach((point, index) => {
            const distance = Math.hypot(point.x - x, point.y - y);
            if (distance < 12 && distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== -1) {
            if (reportsState.line.hoverIndex !== closestIndex) {
                reportsState.line.hoverIndex = closestIndex;
                renderReportsLineChart();
            }
            const point = reportsState.line.points[closestIndex];
            showReportsTooltip(`
                <strong>${escapeHtml(point.label)}</strong>
                <span>${escapeHtml(formatCurrency(point.value))}</span>
            `, event.clientX, event.clientY);
            canvas.style.cursor = 'pointer';
        } else {
            if (reportsState.line.hoverIndex !== null) {
                reportsState.line.hoverIndex = null;
                renderReportsLineChart();
            }
            canvas.style.cursor = 'default';
            hideReportsTooltip();
        }
    }

    function handleReportsPieHover(event) {
        const canvas = elements.modals.reports.pieCanvas;
        if (!canvas) {
            return;
        }

        if (!event) {
            if (reportsState.pie.hoverIndex !== null) {
                reportsState.pie.hoverIndex = null;
                renderReportsPieChart();
            }
            canvas.style.cursor = 'default';
            hideReportsTooltip();
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const dx = x - (reportsState.pie.centerX || 0);
        const dy = y - (reportsState.pie.centerY || 0);
        const distance = Math.hypot(dx, dy);
        const radius = reportsState.pie.radius || 0;

        if (!radius || distance > radius || distance < radius * 0.15) {
            if (reportsState.pie.hoverIndex !== null) {
                reportsState.pie.hoverIndex = null;
                renderReportsPieChart();
            }
            canvas.style.cursor = 'default';
            hideReportsTooltip();
            return;
        }

        const angle = Math.atan2(dy, dx);
        let normalizedAngle = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);

        let hoveredIndex = -1;
        reportsState.pie.slices.forEach((slice, index) => {
            if (normalizedAngle >= slice.normalizedStart && normalizedAngle < slice.normalizedEnd) {
                hoveredIndex = index;
            }
        });
        if (hoveredIndex === -1 && reportsState.pie.slices.length) {
            hoveredIndex = reportsState.pie.slices.length - 1;
        }

        if (hoveredIndex !== -1) {
            if (reportsState.pie.hoverIndex !== hoveredIndex) {
                reportsState.pie.hoverIndex = hoveredIndex;
                renderReportsPieChart();
            }
            const slice = reportsState.pie.slices[hoveredIndex];
            const percentageLabel = (slice.percentage * 100).toFixed(1).replace(/\.0$/, '');
            showReportsTooltip(`
                <strong>${escapeHtml(slice.label)}</strong>
                <span>${escapeHtml(formatCurrency(slice.value))} • ${escapeHtml(percentageLabel)}%</span>
            `, event.clientX, event.clientY);
            canvas.style.cursor = 'pointer';
        } else {
            if (reportsState.pie.hoverIndex !== null) {
                reportsState.pie.hoverIndex = null;
                renderReportsPieChart();
            }
            canvas.style.cursor = 'default';
            hideReportsTooltip();
        }
    }

    function renderReports() {
        renderReportsLineChart();
        renderReportsPieChart();
        initializeReportsInteractivity();
    }

    function getDateRangeDailySummaries(startDate, endDate) {
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

    function getDateRangeExpenseBreakdown(startDate, endDate) {
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

    function showHistoricalReportsTooltip(content, clientX, clientY) {
        const modal = elements.modals.historicalReports;
        if (!modal?.tooltip || !modal.root) {
            return;
        }
        const modalBody = modal.root.querySelector('.modal-body');
        if (!modalBody) {
            return;
        }
        modal.tooltip.innerHTML = content;
        modal.tooltip.classList.add('visible');
        const bodyRect = modalBody.getBoundingClientRect();
        const tooltipRect = modal.tooltip.getBoundingClientRect();
        let left = clientX - bodyRect.left + modalBody.scrollLeft;
        let top = clientY - bodyRect.top + modalBody.scrollTop - 24;
        left = Math.max(12, Math.min(left, modalBody.scrollWidth - tooltipRect.width - 12));
        top = Math.max(12, Math.min(top, modalBody.scrollHeight - tooltipRect.height - 12));
        modal.tooltip.style.left = `${left}px`;
        modal.tooltip.style.top = `${top}px`;
    }

    function hideHistoricalReportsTooltip() {
        const modal = elements.modals.historicalReports;
        if (!modal?.tooltip) {
            return;
        }
        modal.tooltip.classList.remove('visible');
    }

    function renderHistoricalLineChart() {
        const modal = elements.modals.historicalReports;
        const canvas = modal?.lineCanvas;
        if (!modal || !canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        const data = historicalReportsState.line.data;
        const hasData = data.length > 0;
        if (modal.lineEmpty) {
            modal.lineEmpty.classList.toggle('visible', !hasData);
        }
        canvas.style.display = hasData ? 'block' : 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        historicalReportsState.line.points = [];
        if (!hasData) {
            historicalReportsState.line.hoverIndex = null;
            hideHistoricalReportsTooltip();
            return;
        }

        const values = data.map(item => item.balance);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const padding = (maxValue - minValue) * 0.1 || Math.max(Math.abs(maxValue), Math.abs(minValue), 1) * 0.05;
        const chartMin = minValue - padding;
        const chartMax = maxValue + padding;

        const margin = { top: 48, right: 36, bottom: 48, left: 80 };
        const width = canvas.width - margin.left - margin.right;
        const height = canvas.height - margin.top - margin.bottom;

        const scaleX = index => {
            if (data.length === 1) {
                return margin.left + width / 2;
            }
            return margin.left + (index / (data.length - 1)) * width;
        };
        const scaleY = value => {
            if (chartMax === chartMin) {
                return margin.top + height / 2;
            }
            return margin.top + ((chartMax - value) / (chartMax - chartMin)) * height;
        };

        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDarkTheme ? 'rgba(15, 23, 42, 0.65)' : 'rgba(250, 165, 74, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = isDarkTheme ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + height);
        ctx.lineTo(margin.left + width, margin.top + height);
        ctx.stroke();

        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillStyle = isDarkTheme ? '#cbd5f5' : '#475569';
        ctx.textBaseline = 'bottom';
        const tickCount = 4;
        for (let i = 0; i <= tickCount; i += 1) {
            const value = chartMin + ((chartMax - chartMin) / tickCount) * i;
            const y = margin.top + ((tickCount - i) / tickCount) * height;
            ctx.beginPath();
            ctx.strokeStyle = isDarkTheme ? 'rgba(100, 116, 139, 0.32)' : 'rgba(148, 163, 184, 0.25)';
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + width, y);
            ctx.stroke();
            ctx.fillStyle = isDarkTheme ? '#e2e8f0' : '#1f2937';
            ctx.textAlign = 'right';
            ctx.fillText(formatCurrency(value), margin.left - 12, y + 4);
        }

        ctx.beginPath();
        data.forEach((item, index) => {
            const x = scaleX(index);
            const y = scaleY(item.balance);
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.lineTo(margin.left + width, margin.top + height);
        ctx.lineTo(margin.left, margin.top + height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(249, 115, 22, 0.12)';
        ctx.fill();

        data.forEach((item, index) => {
            const x = scaleX(index);
            const y = scaleY(item.balance);
            historicalReportsState.line.points.push({
                x,
                y,
                data: item
            });
        });

        historicalReportsState.line.points.forEach((point, index) => {
            ctx.beginPath();
            const radius = historicalReportsState.line.hoverIndex === index ? 6 : 4;
            ctx.fillStyle = historicalReportsState.line.hoverIndex === index ? '#fb923c' : '#f97316';
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isDarkTheme ? '#0f172a' : '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillStyle = isDarkTheme ? '#e2e8f0' : '#0f172a';
        const labelInterval = Math.max(1, Math.floor(data.length / 6));
        data.forEach((item, index) => {
            if (index % labelInterval !== 0 && index !== data.length - 1 && index !== 0) {
                return;
            }
            const x = scaleX(index);
            const label = item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            ctx.fillText(label, x, margin.top + height + 12);
        });

        canvas.style.cursor = historicalReportsState.line.hoverIndex !== null ? 'pointer' : 'default';
    }

    function renderHistoricalPieChart() {
        const modal = elements.modals.historicalReports;
        const canvas = modal?.pieCanvas;
        if (!modal || !canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        const data = historicalReportsState.pie.slicesData || [];
        const hasData = data.length > 0;
        if (modal.pieEmpty) {
            modal.pieEmpty.classList.toggle('visible', !hasData);
        }
        canvas.style.display = hasData ? 'block' : 'none';
        if (modal.pieLegend) {
            modal.pieLegend.innerHTML = '';
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        historicalReportsState.pie.slices = [];
        if (!hasData) {
            historicalReportsState.pie.hoverIndex = null;
            historicalReportsState.pie.total = 0;
            hideHistoricalReportsTooltip();
            return;
        }

        const total = data.reduce((sum, item) => sum + item.value, 0);
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        const colors = [
            '#ea580c', '#f97316', '#facc15', '#22c55e', '#f43f5e',
            '#c084fc', '#0ea5e9', '#14b8a6', '#f472b6', '#f87171'
        ];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 16;
        let startAngle = -Math.PI / 2;
        let sweep = 0;
        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;
            const color = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = isDarkTheme ? '#0f172a' : '#ffffff';
            ctx.stroke();

            const midAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(midAngle) * (radius * 0.6);
            const labelY = centerY + Math.sin(midAngle) * (radius * 0.6);
            ctx.fillStyle = isDarkTheme ? '#e2e8f0' : '#0f172a';
            ctx.font = 'bold 13px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const percent = Math.round((item.value / total) * 100);
            ctx.fillText(`${percent}%`, labelX, labelY);

            historicalReportsState.pie.slices.push({
                startAngle,
                endAngle,
                normalizedStart: sweep,
                normalizedEnd: sweep + sliceAngle,
                centerX,
                centerY,
                radius,
                color,
                item
            });

            if (historicalReportsState.pie.hoverIndex === index) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 4, startAngle, endAngle);
                ctx.strokeStyle = isDarkTheme ? 'rgba(248, 250, 252, 0.45)' : 'rgba(17, 24, 39, 0.25)';
                ctx.lineWidth = 4;
                ctx.stroke();
            }

            startAngle = endAngle;
            sweep += sliceAngle;
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.12)';
        ctx.fill();

        historicalReportsState.pie.total = total;

        if (modal.pieLegend) {
            modal.pieLegend.innerHTML = data.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1).replace(/\.0$/, '');
                const color = colors[index % colors.length];
                return `
                    <div class="report-legend-item">
                        <span class="report-legend-swatch" style="background:${color};"></span>
                        <span>${escapeHtml(item.label)} — ${escapeHtml(formatCurrency(item.value))} (${escapeHtml(percentage)}%)</span>
                    </div>
                `;
            }).join('');
        }

        canvas.style.cursor = historicalReportsState.pie.hoverIndex !== null ? 'pointer' : 'default';
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
        hideHistoricalReportsTooltip();
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

        renderHistoricalLineChart();
        renderHistoricalPieChart();
    }

    function initializeHistoricalReportsInteractivity() {
        if (historicalReportsState.interactivityInitialized) {
            return;
        }
        const lineCanvas = elements.modals.historicalReports.lineCanvas;
        const pieCanvas = elements.modals.historicalReports.pieCanvas;
        if (lineCanvas) {
            lineCanvas.addEventListener('mousemove', event => {
                if (!historicalReportsState.line.points.length) {
                    return;
                }
                const rect = lineCanvas.getBoundingClientRect();
                const x = (event.clientX - rect.left) * (lineCanvas.width / rect.width);
                const y = (event.clientY - rect.top) * (lineCanvas.height / rect.height);
                let closestIndex = -1;
                let smallestDistance = Infinity;
                historicalReportsState.line.points.forEach((point, index) => {
                    const distance = Math.abs(point.x - x);
                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        closestIndex = index;
                    }
                });
                const threshold = Math.max(lineCanvas.width / 40, 24);
                if (closestIndex !== -1 && smallestDistance <= threshold) {
                    if (historicalReportsState.line.hoverIndex !== closestIndex) {
                        historicalReportsState.line.hoverIndex = closestIndex;
                        renderHistoricalLineChart();
                    }
                    const point = historicalReportsState.line.points[closestIndex];
                    const day = point.data;
                    const label = day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    const content = `
                        <strong>${escapeHtml(label)}</strong>
                        <div>Balance: ${escapeHtml(formatCurrency(day.balance))}</div>
                        <div>Income: ${escapeHtml(formatCurrency(day.income))}</div>
                        <div>Expenses: ${escapeHtml(formatCurrency(day.expenses))}</div>
                    `;
                    showHistoricalReportsTooltip(content, event.clientX, event.clientY);
                } else if (historicalReportsState.line.hoverIndex !== null) {
                    historicalReportsState.line.hoverIndex = null;
                    renderHistoricalLineChart();
                    hideHistoricalReportsTooltip();
                }
            });

            lineCanvas.addEventListener('mouseleave', () => {
                if (historicalReportsState.line.hoverIndex !== null) {
                    historicalReportsState.line.hoverIndex = null;
                    renderHistoricalLineChart();
                }
                hideHistoricalReportsTooltip();
            });
        }

        if (pieCanvas) {
            pieCanvas.addEventListener('mousemove', event => {
                if (!historicalReportsState.pie.slices.length) {
                    return;
                }
                const firstSlice = historicalReportsState.pie.slices[0];
                if (!firstSlice) {
                    return;
                }
                const rect = pieCanvas.getBoundingClientRect();
                const x = (event.clientX - rect.left) * (pieCanvas.width / rect.width);
                const y = (event.clientY - rect.top) * (pieCanvas.height / rect.height);
                const dx = x - firstSlice.centerX;
                const dy = y - firstSlice.centerY;
                const distance = Math.hypot(dx, dy);
                const radius = firstSlice.radius;
                if (!radius || distance > radius || distance < radius * 0.15) {
                    if (historicalReportsState.pie.hoverIndex !== null) {
                        historicalReportsState.pie.hoverIndex = null;
                        renderHistoricalPieChart();
                        hideHistoricalReportsTooltip();
                    }
                    return;
                }
                const angle = Math.atan2(dy, dx);
                let normalizedAngle = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
                let hoveredIndex = -1;
                historicalReportsState.pie.slices.forEach((slice, index) => {
                    if (normalizedAngle >= slice.normalizedStart && normalizedAngle < slice.normalizedEnd) {
                        hoveredIndex = index;
                    }
                });
                if (hoveredIndex === -1 && historicalReportsState.pie.slices.length) {
                    hoveredIndex = historicalReportsState.pie.slices.length - 1;
                }
                if (hoveredIndex !== -1) {
                    if (historicalReportsState.pie.hoverIndex !== hoveredIndex) {
                        historicalReportsState.pie.hoverIndex = hoveredIndex;
                        renderHistoricalPieChart();
                    }
                    const slice = historicalReportsState.pie.slices[hoveredIndex];
                    const total = historicalReportsState.pie.total || historicalReportsState.pie.slices.reduce((sum, entry) => sum + entry.item.value, 0);
                    const percentage = total ? (slice.item.value / total) * 100 : 0;
                    const content = `
                        <strong>${escapeHtml(slice.item.label)}</strong>
                        <div>${escapeHtml(formatCurrency(slice.item.value))} • ${escapeHtml(percentage.toFixed(1).replace(/\\.0$/, ''))}%</div>
                    `;
                    showHistoricalReportsTooltip(content, event.clientX, event.clientY);
                }
            });

            pieCanvas.addEventListener('mouseleave', () => {
                if (historicalReportsState.pie.hoverIndex !== null) {
                    historicalReportsState.pie.hoverIndex = null;
                    renderHistoricalPieChart();
                }
                hideHistoricalReportsTooltip();
            });
        }
        document.addEventListener('pointerdown', hideHistoricalReportsTooltip, true);
        document.addEventListener('scroll', hideHistoricalReportsTooltip, true);
        historicalReportsState.interactivityInitialized = true;
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
        initializeHistoricalReportsInteractivity();
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

    function calculateBalanceForDate(date) {
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

    function getDayTooltipContent(date) {
        const normalized = ensureDate(date);
        if (!normalized) {
            return '';
        }

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

    function createDayCell(day, date, { otherMonth = false, isToday = false } = {}) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        if (otherMonth) cell.classList.add('other-month');
        if (isToday) cell.classList.add('today');

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
        tooltipManager.attach(cell, {
            html: true,
            getContent: () => getDayTooltipContent(date)
        });

        cell.addEventListener('click', () => {
            hideDayContextMenu();
            showDayModal(date, day);
        });

        cell.addEventListener('contextmenu', event => {
            event.preventDefault();
            showDayContextMenu(event.clientX, event.clientY, date);
        });

        return cell;
    }

    function renderCalendar() {
        if (!elements.calendarGrid) {
            return;
        }

        hideDayContextMenu();
        tooltipManager.hide();

        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();
        elements.currentMonthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

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
            grid.appendChild(createDayCell(day, date, { otherMonth: true }));
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(year, month, day);
            const isToday = day === state.today.getDate() &&
                month === state.today.getMonth() &&
                year === state.today.getFullYear();
            grid.appendChild(createDayCell(day, date, { isToday }));
        }

        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day += 1) {
            const date = new Date(year, month + 1, day);
            grid.appendChild(createDayCell(day, date, { otherMonth: true }));
        }

        updateStats();
        renderTransactionsModal();
        maybeRenderReports();
    }

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
        hideHistoricalReportsTooltip();

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
        window.addEventListener('resize', () => {
            window.requestAnimationFrame(() => {
                maybeRenderReports();
                maybeRenderHistoricalReports();
            });
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                tooltipManager.hide();
                hideHistoricalReportsTooltip();
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

    function initialize() {
        loadState();
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
})();
