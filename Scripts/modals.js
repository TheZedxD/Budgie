/**
 * Modal Management Module
 * Handles modal opening, closing, focus management, and accessibility
 */

import {
    reportsState,
    historicalReportsState,
    hideReportsTooltip,
    hideHistoricalReportsTooltip,
    renderReportsLineChart,
    renderReportsPieChart
} from './charts.js';

// Modal accessibility state for focus management
const modalAccessibility = {
    previouslyFocusedElement: null,
    activeModal: null
};

/**
 * Set overlay visibility based on panel and modal states
 * @param {Object} elements - Elements object containing overlay, sidePanel references
 * @param {Array} allModals - Array of all modal elements
 */
export function setOverlayVisibility(elements, allModals) {
    if (!elements.overlay) {
        return;
    }
    const panelOpen = elements.sidePanel?.classList.contains('open');
    const modalOpen = allModals.some(modal => modal?.classList.contains('active'));
    elements.overlay.classList.toggle('active', Boolean(panelOpen || modalOpen));
}

/**
 * Get all focusable elements in a modal
 * @param {HTMLElement} modal - The modal element
 * @returns {Array<HTMLElement>} Array of focusable elements
 */
export function getFocusableElements(modal) {
    if (!modal) return [];
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(modal.querySelectorAll(selector)).filter(el => {
        return !el.disabled && el.offsetParent !== null;
    });
}

/**
 * Handle tab key trap for modal accessibility
 * @param {KeyboardEvent} event - The keyboard event
 * @param {HTMLElement} modal - The modal element
 */
export function handleModalTabTrap(event, modal) {
    if (event.key !== 'Tab') return;

    const focusableElements = getFocusableElements(modal);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
    } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
}

/**
 * Open a modal with proper focus management and accessibility
 * @param {HTMLElement} modal - The modal element to open
 * @param {Object} tooltipManager - Tooltip manager instance
 * @param {Object} elements - Elements object for chart tooltips
 */
export function openModal(modal, tooltipManager, elements) {
    if (!modal) {
        return;
    }

    // Save previously focused element
    modalAccessibility.previouslyFocusedElement = document.activeElement;
    modalAccessibility.activeModal = modal;

    if (tooltipManager) {
        tooltipManager.hide();
    }
    if (elements) {
        hideHistoricalReportsTooltip(elements);
    }

    modal.classList.add('active');

    // Focus first focusable element in modal
    window.requestAnimationFrame(() => {
        const focusableElements = getFocusableElements(modal);
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    });

    // Add tab trap listener
    const tabTrapHandler = (event) => handleModalTabTrap(event, modal);
    modal.addEventListener('keydown', tabTrapHandler);
    modal._tabTrapHandler = tabTrapHandler;
}

/**
 * Close a modal with proper cleanup and focus restoration
 * @param {HTMLElement} modal - The modal element to close
 * @param {Object} elements - Elements object containing modal references
 */
export function closeModal(modal, elements) {
    if (!modal) {
        return;
    }

    modal.classList.remove('active');

    // Remove tab trap listener
    if (modal._tabTrapHandler) {
        modal.removeEventListener('keydown', modal._tabTrapHandler);
        delete modal._tabTrapHandler;
    }

    // Restore previously focused element
    if (modalAccessibility.activeModal === modal) {
        const elementToFocus = modalAccessibility.previouslyFocusedElement;
        if (elementToFocus &&
            typeof elementToFocus.focus === 'function' &&
            document.body.contains(elementToFocus)) {
            window.requestAnimationFrame(() => {
                try {
                    if (document.body.contains(elementToFocus) && typeof elementToFocus.focus === 'function') {
                        elementToFocus.focus();
                    }
                } catch (e) {
                    // Element may have been removed or is no longer focusable
                    console.debug('Could not restore focus:', e);
                }
            });
        }
        modalAccessibility.previouslyFocusedElement = null;
        modalAccessibility.activeModal = null;
    }

    // Clear chart hover states when closing chart modals
    if (elements && modal === elements.modals.reports.root) {
        reportsState.line.hoverIndex = null;
        reportsState.pie.hoverIndex = null;
        hideReportsTooltip(elements);
        renderReportsLineChart(elements);
        renderReportsPieChart(elements);
    } else if (elements && modal === elements.modals.historicalReports.root) {
        historicalReportsState.line.hoverIndex = null;
        historicalReportsState.pie.hoverIndex = null;
        hideHistoricalReportsTooltip(elements);
    }
}

/**
 * Close all modals
 * @param {Array} allModals - Array of all modal elements
 * @param {Object} elements - Elements object for chart cleanup
 */
export function closeAllModals(allModals, elements) {
    allModals.forEach(modal => {
        if (modal?.classList.contains('active')) {
            modal.classList.remove('active');
            // Remove tab trap listener if present
            if (modal._tabTrapHandler) {
                modal.removeEventListener('keydown', modal._tabTrapHandler);
                delete modal._tabTrapHandler;
            }
        }
    });

    // Reset modal accessibility state
    modalAccessibility.previouslyFocusedElement = null;
    modalAccessibility.activeModal = null;

    if (elements) {
        reportsState.line.hoverIndex = null;
        reportsState.pie.hoverIndex = null;
        hideReportsTooltip(elements);
        historicalReportsState.line.hoverIndex = null;
        historicalReportsState.pie.hoverIndex = null;
        hideHistoricalReportsTooltip(elements);
    }
}
