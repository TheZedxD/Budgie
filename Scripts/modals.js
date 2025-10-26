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
        console.warn('setOverlayVisibility: overlay element not found');
        return;
    }
    const panelOpen = elements.sidePanel?.classList.contains('open');
    const modalOpen = allModals.some(modal => modal?.classList.contains('active'));
    const shouldBeActive = Boolean(panelOpen || modalOpen);

    console.log('setOverlayVisibility:', {
        panelOpen,
        modalOpen,
        shouldBeActive,
        currentlyActive: elements.overlay.classList.contains('active')
    });

    elements.overlay.classList.toggle('active', shouldBeActive);
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
    try {
        if (!modal) {
            return;
        }

        // Save previously focused element - handle case where document.activeElement might be null
        try {
            modalAccessibility.previouslyFocusedElement = document.activeElement || null;
            modalAccessibility.activeModal = modal;
        } catch (e) {
            console.debug('Error saving focus state:', e);
            modalAccessibility.previouslyFocusedElement = null;
            modalAccessibility.activeModal = modal;
        }

        try {
            if (tooltipManager && tooltipManager.hide) {
                tooltipManager.hide();
            }
        } catch (e) {
            console.debug('Error hiding tooltip:', e);
        }

        try {
            if (elements) {
                hideHistoricalReportsTooltip(elements);
            }
        } catch (e) {
            console.debug('Error hiding historical tooltip:', e);
        }

        modal.classList.add('active');

        // Focus first focusable element in modal
        try {
            window.requestAnimationFrame(() => {
                try {
                    const focusableElements = getFocusableElements(modal);
                    if (focusableElements && focusableElements.length > 0) {
                        focusableElements[0].focus();
                    }
                } catch (e) {
                    console.debug('Error focusing modal element:', e);
                }
            });
        } catch (e) {
            console.debug('Error in requestAnimationFrame:', e);
        }

        // Add tab trap listener
        try {
            const tabTrapHandler = (event) => handleModalTabTrap(event, modal);
            modal.addEventListener('keydown', tabTrapHandler);
            modal._tabTrapHandler = tabTrapHandler;
        } catch (e) {
            console.debug('Error adding tab trap:', e);
        }
    } catch (e) {
        console.error('Error in openModal:', e);
    }
}

/**
 * Close a modal with proper cleanup and focus restoration
 * @param {HTMLElement} modal - The modal element to close
 * @param {Object} elements - Elements object containing modal references
 */
export function closeModal(modal, elements) {
    // CRITICAL: Remove active class FIRST, before anything else
    // This must happen to prevent overlay from staying dark
    if (!modal) {
        console.warn('closeModal: modal is null/undefined');
        return;
    }

    console.log('closeModal: Removing active class from modal', modal.id || modal.className);

    // Remove active class immediately - this is the MOST important operation
    modal.classList.remove('active');

    console.log('closeModal: Active class removed, modal.classList:', Array.from(modal.classList));

    // Save focus element before resetting state
    const elementToFocus = modalAccessibility.previouslyFocusedElement;

    // Reset modal accessibility state immediately
    if (modalAccessibility.activeModal === modal) {
        modalAccessibility.previouslyFocusedElement = null;
        modalAccessibility.activeModal = null;
    }

    // Everything below is non-critical cleanup - wrap in try-catch
    try {
        // Remove tab trap listener
        if (modal._tabTrapHandler) {
            modal.removeEventListener('keydown', modal._tabTrapHandler);
            delete modal._tabTrapHandler;
        }
    } catch (e) {
        // Non-critical error, just log it
    }

    // Try to restore focus - this is nice-to-have, not required
    try {
        if (elementToFocus &&
            typeof elementToFocus.focus === 'function' &&
            document.body.contains(elementToFocus)) {

            setTimeout(() => {
                try {
                    if (document.body.contains(elementToFocus)) {
                        elementToFocus.focus();
                    }
                } catch (e) {
                    // Focus failed, not a problem
                }
            }, 0);
        }
    } catch (e) {
        // Focus restoration failed, not critical
    }

    // Clear chart hover states when closing chart modals
    try {
        if (elements && modal === elements.modals?.reports?.root) {
            reportsState.line.hoverIndex = null;
            reportsState.pie.hoverIndex = null;
            hideReportsTooltip(elements);
            renderReportsLineChart(elements);
            renderReportsPieChart(elements);
        } else if (elements && modal === elements.modals?.historicalReports?.root) {
            historicalReportsState.line.hoverIndex = null;
            historicalReportsState.pie.hoverIndex = null;
            hideHistoricalReportsTooltip(elements);
        }
    } catch (e) {
        // Chart cleanup failed, not critical
    }
}

/**
 * Close all modals
 * @param {Array} allModals - Array of all modal elements
 * @param {Object} elements - Elements object for chart cleanup
 */
export function closeAllModals(allModals, elements) {
    if (!allModals || !Array.isArray(allModals)) {
        return;
    }

    // CRITICAL: Remove active class from ALL modals FIRST
    allModals.forEach(modal => {
        if (modal && modal.classList) {
            modal.classList.remove('active');
        }
    });

    // Reset modal accessibility state immediately
    modalAccessibility.previouslyFocusedElement = null;
    modalAccessibility.activeModal = null;

    // Everything below is non-critical cleanup
    try {
        // Remove tab trap listeners
        allModals.forEach(modal => {
            try {
                if (modal && modal._tabTrapHandler) {
                    modal.removeEventListener('keydown', modal._tabTrapHandler);
                    delete modal._tabTrapHandler;
                }
            } catch (e) {
                // Listener removal failed, not critical
            }
        });
    } catch (e) {
        // Non-critical error
    }

    // Clear chart states
    try {
        if (elements) {
            reportsState.line.hoverIndex = null;
            reportsState.pie.hoverIndex = null;
            hideReportsTooltip(elements);
            historicalReportsState.line.hoverIndex = null;
            historicalReportsState.pie.hoverIndex = null;
            hideHistoricalReportsTooltip(elements);
        }
    } catch (e) {
        // Chart cleanup failed, not critical
    }
}
