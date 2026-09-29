import type { 
  SalesRecord, 
  ExpenseRecord, 
  DashboardSummary, 
  PaymentBreakdown, 
  ExpenseBreakdown, 
  ProfitSummary, 
  MonthlySummary, 
  YearlySummary 
} from '../types/sales';
import { MONTH_NAMES } from '../utils/date';

export const calculateTotalSales = (salesRecords: SalesRecord[]): number => {
  return salesRecords.reduce((sum, r) => sum + (r.totalSales || (r.cash + r.upi + r.card)), 0);
};

export const calculatePaymentBreakdown = (salesRecords: SalesRecord[]): PaymentBreakdown => {
  const cash = salesRecords.reduce((s, r) => s + (r.cash || r.cashSales || 0), 0);
  const upi = salesRecords.reduce((s, r) => s + (r.upi || r.upiSales || 0), 0);
  const card = salesRecords.reduce((s, r) => s + (r.card || r.cardSales || 0), 0);
  const total = cash + upi + card;

  return {
    cash,
    upi,
    card,
    total,
    cashPct: total ? Math.round((cash / total) * 1000) / 10 : 0,
    upiPct: total ? Math.round((upi / total) * 1000) / 10 : 0,
    cardPct: total ? Math.round((card / total) * 1000) / 10 : 0,
  };
};

export const calculateExpenseBreakdown = (expenseRecords: ExpenseRecord[]): ExpenseBreakdown => {
  const cashSupplier = expenseRecords.filter(e => e.paymentType === 'Cash' && e.category === 'Supplier Payments').reduce((s, e) => s + e.amount, 0);
  const cashDonations = expenseRecords.filter(e => e.paymentType === 'Cash' && e.category === 'Donations').reduce((s, e) => s + e.amount, 0);
  const cashCardCharges = expenseRecords.filter(e => e.paymentType === 'Cash' && e.category === 'Card Charges').reduce((s, e) => s + e.amount, 0);
  const cashMisc = expenseRecords.filter(e => e.paymentType === 'Cash' && (e.category === 'Miscellaneous' || e.category === 'Utilities' || e.category === 'Rent')).reduce((s, e) => s + e.amount, 0);
  const cashSavings = expenseRecords.filter(e => e.paymentType === 'Cash' && e.category === 'Savings Transfer').reduce((s, e) => s + e.amount, 0);
  const totalCashExpenses = cashSupplier + cashDonations + cashCardCharges + cashMisc + cashSavings;

  const onlineSupplier = expenseRecords.filter(e => e.paymentType === 'Online' && e.category === 'Supplier Payments').reduce((s, e) => s + e.amount, 0);
  const onlineDonations = expenseRecords.filter(e => e.paymentType === 'Online' && e.category === 'Donations').reduce((s, e) => s + e.amount, 0);
  const onlineCardCharges = expenseRecords.filter(e => e.paymentType === 'Online' && e.category === 'Card Charges').reduce((s, e) => s + e.amount, 0);
  const onlineMisc = expenseRecords.filter(e => e.paymentType === 'Online' && (e.category === 'Miscellaneous' || e.category === 'Utilities' || e.category === 'Rent')).reduce((s, e) => s + e.amount, 0);
  const onlineSavings = expenseRecords.filter(e => e.paymentType === 'Online' && e.category === 'Savings Transfer').reduce((s, e) => s + e.amount, 0);
  const totalOnlineExpenses = onlineSupplier + onlineDonations + onlineCardCharges + onlineMisc + onlineSavings;

  const totalSpends = totalCashExpenses + totalOnlineExpenses;

  const categoriesMap: Record<string, { amount: number; color: string }> = {
    'Supplier Payments': { amount: cashSupplier + onlineSupplier, color: '#3b82f6' },
    'Donations': { amount: cashDonations + onlineDonations, color: '#f43f5e' },
    'Card Charges': { amount: cashCardCharges + onlineCardCharges, color: '#f59e0b' },
    'Miscellaneous': { amount: cashMisc + onlineMisc, color: '#a855f7' },
    'Savings Transfer': { amount: cashSavings + onlineSavings, color: '#10b981' },
  };

  const categoryTotals = Object.entries(categoriesMap).map(([category, val]) => ({
    category,
    amount: val.amount,
    color: val.color
  }));

  let highestCategory = { category: 'Supplier Payments', amount: 0 };
  categoryTotals.forEach(c => {
    if (c.amount > highestCategory.amount) {
      highestCategory = { category: c.category, amount: c.amount };
    }
  });

  return {
    cashPaid: {
      supplier: cashSupplier,
      donations: cashDonations,
      cardCharges: cashCardCharges,
      misc: cashMisc,
      savingsTransfer: cashSavings,
      total: totalCashExpenses
    },
    onlinePaid: {
      supplier: onlineSupplier,
      donations: onlineDonations,
      cardCharges: onlineCardCharges,
      misc: onlineMisc,
      savingsTransfer: onlineSavings,
      total: totalOnlineExpenses
    },
    totalSpends,
    categoryTotals,
    highestCategory
  };
};

