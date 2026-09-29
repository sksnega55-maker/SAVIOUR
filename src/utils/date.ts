/**
  Date Range & Helper Utilities
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateShort = (dateString: string): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const getDateNDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const getMonthName = (monthNum: number): string => {
  return MONTH_NAMES[monthNum] || MONTH_NAMES[monthNum - 1] || `Month ${monthNum}`;
};

export const getMonthShortName = (monthNum: number): string => {
  return MONTH_NAMES_SHORT[monthNum] || MONTH_NAMES_SHORT[monthNum - 1] || `M${monthNum}`;
};

export type DateFilterPreset = 'all' | '7days' | '15days' | 'currentMonth' | 'lastMonth' | 'custom';

export const filterRecordsByPreset = <T extends { date: string }>(
  records: T[],
  preset: DateFilterPreset,
  startDate?: string,
  endDate?: string
): T[] => {
  if (preset === 'all' || !records.length) return records;

  const today = new Date();

  return records.filter((r) => {
    const rDate = new Date(r.date);
    if (isNaN(rDate.getTime())) return true;

    if (preset === '7days') {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 7);
      return rDate >= past7 && rDate <= today;
    }

    if (preset === '15days') {
      const past15 = new Date(today);
      past15.setDate(today.getDate() - 15);
      return rDate >= past15 && rDate <= today;
    }

    if (preset === 'currentMonth') {
      return rDate.getMonth() === today.getMonth() && rDate.getFullYear() === today.getFullYear();
    }

    if (preset === 'lastMonth') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return rDate.getMonth() === lastMonth.getMonth() && rDate.getFullYear() === lastMonth.getFullYear();
    }

    if (preset === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return rDate >= start && rDate <= end;
    }

    return true;
  });
};
