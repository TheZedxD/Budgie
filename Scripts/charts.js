/**
 * Chart Rendering Module
 * Handles canvas-based chart rendering for reports and historical data
 */

import { formatCurrency, escapeHtml } from './utils.js';
import { DEFAULT_CATEGORY_LABEL } from './state.js';
import {
    getProjectedMonthlyBalances,
    getMonthlyExpenseBreakdown,
    getDateRangeDailySummaries,
    getDateRangeExpenseBreakdown
} from './transactions.js';

// Chart state for reports modal
export const reportsState = {
    interactivityInitialized: false,
    line: {
        points: [],
        hoverIndex: null,
        data: []
    },
    pie: {
        slices: [],
        hoverIndex: null,
        centerX: 0,
        centerY: 0,
        radius: 0,
        total: 0
    }
};

// Chart state for historical reports modal
export const historicalReportsState = {
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

/**
 * Resize canvas with devicePixelRatio scaling for crisp rendering
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 */
export function resizeCanvas(canvas) {
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    // Set display size (CSS pixels)
    const displayWidth = rect.width;
    const displayHeight = rect.height || displayWidth * 0.6; // Default aspect ratio

    // Set actual size in memory (scaled for device pixel ratio)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Scale the context to match device pixel ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.scale(dpr, dpr);
    }

    // Set CSS size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
}

/**
 * Show tooltip for reports modal
 * @param {string} content - HTML content for tooltip
 * @param {number} clientX - Client X position
 * @param {number} clientY - Client Y position
 * @param {Object} elements - Elements object containing modal references
 */
export function showReportsTooltip(content, clientX, clientY, elements) {
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

/**
 * Hide tooltip for reports modal
 * @param {Object} elements - Elements object containing modal references
 */
export function hideReportsTooltip(elements) {
    const tooltip = elements.modals.reports.tooltip;
    if (!tooltip) {
        return;
    }
    tooltip.classList.remove('visible');
}

/**
 * Show tooltip for historical reports modal
 * @param {string} content - HTML content for tooltip
 * @param {number} clientX - Client X position
 * @param {number} clientY - Client Y position
 * @param {Object} elements - Elements object containing modal references
 */
export function showHistoricalReportsTooltip(content, clientX, clientY, elements) {
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

/**
 * Hide tooltip for historical reports modal
 * @param {Object} elements - Elements object containing modal references
 */
export function hideHistoricalReportsTooltip(elements) {
    const modal = elements.modals.historicalReports;
    if (!modal?.tooltip) {
        return;
    }
    modal.tooltip.classList.remove('visible');
}

/**
 * Render the reports line chart (monthly balance projections)
 * @param {Object} elements - Elements object containing modal references
 */
export function renderReportsLineChart(elements) {
    const modal = elements.modals.reports;
    if (!modal?.lineCanvas) {
        return;
    }

    // Resize canvas for responsive rendering
    resizeCanvas(modal.lineCanvas);

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
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i += 1) {
        const value = chartMin + ((chartMax - chartMin) / yTickCount) * i;
        const y = scaleY(value);
        ctx.fillText(formatCurrency(value), margin.left - 12, y);
    }

    modal.lineCanvas.style.cursor = reportsState.line.hoverIndex !== null ? 'pointer' : 'default';
}

/**
 * Render the reports pie chart (monthly expense breakdown)
 * @param {Object} elements - Elements object containing modal references
 */
export function renderReportsPieChart(elements) {
    const modal = elements.modals.reports;
    if (!modal?.pieCanvas) {
        return;
    }

    // Resize canvas for responsive rendering
    resizeCanvas(modal.pieCanvas);

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

/**
 * Handle hover events on reports line chart
 * @param {MouseEvent|null} event - Mouse event or null to clear hover
 * @param {Object} elements - Elements object containing modal references
 */
export function handleReportsLineHover(event, elements) {
    const canvas = elements.modals.reports.lineCanvas;
    if (!canvas) {
        return;
    }

    if (!event) {
        if (reportsState.line.hoverIndex !== null) {
            reportsState.line.hoverIndex = null;
            renderReportsLineChart(elements);
        }
        canvas.style.cursor = 'default';
        hideReportsTooltip(elements);
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
            renderReportsLineChart(elements);
        }
        const point = reportsState.line.points[closestIndex];
        showReportsTooltip(`
            <strong>${escapeHtml(point.label)}</strong>
            <span>${escapeHtml(formatCurrency(point.value))}</span>
        `, event.clientX, event.clientY, elements);
        canvas.style.cursor = 'pointer';
    } else {
        if (reportsState.line.hoverIndex !== null) {
            reportsState.line.hoverIndex = null;
            renderReportsLineChart(elements);
        }
        canvas.style.cursor = 'default';
        hideReportsTooltip(elements);
    }
}

/**
 * Handle hover events on reports pie chart
 * @param {MouseEvent|null} event - Mouse event or null to clear hover
 * @param {Object} elements - Elements object containing modal references
 */
export function handleReportsPieHover(event, elements) {
    const canvas = elements.modals.reports.pieCanvas;
    if (!canvas) {
        return;
    }

    if (!event) {
        if (reportsState.pie.hoverIndex !== null) {
            reportsState.pie.hoverIndex = null;
            renderReportsPieChart(elements);
        }
        canvas.style.cursor = 'default';
        hideReportsTooltip(elements);
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
            renderReportsPieChart(elements);
        }
        canvas.style.cursor = 'default';
        hideReportsTooltip(elements);
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
            renderReportsPieChart(elements);
        }
        const slice = reportsState.pie.slices[hoveredIndex];
        const percentageLabel = (slice.percentage * 100).toFixed(1).replace(/\.0$/, '');
        showReportsTooltip(`
            <strong>${escapeHtml(slice.label)}</strong>
            <span>${escapeHtml(formatCurrency(slice.value))} • ${escapeHtml(percentageLabel)}%</span>
        `, event.clientX, event.clientY, elements);
        canvas.style.cursor = 'pointer';
    } else {
        if (reportsState.pie.hoverIndex !== null) {
            reportsState.pie.hoverIndex = null;
            renderReportsPieChart(elements);
        }
        canvas.style.cursor = 'default';
        hideReportsTooltip(elements);
    }
}