export const calculateProfitMetrics = (salesRecords: SalesRecord[], expenseRecords: ExpenseRecord[]): ProfitSummary => {
  const grossSales = calculateTotalSales(salesRecords);
  const returns = salesRecords.reduce((s, r) => s + (r.salesReturn || r.returns || 0), 0);
  const netSales = Math.max(0, grossSales - returns);

  const supplierExpenses = expenseRecords.filter(e => e.category === 'Supplier Payments').reduce((s, e) => s + e.amount, 0);
  const cogs = supplierExpenses || Math.round(netSales * 0.65);

  const grossProfit = Math.max(0, netSales - cogs);
  const profitMarginPct = netSales ? Math.round((grossProfit / netSales) * 1000) / 10 : 0;

  const operationalExpenses = expenseRecords.filter(e => e.category !== 'Supplier Payments' && e.category !== 'Savings Transfer').reduce((s, e) => s + e.amount, 0);
  const netProfit = Math.max(0, grossProfit - operationalExpenses);
  const netProfitMarginPct = netSales ? Math.round((netProfit / netSales) * 1000) / 10 : 0;

  return {
    grossSales,
    returns,
    netSales,
    cogs,
    grossProfit,
    profitMarginPct,
    operationalExpenses,
    netProfit,
    netProfitMarginPct
  };
};

export const calculateDashboardSummary = (
  salesRecords: SalesRecord[],
  expenseRecords: ExpenseRecord[],
  savingsRatePct = 15
): DashboardSummary => {
  const paymentEarnings = calculatePaymentBreakdown(salesRecords);
  const expenseBreakdown = calculateExpenseBreakdown(expenseRecords);
  const profitSummary = calculateProfitMetrics(salesRecords, expenseRecords);

  const totalEarned = paymentEarnings.total;
  const totalSpend = expenseBreakdown.totalSpends;
  
  const cashBalance = paymentEarnings.cash - expenseBreakdown.cashPaid.total;
  const upiBalance = (paymentEarnings.upi + paymentEarnings.card) - expenseBreakdown.onlinePaid.total;
  const totalBalance = cashBalance + upiBalance;

  const totalSavings = Math.round(totalEarned * (savingsRatePct / 100));

  return {
    totalEarned,
    totalSpend,
    totalBalance,
    totalSavings,
    savingsRatePct,
    paymentEarnings,
    paymentExpenses: {
      cashExpenses: expenseBreakdown.cashPaid.total,
      onlineExpenses: expenseBreakdown.onlinePaid.total,
      total: totalSpend
    },
    balancesByPayment: {
      cashBalance,
      upiBalance,
      totalBalance
    },
    expenseBreakdown,
    profitSummary
  };
};

