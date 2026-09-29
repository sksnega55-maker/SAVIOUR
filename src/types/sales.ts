export type ExpenseCategory = 
  | 'Supplier Payments' 
  | 'Donations' 
  | 'Card Charges' 
  | 'Miscellaneous' 
  | 'Savings Transfer' 
  | 'Utilities' 
  | 'Rent' 
  | 'Salaries' 
  | 'Salary' 
  | 'Inventory' 
  | 'Electricity' 
  | 'Maintenance' 
  | 'Transportation' 
  | 'Other';

export interface SalesRecord {
  id: string;
  date: string; // YYYY-MM-DD
  invoiceNo?: string;
  cash: number;
  upi: number;
  card: number;
  salesReturn: number;
  totalSales: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  returns: number;
  netSales: number;
  costOfGoods?: number;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  description?: string;
  remarks?: string;
  supplierName?: string;
  cashExpense: number;
  upiExpense: number;
  totalExpense: number;
  paymentType: 'Cash' | 'Online';
  amount: number;
}

export interface PaymentBreakdown {
  cash: number;
  upi: number;
  card: number;
  total: number;
  cashPct: number;
  upiPct: number;
  cardPct: number;
}

export interface ExpenseBreakdown {
  cashPaid: {
    supplier: number;
    donations: number;
    cardCharges: number;
    misc: number;
    savingsTransfer: number;
    total: number;
  };
  onlinePaid: {
    supplier: number;
    donations: number;
    cardCharges: number;
    misc: number;
    savingsTransfer: number;
    total: number;
  };
  totalSpends: number;
  categoryTotals: Array<{ category: string; amount: number; color: string }>;
  highestCategory: { category: string; amount: number };
}

export interface ProfitSummary {
  grossSales: number;
  returns: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  profitMarginPct: number;
  operationalExpenses: number;
  netProfit: number;
  netProfitMarginPct: number;
}

export interface DashboardSummary {
  totalEarned: number;
  totalSpend: number;
  totalBalance: number;
  totalSavings: number;
  savingsRatePct: number;
  paymentEarnings: PaymentBreakdown;
  paymentExpenses: {
    cashExpenses: number;
    onlineExpenses: number;
    total: number;
  };
  balancesByPayment: {
    cashBalance: number;
    upiBalance: number;
    totalBalance: number;
  };
  expenseBreakdown: ExpenseBreakdown;
  profitSummary: ProfitSummary;
}

export interface MonthlySummary {
  year: number;
  month: string;
  monthNum: number;
  sales: number;
  returns: number;
  netSales: number;
  expenses: number;
  profit: number;
  percentageOfYear: number;
  isBestMonth?: boolean;
}

export interface YearlySummary {
  year: number;
  sales: number;
  returns: number;
  netSales: number;
  expenses: number;
  profit: number;
  growth: number | null;
  yoyGrowthPct?: number;
}

export interface BusinessInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'highlight';
  title: string;
  description: string;
  metric?: string;
}

export interface DataSourceConfig {
  type: 'sample' | 'googleSheet' | 'excel';
  sheetUrl?: string;
  sheetId?: string;
  lastSyncedAt?: string;
  status: 'connected' | 'syncing' | 'error' | 'local';
  errorMessage?: string;
  recordCount: number;
}

export type NavigationTab = 
  | 'dashboard'
  | 'daily-sales'
  | 'sales'
  | 'cash'
  | 'bank'
  | 'monthly-report'
  | 'yearly-report'
  | 'payment-analysis';

export type QuickDateRange = '7days' | '15days' | 'month' | 'custom';
