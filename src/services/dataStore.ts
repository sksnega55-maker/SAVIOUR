import type { SalesRecord, ExpenseRecord } from '../types/sales';
import { GoogleSheetsService } from './googleSheets';
import { SheetService } from './sheetService';

const STORAGE_KEY_SALES = 'saviour_pharmacy_sales_v2';
const STORAGE_KEY_EXPENSES = 'saviour_pharmacy_expenses_v2';
const STORAGE_KEY_LAST_REFRESH = 'saviour_pharmacy_last_refresh_v2';

const generateInitialSampleData = (): { sales: SalesRecord[]; expenses: ExpenseRecord[] } => {
  const sales: SalesRecord[] = [];
  const expenses: ExpenseRecord[] = [];

  const years = [2024, 2025, 2026];

  years.forEach(year => {
    const endMonth = year === 2026 ? 8 : 11;

    for (let m = 0; m <= endMonth; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const growthFactor = year === 2024 ? 0.85 : year === 2025 ? 1.05 : 1.25;

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = String(d).padStart(2, '0');
        const monthStr = String(m + 1).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        const baseRevenue = (18000 + Math.floor(Math.sin(d + m) * 7000) + ((d * 37) % 5000)) * growthFactor;

        const upi = Math.round(baseRevenue * 0.55 + ((d * 17) % 1500));
        const cash = Math.round(baseRevenue * 0.30 + ((d * 23) % 1200));
        const card = Math.round(baseRevenue * 0.15 + ((d * 11) % 800));

        const salesReturn = (d % 6 === 0) ? Math.round(500 + (d * 90) % 1200) : 0;
        const totalSales = cash + upi + card - salesReturn;
        const costOfGoods = Math.round(totalSales * 0.68);

        sales.push({
          id: `sample_sales_${year}_${m}_${d}`,
          date: dateStr,
          invoiceNo: `INV-${year}${(m + 1).toString().padStart(2, '0')}${dayStr}`,
          cash,
          upi,
          card,
          salesReturn,
          totalSales,
          cashSales: cash,
          upiSales: upi,
          cardSales: card,
          returns: salesReturn,
          netSales: Math.max(0, totalSales - salesReturn),
          costOfGoods,
        });
      }

      // Rent
      expenses.push({
        id: `exp_rent_${year}_${m}`,
        date: `${year}-${String(m + 1).padStart(2, '0')}-01`,
        category: 'Rent',
        description: 'Monthly Pharmacy Premises Rent',
        cashExpense: 0,
        upiExpense: Math.round(35000 * growthFactor),
        totalExpense: Math.round(35000 * growthFactor),
        paymentType: 'Online',
        amount: Math.round(35000 * growthFactor),
      });

      // Salary
      expenses.push({
        id: `exp_salary_${year}_${m}`,
        date: `${year}-${String(m + 1).padStart(2, '0')}-05`,
        category: 'Salaries',
        description: 'Pharmacist & Support Staff Salaries',
        cashExpense: 10000,
        upiExpense: Math.round(48000 * growthFactor),
        totalExpense: Math.round(58000 * growthFactor),
        paymentType: 'Online',
        amount: Math.round(58000 * growthFactor),
      });

      // Inventory Purchase
      expenses.push({
        id: `exp_inv1_${year}_${m}`,
        date: `${year}-${String(m + 1).padStart(2, '0')}-10`,
        category: 'Supplier Payments',
        description: 'Stock Replenishment - Major Distro',
        cashExpense: 15000,
        upiExpense: Math.round(95000 * growthFactor),
        totalExpense: Math.round(110000 * growthFactor),
        paymentType: 'Online',
        amount: Math.round(110000 * growthFactor),
      });

      // Electricity / Utilities
      expenses.push({
        id: `exp_elec_${year}_${m}`,
        date: `${year}-${String(m + 1).padStart(2, '0')}-15`,
        category: 'Utilities',
        description: 'Electricity & Cold Storage AC Power',
        cashExpense: 0,
        upiExpense: Math.round(8500 * growthFactor),
        totalExpense: Math.round(8500 * growthFactor),
        paymentType: 'Online',
        amount: Math.round(8500 * growthFactor),
      });

      // Maintenance
      if (m % 2 === 0) {
        expenses.push({
          id: `exp_maint_${year}_${m}`,
          date: `${year}-${String(m + 1).padStart(2, '0')}-18`,
          category: 'Miscellaneous',
          description: 'Software POS & Air Conditioner Servicing',
          cashExpense: 2000,
          upiExpense: 3500,
          totalExpense: 5500,
          paymentType: 'Online',
          amount: 5500,
        });
      }
    }
  });

  return { sales, expenses };
};

type DataChangeListener = () => void;

export class DataStore {
  private static salesRecords: SalesRecord[] = [];
  private static expenseRecords: ExpenseRecord[] = [];
  private static listeners: DataChangeListener[] = [];
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    try {
      const storedSales = localStorage.getItem(STORAGE_KEY_SALES);
      const storedExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);

