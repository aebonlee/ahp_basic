/**
 * Format a number as percentage string.
 */
export function formatPercent(value, decimals = 3) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with fixed decimal places.
 */
export function formatNumber(value, decimals = 5) {
  return value.toFixed(decimals);
}

/**
 * Format a CR value for display.
 */
export function formatCR(cr, n) {
  if (n <= 2) return '-';
  return cr.toFixed(5);
}

/**
 * Format date for Korean locale.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text, maxLen = 30) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}