/**
 * Initialize interactivity for reports charts
 * @param {Object} elements - Elements object containing modal references
 */
export function initializeReportsInteractivity(elements) {
    if (reportsState.interactivityInitialized) {
        return;
    }
    const modal = elements.modals.reports;
    if (!modal?.lineCanvas || !modal?.pieCanvas) {
        return;
    }

    modal.lineCanvas.addEventListener('mousemove', (event) => handleReportsLineHover(event, elements));
    modal.lineCanvas.addEventListener('mouseleave', () => handleReportsLineHover(null, elements));
    modal.pieCanvas.addEventListener('mousemove', (event) => handleReportsPieHover(event, elements));
    modal.pieCanvas.addEventListener('mouseleave', () => handleReportsPieHover(null, elements));
    reportsState.interactivityInitialized = true;
}

/**
 * Render the historical line chart (daily balance over date range)
 * @param {Object} elements - Elements object containing modal references
 */
export function renderHistoricalLineChart(elements) {
    const modal = elements.modals.historicalReports;
    const canvas = modal?.lineCanvas;
    if (!modal || !canvas) {
        return;
    }

    // Resize canvas for responsive rendering
    resizeCanvas(canvas);

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
        hideHistoricalReportsTooltip(elements);
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
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.strokeStyle = isDarkTheme ? '#0f172a' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (historicalReportsState.line.hoverIndex === index) {
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.strokeStyle = '#f97316';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    canvas.style.cursor = historicalReportsState.line.hoverIndex !== null ? 'pointer' : 'default';
}

/**
 * Render the historical pie chart (expense breakdown over date range)
 * @param {Object} elements - Elements object containing modal references
 */
export function renderHistoricalPieChart(elements) {
    const modal = elements.modals.historicalReports;
    const canvas = modal?.pieCanvas;
    if (!modal || !canvas) {
        return;
    }

    // Resize canvas for responsive rendering
    resizeCanvas(canvas);

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
        hideHistoricalReportsTooltip(elements);
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

/**
 * Initialize interactivity for historical reports charts
 * @param {Object} elements - Elements object containing modal references
 */
export function initializeHistoricalReportsInteractivity(elements) {
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
                    renderHistoricalLineChart(elements);
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
                showHistoricalReportsTooltip(content, event.clientX, event.clientY, elements);
                lineCanvas.style.cursor = 'pointer';
            } else {
                if (historicalReportsState.line.hoverIndex !== null) {
                    historicalReportsState.line.hoverIndex = null;
                    renderHistoricalLineChart(elements);
                }
                hideHistoricalReportsTooltip(elements);
                lineCanvas.style.cursor = 'default';
            }
        });
        lineCanvas.addEventListener('mouseleave', () => {
            if (historicalReportsState.line.hoverIndex !== null) {
                historicalReportsState.line.hoverIndex = null;
                renderHistoricalLineChart(elements);
            }
            hideHistoricalReportsTooltip(elements);
        });
    }
    if (pieCanvas) {
        pieCanvas.addEventListener('mousemove', event => {
            if (!historicalReportsState.pie.slices.length) {
                return;
            }
            const rect = pieCanvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * (pieCanvas.width / rect.width);
            const y = (event.clientY - rect.top) * (pieCanvas.height / rect.height);
            const slice = historicalReportsState.pie.slices[0];
            if (!slice) {
                return;
            }
            const centerX = slice.centerX;
            const centerY = slice.centerY;
            const radius = slice.radius;
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.hypot(dx, dy);
            if (distance > radius || distance < radius * 0.15) {
                if (historicalReportsState.pie.hoverIndex !== null) {
                    historicalReportsState.pie.hoverIndex = null;
                    renderHistoricalPieChart(elements);
                }
                hideHistoricalReportsTooltip(elements);
                pieCanvas.style.cursor = 'default';
                return;
            }
            const angle = Math.atan2(dy, dx);
            let normalizedAngle = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
            let hoveredIndex = -1;
            historicalReportsState.pie.slices.forEach((s, index) => {
                if (normalizedAngle >= s.normalizedStart && normalizedAngle < s.normalizedEnd) {
                    hoveredIndex = index;
                }
            });
            if (hoveredIndex === -1 && historicalReportsState.pie.slices.length) {
                hoveredIndex = historicalReportsState.pie.slices.length - 1;
            }
            if (hoveredIndex !== -1) {
                if (historicalReportsState.pie.hoverIndex !== hoveredIndex) {
                    historicalReportsState.pie.hoverIndex = hoveredIndex;
                    renderHistoricalPieChart(elements);
                }
                const hoveredSlice = historicalReportsState.pie.slices[hoveredIndex];
                const item = hoveredSlice.item;
                const percentage = ((item.value / historicalReportsState.pie.total) * 100).toFixed(1).replace(/\.0$/, '');
                const content = `
                    <strong>${escapeHtml(item.label)}</strong>
                    <span>${escapeHtml(formatCurrency(item.value))} • ${escapeHtml(percentage)}%</span>
                `;
                showHistoricalReportsTooltip(content, event.clientX, event.clientY, elements);
                pieCanvas.style.cursor = 'pointer';
            } else {
                if (historicalReportsState.pie.hoverIndex !== null) {
                    historicalReportsState.pie.hoverIndex = null;
                    renderHistoricalPieChart(elements);
                }
                hideHistoricalReportsTooltip(elements);
                pieCanvas.style.cursor = 'default';
            }
        });
        pieCanvas.addEventListener('mouseleave', () => {
            if (historicalReportsState.pie.hoverIndex !== null) {
                historicalReportsState.pie.hoverIndex = null;
                renderHistoricalPieChart(elements);
            }
            hideHistoricalReportsTooltip(elements);
        });
    }
    historicalReportsState.interactivityInitialized = true;
}
