/**
 * Formats a number into Indian Rupees (INR ₹) standard format.
 * E.g., 125000 -> ₹1,25,000.00
 */
export function formatINR(amount: number, showDecimals = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }

  const isNegative = amount < 0;
  const absoluteVal = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(absoluteVal);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex] || '';
}

/**
 * Number & Currency Sanitization
 * - Strip spaces, commas, and currency symbols
 * - Handles negative values in parentheses e.g., " (14.00) " -> -14.00
 * - Parses "-" or empty string as 0
 */
export function parseSanitizedNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  let s = String(val).trim();
  if (!s || s === '-' || s === '–' || s === '—') return 0;

  // Check for negative wrapped in parentheses e.g., "(14.00)" or "( 14.00 )"
  const isParenthesesNegative = /^\s*\(\s*(.*?)\s*\)\s*$/.test(s);
  if (isParenthesesNegative) {
    s = s.replace(/^\s*\(\s*(.*?)\s*\)\s*$/, '$1');
  }

  // Remove commas, spaces, currency symbols
  s = s.replace(/,/g, '').replace(/\s+/g, '').replace(/[^0-9.-]/g, '');
  if (!s || s === '-' || s === '.') return 0;

  const num = parseFloat(s);
  if (isNaN(num)) return 0;
  return isParenthesesNegative ? -Math.abs(num) : num;
}

/**
 * Date Parsing & Filter Matching
 * Parses date strings in formats like:
 * - "D-M-YYYY" or "DD-MM-YYYY" (e.g., "1-3-2026", "15-03-2026")
 * - "D/M/YYYY" or "DD/MM/YYYY"
 * - "YYYY-MM-DD" or "YYYY/MM/DD" (ISO format)
 */
export function parseDateComponents(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // ISO format YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(trimmed)) {
    const parts = trimmed.split(/[-T/ ]/);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return { day: d, month: m, year: y };
    }
  }

  // D-M-YYYY or DD-MM-YYYY or D/M/YYYY
  const parts = trimmed.split(/[-/]/);
  if (parts.length >= 3) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const p3 = parseInt(parts[2], 10);

    if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3)) {
      // If p3 is 4 digits (e.g. 2026), p1=day, p2=month, p3=year
      if (p3 >= 1000) {
        return { day: p1, month: p2, year: p3 };
      }
      // If p1 is 4 digits (e.g. 2026), p1=year, p2=month, p3=day
      if (p1 >= 1000) {
        return { day: p3, month: p2, year: p1 };
      }
    }
  }

  // Fallback to JS Date parse
  const dt = new Date(trimmed);
  if (!isNaN(dt.getTime())) {
    return { day: dt.getDate(), month: dt.getMonth() + 1, year: dt.getFullYear() };
  }

  return null;
}

/**
 * Matches a date string against a target year and monthIndex (0-based: 0=Jan, 2=Mar)
 */
export function matchesMonthYear(dateStr: string, targetYear: number, targetMonthIndex: number): boolean {
  const parsed = parseDateComponents(dateStr);
  if (!parsed) return false;
  return parsed.year === targetYear && parsed.month === (targetMonthIndex + 1);
}
