import type { 
  SalesRecord, 
  CashRecord, 
  BankRecord, 
  PartnerRecord,
  SalesSheetSummary,
  CashSheetSummary,
  BankSheetSummary,
  PartnerSheetSummary,
  GoogleSheetsConfig 
} from '../types/pharmacy';
import { 
  INITIAL_SALES_DATA, 
  INITIAL_CASH_DATA, 
  INITIAL_BANK_DATA, 
  INITIAL_RAMAKRISHNAN_DATA, 
  INITIAL_SARAN_DATA 
} from '../data/mockData';
import { matchesMonthYear } from '../utils/formatters';
import { GoogleSheetsService } from './googleSheets';

const CONFIG_STORAGE_KEY = 'saviour_gss_config';
const SALES_STORAGE_KEY = 'saviour_sales_data';
const CASH_STORAGE_KEY = 'saviour_cash_data';
const BANK_STORAGE_KEY = 'saviour_bank_data';
const RAMAKRISHNAN_STORAGE_KEY = 'saviour_ramakrishnan_data';
const SARAN_STORAGE_KEY = 'saviour_saran_data';

// Helper to load or fallback to initial mock data
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage`, e);
  }
}

export class SheetService {
  private static salesData: SalesRecord[] = loadFromStorage(SALES_STORAGE_KEY, INITIAL_SALES_DATA);
  private static cashData: CashRecord[] = loadFromStorage(CASH_STORAGE_KEY, INITIAL_CASH_DATA);
  private static bankData: BankRecord[] = loadFromStorage(BANK_STORAGE_KEY, INITIAL_BANK_DATA);
  private static ramakrishnanData: PartnerRecord[] = loadFromStorage(RAMAKRISHNAN_STORAGE_KEY, INITIAL_RAMAKRISHNAN_DATA);
  private static saranData: PartnerRecord[] = loadFromStorage(SARAN_STORAGE_KEY, INITIAL_SARAN_DATA);
  
  private static config: GoogleSheetsConfig = loadFromStorage(CONFIG_STORAGE_KEY, {
    webAppUrl: '',
    spreadsheetId: '',
    isLive: false,
    lastSyncedAt: new Date().toISOString()
  });

  // Config getters & setters
  public static getConfig(): GoogleSheetsConfig {
    return { ...this.config };
  }

  public static updateConfig(newConfig: Partial<GoogleSheetsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    saveToStorage(CONFIG_STORAGE_KEY, this.config);
  }

  // Filter helper for Year and Month
  private static matchesMonthYear(dateStr: string, year: number, monthIndex: number): boolean {
    return matchesMonthYear(dateStr, year, monthIndex);
  }

  // --- SALES METHODS ---
  public static getSales(year: number, monthIndex: number): SalesRecord[] {
    return this.salesData
      .filter(item => this.matchesMonthYear(item.date, year, monthIndex))
      .sort((a, b) => {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return db - da;
      });
  }

  public static getSalesSummary(year: number, monthIndex: number): SalesSheetSummary {
    const items = this.getSales(year, monthIndex);
    return items.reduce<SalesSheetSummary>(
      (acc, item) => ({
        computerSales: acc.computerSales + item.computerSales,
        manualSales: acc.manualSales + item.manualSales,
        difference1: acc.difference1 + item.difference1,
        salesReturn: acc.salesReturn + item.salesReturn,
        netSales: acc.netSales + item.netSales,
        cash: acc.cash + item.cash,
        upi: acc.upi + item.upi,
        card: acc.card + item.card,
        charges: acc.charges + item.charges,
        bankCredit: acc.bankCredit + item.bankCredit,
        difference2: acc.difference2 + item.difference2,
      }),
      {
        computerSales: 0,
        manualSales: 0,
        difference1: 0,
        salesReturn: 0,
        netSales: 0,
        cash: 0,
        upi: 0,
        card: 0,
        charges: 0,
        bankCredit: 0,
        difference2: 0,
      }
    );
  }

  public static addSalesRecord(record: Omit<SalesRecord, 'slNo' | 'difference1' | 'netSales' | 'difference2'>): SalesRecord {
    const netSales = record.computerSales + record.manualSales - record.salesReturn;
    const difference1 = Math.abs(record.computerSales - record.manualSales);
    const difference2 = Math.abs((record.cash + record.upi + record.card) - netSales);
    
    const newRecord: SalesRecord = {
      ...record,
      slNo: this.salesData.length + 1,
      difference1,
      netSales,
      difference2
    };

    this.salesData.unshift(newRecord);
    saveToStorage(SALES_STORAGE_KEY, this.salesData);
    return newRecord;
  }

  // --- CASH METHODS ---
  public static getCash(year: number, monthIndex: number): CashRecord[] {
    return this.cashData
      .filter(item => this.matchesMonthYear(item.date, year, monthIndex))
      .sort((a, b) => {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return db - da;
      });
  }

  public static getCashSummary(year: number, monthIndex: number): CashSheetSummary {
    const items = this.getCash(year, monthIndex);
    const inward = items.reduce((sum, i) => sum + i.inward, 0);
    const outward = items.reduce((sum, i) => sum + i.outward, 0);
    const latestRecord = items[0];
    const closingBalance = latestRecord ? latestRecord.closingBalance : 0;
    
    return { inward, outward, closingBalance };
  }

  public static addCashRecord(record: Omit<CashRecord, 'slNo' | 'closingBalance'>): CashRecord {
    const previousClosing = this.cashData.length > 0 ? this.cashData[0].closingBalance : 0;
    const closingBalance = previousClosing + record.inward - record.outward;
    
    const newRecord: CashRecord = {
      ...record,
      slNo: this.cashData.length + 1,
      closingBalance
    };

    this.cashData.unshift(newRecord);
    saveToStorage(CASH_STORAGE_KEY, this.cashData);
    return newRecord;
  }

  // --- BANK METHODS ---
  public static getBank(year: number, monthIndex: number): BankRecord[] {
    return this.bankData
      .filter(item => this.matchesMonthYear(item.date, year, monthIndex))
      .sort((a, b) => {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return db - da;
      });
  }

  public static getBankSummary(year: number, monthIndex: number): BankSheetSummary {
    const items = this.getBank(year, monthIndex);
    const inward = items.reduce((sum, i) => sum + i.inward, 0);
    const outward = items.reduce((sum, i) => sum + i.outward, 0);
    const latestRecord = items[0];
    const closingBalance = latestRecord ? latestRecord.closingBalance : 0;
    
    return { inward, outward, closingBalance };
  }

  public static addBankRecord(record: Omit<BankRecord, 'slNo' | 'closingBalance'>): BankRecord {
    const previousClosing = this.bankData.length > 0 ? this.bankData[0].closingBalance : 0;
    const closingBalance = previousClosing + record.inward - record.outward;
    
    const newRecord: BankRecord = {
      ...record,
      slNo: this.bankData.length + 1,
      closingBalance
    };

    this.bankData.unshift(newRecord);
    saveToStorage(BANK_STORAGE_KEY, this.bankData);
    return newRecord;
  }

  // --- PARTNER METHODS ---
  public static getPartner(partner: 'ramakrishnan' | 'saran', year: number, monthIndex: number): PartnerRecord[] {
    const dataset = partner === 'ramakrishnan' ? this.ramakrishnanData : this.saranData;
    return dataset
      .filter(item => this.matchesMonthYear(item.date, year, monthIndex))
      .sort((a, b) => {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return db - da;
      });
  }

  public static getPartnerSummary(partner: 'ramakrishnan' | 'saran', year: number, monthIndex: number): PartnerSheetSummary {
    const items = this.getPartner(partner, year, monthIndex);
    const inward = items.reduce((sum, i) => sum + i.inward, 0);
    const outward = items.reduce((sum, i) => sum + i.outward, 0);
    const latestRecord = items[0];
    const closingBalance = latestRecord ? latestRecord.closingBalance : 0;
    
    return { inward, outward, closingBalance };
  }

  public static addPartnerRecord(partner: 'ramakrishnan' | 'saran', record: Omit<PartnerRecord, 'slNo' | 'closingBalance'>): PartnerRecord {
    const dataset = partner === 'ramakrishnan' ? this.ramakrishnanData : this.saranData;
    const previousClosing = dataset.length > 0 ? dataset[0].closingBalance : 0;
    const closingBalance = previousClosing + record.inward - record.outward;

    const newRecord: PartnerRecord = {
      ...record,
      slNo: dataset.length + 1,
      closingBalance
    };

    if (partner === 'ramakrishnan') {
      this.ramakrishnanData.unshift(newRecord);
      saveToStorage(RAMAKRISHNAN_STORAGE_KEY, this.ramakrishnanData);
    } else {
      this.saranData.unshift(newRecord);
      saveToStorage(SARAN_STORAGE_KEY, this.saranData);
    }

    return newRecord;
  }

  // --- DYNAMIC METRIC CALCULATIONS FOR DASHBOARD ---
  public static getDashboardMetrics(year: number, monthIndex: number) {
    const salesSummary = this.getSalesSummary(year, monthIndex);
    const cashSummary = this.getCashSummary(year, monthIndex);
    const bankSummary = this.getBankSummary(year, monthIndex);

    // 1. TOTAL EARNED = Sum of all NET SALES for the selected month.
    const totalEarned = salesSummary.netSales;

    // 2. TOTAL SPEND = Sum of CHARGES + SALES RETURN for the selected month.
    const totalSpend = salesSummary.charges + salesSummary.salesReturn + cashSummary.outward + bankSummary.outward;

    // 3. BALANCE = (Total Earned) - (Total Spend).
    const totalBalance = totalEarned - totalSpend;

    // 4. SAVINGS = Sum of BANK CREDIT.
    const savings = salesSummary.bankCredit;

    // Earn by Payment Mode:
    // Cash: Sum of CASH
    // UPI: Sum of UPI
    // Card: Sum of CARD
    const earnCash = salesSummary.cash;
    const earnUpi = salesSummary.upi;
    const earnCard = salesSummary.card;

    // Spend by Payment Mode:
    const spendCash = salesSummary.charges + cashSummary.outward;
    const spendBankUpi = salesSummary.salesReturn + bankSummary.outward;

    // Balance by Payment Mode:
    const balanceCash = earnCash - spendCash;
    const balanceBank = (earnUpi + earnCard) - spendBankUpi;

    return {
      totalEarned,
      totalSpend,
      totalBalance,
      savings,
      breakdowns: {
        earn: { cash: earnCash, upi: earnUpi, card: earnCard, total: totalEarned },
        spend: { cash: spendCash, bankUpi: spendBankUpi, total: totalSpend },
        balance: { cash: balanceCash, bank: balanceBank, total: totalBalance }
      }
    };
  }

  // --- SYNC WITH GOOGLE SHEETS WEB APP ENDPOINT ---
  public static async syncGoogleSheet(): Promise<boolean> {
    if (!this.config.webAppUrl) {
      this.updateConfig({ lastSyncedAt: new Date().toISOString() });
      return true;
    }

    try {
      const response = await fetch(this.config.webAppUrl);
      if (!response.ok) throw new Error('Failed to fetch from Google Sheets Endpoint');
      const data = await response.json();
      
      if (data.sales) {
        this.salesData = data.sales;
        saveToStorage(SALES_STORAGE_KEY, this.salesData);
      }
      if (data.cash) {
        this.cashData = data.cash;
        saveToStorage(CASH_STORAGE_KEY, this.cashData);
      }
      if (data.bank) {
        this.bankData = data.bank;
        saveToStorage(BANK_STORAGE_KEY, this.bankData);
      }
      if (data.ramakrishnan) {
        this.ramakrishnanData = data.ramakrishnan;
        saveToStorage(RAMAKRISHNAN_STORAGE_KEY, this.ramakrishnanData);
      }
      if (data.saran) {
        this.saranData = data.saran;
        saveToStorage(SARAN_STORAGE_KEY, this.saranData);
      }

      this.updateConfig({
        isLive: true,
        lastSyncedAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('Google Sheet Sync Error:', err);
      this.updateConfig({ isLive: false });
      return false;
    }
  }

  // --- CSV / EXCEL PARSER IMPORT ---
  public static importTabFromCSV(_tabName: string, csvContent: string): boolean {
    try {
      const rows = GoogleSheetsService.parseCsvToRows(csvContent);
      if (rows.length < 2) return false;

      const salesRecords = GoogleSheetsService.mapRowsToSalesRecords(rows);
      if (salesRecords.length > 0) {
        this.salesData = salesRecords;
        saveToStorage(SALES_STORAGE_KEY, this.salesData);

        // Populate Cash Register entries directly from parsed rows
        const cashEntries: CashRecord[] = [];
        let cashBal = 25000;
        salesRecords.forEach((s) => {
          if (s.cash > 0) {
            cashBal += s.cash;
            cashEntries.push({
              slNo: cashEntries.length + 1,
              date: s.date,
              particulars: 'Counter Cash Receipt',
              inward: s.cash,
              outward: 0,
              closingBalance: cashBal,
              remarks: s.remarks || 'Daily cash collection'
            });
          }
          if (s.charges > 0) {
            cashBal -= s.charges;
            cashEntries.push({
              slNo: cashEntries.length + 1,
              date: s.date,
              particulars: 'Daily Pharmacy Expenses & Charges',
              inward: 0,
              outward: s.charges,
              closingBalance: cashBal,
              remarks: 'Voucher deductions'
            });
          }
        });

        if (cashEntries.length > 0) {
          this.cashData = cashEntries;
          saveToStorage(CASH_STORAGE_KEY, this.cashData);
        }

        // Populate Bank Register entries directly from parsed rows
        const bankEntries: BankRecord[] = [];
        let bankBal = 150000;
        salesRecords.forEach((s, idx) => {
          const bankIn = s.bankCredit > 0 ? s.bankCredit : (s.upi + s.card);
          if (bankIn > 0) {
            bankBal += bankIn;
            bankEntries.push({
              slNo: bankEntries.length + 1,
              date: s.date,
              particulars: 'Daily Bank Settlement / UPI & Card Credit',
              invNo: `SETTLE-${idx + 1}`,
              invDate: s.date,
              inward: bankIn,
              outward: 0,
              closingBalance: bankBal,
              remarks: 'Electronic & bank settlement'
            });
          }
          if (s.salesReturn > 0) {
            bankBal -= s.salesReturn;
            bankEntries.push({
              slNo: bankEntries.length + 1,
              date: s.date,
              particulars: 'Customer Sales Refund / Return Settlement',
              invNo: `REFUND-${idx + 1}`,
              invDate: s.date,
              inward: 0,
              outward: s.salesReturn,
              closingBalance: bankBal,
              remarks: 'Sales refund'
            });
          }
        });

        if (bankEntries.length > 0) {
          this.bankData = bankEntries;
          saveToStorage(BANK_STORAGE_KEY, this.bankData);
        }

        this.updateConfig({ isLive: true, lastSyncedAt: new Date().toISOString() });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import CSV failed', e);
      return false;
    }
  }
}
