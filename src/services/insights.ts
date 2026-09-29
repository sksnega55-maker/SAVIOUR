import type { SalesRecord, ExpenseRecord, BusinessInsight } from '../types/sales';
import { calculatePaymentBreakdown, calculateExpenseBreakdown, calculateYearlyReports, calculateTotalSales } from './calculations';
import { formatINR, formatPercent } from '../utils/currency';

export const generateSmartInsights = (
  salesRecords: SalesRecord[],
  expenseRecords: ExpenseRecord[]
): BusinessInsight[] => {
  const insights: BusinessInsight[] = [];

  if (!salesRecords.length) {
    return [
      {
        id: 'no-data',
        type: 'info',
        title: 'No Sales Data Available',
        description: 'Connect Google Sheets or upload an Excel file to view automated business analytics.'
      }
    ];
  }

  const payments = calculatePaymentBreakdown(salesRecords);
  let topMode = 'Cash';
  let topPct = payments.cashPct;
  if (payments.upiPct > topPct) {
    topMode = 'UPI Digital';
    topPct = payments.upiPct;
  }
  if (payments.cardPct > topPct) {
    topMode = 'Card POS';
    topPct = payments.cardPct;
  }

  insights.push({
    id: 'top-payment',
    type: 'positive',
    title: `${topMode} is Primary Revenue Mode`,
    description: `${topMode} accounts for ${topPct}% of overall sales collections (${formatINR(topMode === 'Cash' ? payments.cash : topMode === 'UPI Digital' ? payments.upi : payments.card)}).`,
    metric: `${topPct}%`
  });

  const { summaries: yearly } = calculateYearlyReports(salesRecords);
  if (yearly.length >= 2) {
    const latest = yearly[yearly.length - 1];
    const growthVal = latest.yoyGrowthPct || 0;
    if (growthVal >= 0) {
      insights.push({
        id: 'yoy-growth',
        type: 'positive',
        title: 'Strong Year-over-Year Growth',
        description: `${latest.year} revenue grew by ${formatPercent(growthVal)} compared to ${latest.year - 1}.`,
        metric: `+${growthVal}%`
      });
    } else {
      insights.push({
        id: 'yoy-growth',
        type: 'warning',
        title: 'Revenue Dip Observed',
        description: `${latest.year} revenue decreased by ${formatPercent(growthVal)} compared to ${latest.year - 1}.`,
        metric: `${growthVal}%`
      });
    }
  }

  const expenses = calculateExpenseBreakdown(expenseRecords);
  if (expenses.highestCategory.amount > 0) {
    insights.push({
      id: 'top-expense',
      type: 'warning',
      title: `Highest Spend: ${expenses.highestCategory.category}`,
      description: `${expenses.highestCategory.category} represents the largest operational expenditure at ${formatINR(expenses.highestCategory.amount)}.`,
      metric: formatINR(expenses.highestCategory.amount)
    });
  }

  const totalSales = calculateTotalSales(salesRecords);
  const totalSpends = expenses.totalSpends;
  const netMargin = totalSales ? Math.round(((totalSales - totalSpends) / totalSales) * 100) : 0;

  if (netMargin > 20) {
    insights.push({
      id: 'cash-health',
      type: 'highlight',
      title: 'Healthy Net Operating Margin',
      description: `Your pharmacy maintains a healthy net operating margin of ${netMargin}%. Liquid cash reserves remain positive.`,
      metric: `${netMargin}% Margin`
    });
  }

  return insights;
};

export const generateBusinessInsights = generateSmartInsights;
