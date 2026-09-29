/**
  Indian Rupee Currency & Metric Formatters
 */

export const formatINR = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

export const formatCompactINR = (value: number): string => {
  const abs = Math.abs(value || 0);
  if (abs >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `₹${(value / 100000).toFixed(2)} Lakh`;
  }
  if (abs >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`;
  }
  return formatINR(value);
};

export const formatPercent = (value: number, includeSign = false): string => {
  const formatted = `${Math.abs(value).toFixed(1)}%`;
  if (includeSign) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatted;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value || 0);
};