      if (storedSales && storedExpenses) {
        this.salesRecords = JSON.parse(storedSales);
        this.expenseRecords = JSON.parse(storedExpenses);
      } else {
        const initial = generateInitialSampleData();
        this.salesRecords = initial.sales;
        this.expenseRecords = initial.expenses;
        this.persist();
      }
    } catch (e) {
      console.warn('Failed to load data from localStorage, using initial sample data', e);
      const initial = generateInitialSampleData();
      this.salesRecords = initial.sales;
      this.expenseRecords = initial.expenses;
    }

    this.isInitialized = true;
  }

  public static subscribe(listener: DataChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify(): void {
    this.listeners.forEach(l => l());
  }

  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(this.salesRecords));
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(this.expenseRecords));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }

  public static getSales(year?: number, month?: number): SalesRecord[] {
    this.initialize();
    return this.salesRecords.filter(r => {
      if (!r.date) return false;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      if (year !== undefined && d.getFullYear() !== year) return false;
      if (month !== undefined && d.getMonth() !== month) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public static getExpenses(year?: number, month?: number): ExpenseRecord[] {
    this.initialize();
    return this.expenseRecords.filter(r => {
      if (!r.date) return false;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      if (year !== undefined && d.getFullYear() !== year) return false;
      if (month !== undefined && d.getMonth() !== month) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public static addSalesRecord(record: Omit<SalesRecord, 'id'>): void {
    this.initialize();
    const cash = record.cash || record.cashSales || 0;
    const upi = record.upi || record.upiSales || 0;
    const card = record.card || record.cardSales || 0;
    const salesReturn = record.salesReturn || record.returns || 0;
    const totalSales = Math.max(0, cash + upi + card - salesReturn);

    const newRecord: SalesRecord = {
      ...record,
      id: `sales_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      cash,
      upi,
      card,
      salesReturn,
      totalSales,
      cashSales: cash,
      upiSales: upi,
      cardSales: card,
      returns: salesReturn,
      netSales: totalSales,
    };
    this.salesRecords.unshift(newRecord);
    this.persist();
    this.notify();
  }

  public static addExpenseRecord(record: Omit<ExpenseRecord, 'id'>): void {
    this.initialize();
    const cashExpense = record.cashExpense || (record.paymentType === 'Cash' ? record.amount : 0);
    const upiExpense = record.upiExpense || (record.paymentType === 'Online' ? record.amount : 0);
    const totalExpense = record.totalExpense || record.amount || (cashExpense + upiExpense);

    const newRecord: ExpenseRecord = {
      ...record,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      cashExpense,
      upiExpense,
      totalExpense,
      amount: totalExpense,
    };
    this.expenseRecords.unshift(newRecord);
    this.persist();
    this.notify();
  }

  public static importData(sales: SalesRecord[], expenses: ExpenseRecord[], replace: boolean = false): void {
    this.initialize();
    if (replace) {
      this.salesRecords = sales;
      this.expenseRecords = expenses;
    } else {
      const existingSalesKeys = new Set(this.salesRecords.map(s => `${s.date}_${s.invoiceNo || s.id}`));
      const newSales = sales.filter(s => !existingSalesKeys.has(`${s.date}_${s.invoiceNo || s.id}`));
      this.salesRecords.unshift(...newSales);

      const existingExpKeys = new Set(this.expenseRecords.map(e => `${e.date}_${e.category}_${e.totalExpense}`));
      const newExp = expenses.filter(e => !existingExpKeys.has(`${e.date}_${e.category}_${e.totalExpense}`));
      this.expenseRecords.unshift(...newExp);
    }

    this.setLastSyncedTimestamp();
    this.persist();
    this.notify();
  }

  public static getLastSyncedTimestamp(): string | null {
    return localStorage.getItem(STORAGE_KEY_LAST_REFRESH) || null;
  }

  public static setLastSyncedTimestamp(): void {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem(STORAGE_KEY_LAST_REFRESH, `Last updated: ${timeStr}`);
  }

  public static async refreshFromGoogleSheets(): Promise<boolean> {
    const config = GoogleSheetsService.getConfig();
    if (!config.sheetUrl && !config.sheetId) {
      throw new Error('No Google Sheet URL or ID configured.');
    }

    const csvUrl = GoogleSheetsService.getCsvUrlFromSheetUrl(config.sheetUrl || config.sheetId || '');
    if (!csvUrl) {
      throw new Error('Invalid Google Sheet URL format.');
    }

    const csvText = await GoogleSheetsService.fetchPublicSheetCsv(csvUrl);
    const rows = GoogleSheetsService.parseCsvToRows(csvText);

    if (rows.length === 0) {
      throw new Error('Google Sheet returned no data rows.');
    }

    const pharmacySales = GoogleSheetsService.mapRowsToSalesRecords(rows);
    const legacySales: SalesRecord[] = pharmacySales.map((s, idx) => ({
      id: `gs_sales_${idx}_${Date.now()}`,
      date: s.date,
      invoiceNo: `INV-GS-${idx + 1}`,
      cash: s.cash,
      upi: s.upi,
      card: s.card,
      salesReturn: s.salesReturn,
      totalSales: s.netSales,
      cashSales: s.cash,
      upiSales: s.upi,
      cardSales: s.card,
      returns: s.salesReturn,
      netSales: s.netSales
    }));
    const expenses = GoogleSheetsService.mapRowsToExpenseRecords(rows);

    this.importData(legacySales, expenses, true);
    SheetService.importTabFromCSV('sales', csvText);
    GoogleSheetsService.saveConfig({ isLive: true, lastSyncedAt: new Date().toISOString(), mode: 'csv' });
    return true;
  }

  public static resetToSampleData(): void {
    const initial = generateInitialSampleData();
    this.salesRecords = initial.sales;
    this.expenseRecords = initial.expenses;
    this.setLastSyncedTimestamp();
    this.persist();
    this.notify();
  }
}