export const calculateMonthlyReports = (
  salesRecords: SalesRecord[],
  _expenseRecords: ExpenseRecord[] = [],
  year: number = 2026
): { summaries: MonthlySummary[]; totalYearSales: number; monthlyAverage: number; bestMonth: MonthlySummary | null } => {
  const yearRecords = salesRecords.filter(r => {
    const d = new Date(r.date);
    return !isNaN(d.getTime()) && d.getFullYear() === year;
  });

  const yearTotalSales = calculateTotalSales(yearRecords) || 1;

  const monthSummaries: MonthlySummary[] = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const mRecords = yearRecords.filter(r => new Date(r.date).getMonth() + 1 === monthNum);

    const sales = calculateTotalSales(mRecords);
    const returns = mRecords.reduce((s, r) => s + (r.salesReturn || r.returns || 0), 0);
    const netSales = Math.max(0, sales - returns);
    const expenses = Math.round(sales * 0.65);
    const profit = Math.max(0, netSales - expenses);
    const percentageOfYear = Math.round((sales / yearTotalSales) * 1000) / 10;

    return {
      year,
      month: MONTH_NAMES[i],
      monthNum,
      sales,
      returns,
      netSales,
      expenses,
      profit,
      percentageOfYear
    };
  });

  let bestMonthIndex = 0;
  let maxSales = 0;
  monthSummaries.forEach((m, idx) => {
    if (m.sales > maxSales) {
      maxSales = m.sales;
      bestMonthIndex = idx;
    }
  });

  let bestMonth: MonthlySummary | null = null;
  if (maxSales > 0) {
    monthSummaries[bestMonthIndex].isBestMonth = true;
    bestMonth = monthSummaries[bestMonthIndex];
  }

  const activeMonths = monthSummaries.filter(m => m.sales > 0).length || 1;
  const monthlyAverage = Math.round(yearTotalSales / activeMonths);

  return { summaries: monthSummaries, totalYearSales: yearTotalSales, monthlyAverage, bestMonth };
};

export const calculateYearlyReports = (
  salesRecords: SalesRecord[],
  _expenseRecords: ExpenseRecord[] = []
): { summaries: YearlySummary[]; allTimeRevenue: number; currentYearRevenue: number; latestYoYGrowth: number | null } => {
  const yearsMap: Record<number, SalesRecord[]> = {};

  salesRecords.forEach(r => {
    const d = new Date(r.date);
    if (!isNaN(d.getTime())) {
      const yr = d.getFullYear();
      if (!yearsMap[yr]) yearsMap[yr] = [];
      yearsMap[yr].push(r);
    }
  });

  const sortedYears = Object.keys(yearsMap).map(Number).sort((a, b) => a - b);
  if (sortedYears.length === 0) {
    sortedYears.push(2026);
    yearsMap[2026] = salesRecords;
  }

  let allTimeRevenue = 0;

  const summaries: YearlySummary[] = sortedYears.map((yr, idx) => {
    const records = yearsMap[yr] || [];
    const sales = calculateTotalSales(records);
    const returns = records.reduce((s, r) => s + (r.salesReturn || r.returns || 0), 0);
    const netSales = Math.max(0, sales - returns);
    const expenses = Math.round(sales * 0.62);
    const profit = Math.max(0, netSales - expenses);

    allTimeRevenue += sales;

    let growth: number | null = null;
    if (idx > 0) {
      const prevSales = calculateTotalSales(yearsMap[sortedYears[idx - 1]] || []);
      if (prevSales > 0) {
        growth = Math.round(((sales - prevSales) / prevSales) * 1000) / 10;
      }
    }

    return {
      year: yr,
      sales,
      returns,
      netSales,
      expenses,
      profit,
      growth,
      yoyGrowthPct: growth !== null ? growth : 0
    };
  });

  const currentYear = new Date().getFullYear();
  const currentYearObj = summaries.find(s => s.year === currentYear) || summaries[summaries.length - 1];
  const currentYearRevenue = currentYearObj ? currentYearObj.sales : 0;
  const latestYoYGrowth = summaries.length > 1 ? summaries[summaries.length - 1].growth : null;

  return { summaries, allTimeRevenue, currentYearRevenue, latestYoYGrowth };
};
