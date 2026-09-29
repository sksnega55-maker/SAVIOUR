import type { ExpenseRecord } from '../types/sales';
import type { SalesRecord } from '../types/pharmacy';
import { parseSanitizedNumber, parseDateComponents } from '../utils/formatters';

export interface FullGoogleSheetsConfig {
  sheetUrl?: string;
  sheetId?: string;
  webAppUrl?: string;
  apiKey?: string;
  isLive: boolean;
  tabNames?: {
    sales: string;
    expenses: string;
    cash: string;
    bank: string;
  };
  lastSyncedAt?: string | null;
  mode?: 'csv' | 'api' | 'sample';
}

const CONFIG_KEY = 'saviour_gss_full_config_v2';

export class GoogleSheetsService {
  public static getFullConfig(): FullGoogleSheetsConfig {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load Google Sheets config from localStorage', e);
    }

    return {
      sheetUrl: '',
      sheetId: '',
      webAppUrl: '',
      apiKey: '',
      isLive: false,
      tabNames: {
        sales: 'Sales',
        expenses: 'Expenses',
        cash: 'Cash',
        bank: 'Bank'
      },
      lastSyncedAt: null,
      mode: 'sample'
    };
  }

  public static getConfig(): FullGoogleSheetsConfig {
    return this.getFullConfig();
  }

  public static saveFullConfig(config: Partial<FullGoogleSheetsConfig>): FullGoogleSheetsConfig {
    const current = this.getFullConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save Google Sheets config', e);
    }
    return updated;
  }

  public static saveConfig(config: Partial<FullGoogleSheetsConfig>): FullGoogleSheetsConfig {
    return this.saveFullConfig(config);
  }

  public static getCsvUrlFromSheetUrl(sheetUrlOrId: string, sheetName: string = 'Sales'): string | null {
    if (!sheetUrlOrId) return null;
    if (sheetUrlOrId.includes('pub?output=csv') || sheetUrlOrId.includes('/export?format=csv')) {
      return sheetUrlOrId;
    }

    const sheetIdMatch = sheetUrlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = sheetIdMatch ? sheetIdMatch[1] : (sheetUrlOrId.length === 44 ? sheetUrlOrId : null);

    if (!sheetId) return null;
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }

  public static async fetchPublicSheetCsv(csvUrl: string): Promise<string> {
    const res = await fetch(csvUrl);
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: Failed to retrieve sheet.`);
    }
    return await res.text();
  }

  public static parseCsvToRows(csvText: string): string[][] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    return lines.map(line => {
      const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      return match.map(v => v.trim().replace(/^"(.*)"$/, '$1'));
    });
  }

  public static mapRowsToSalesRecords(rows: string[][]): SalesRecord[] {
    if (rows.length < 2) return [];

    let hIdx = 0;
    for (let r = 0; r < Math.min(rows.length, 5); r++) {
      const lineStr = rows[r].join(' ').toLowerCase();
      if (lineStr.includes('date') || lineStr.includes('net sales') || lineStr.includes('cash')) {
        hIdx = r;
        break;
      }
    }

    const headers = rows[hIdx].map(h => h.trim().toLowerCase());

    const dateIdx = headers.findIndex(h => h === 'date' || h.includes('date'));
    const compIdx = headers.findIndex(h => h.includes('computer sales') || h.includes('computer'));
    const manIdx = headers.findIndex(h => h.includes('manual sales') || h.includes('manual'));
    const diff1Idx = headers.findIndex(h => h.includes('difference 1') || h.includes('diff 1') || h.includes('diff1'));
    const returnIdx = headers.findIndex(h => h === 'sales return' || h.includes('sales return') || h.includes('return'));
    const netIdx = headers.findIndex(h => h === 'net sales' || h.includes('net sales') || h.includes('total sales'));
    const cashIdx = headers.findIndex(h => h === 'cash' || h.includes('cash'));
    const upiIdx = headers.findIndex(h => h === 'upi' || h.includes('upi'));
    const cardIdx = headers.findIndex(h => h === 'card' || h.includes('card'));
    const chargesIdx = headers.findIndex(h => h === 'charges' || h.includes('charges') || h.includes('expense'));
    const bankCreditIdx = headers.findIndex(h => h === 'bank credit' || h.includes('bank credit') || h.includes('bank'));
    const diff2Idx = headers.findIndex(h => h.includes('difference 2') || h.includes('diff 2') || h.includes('diff2'));
    const remarksIdx = headers.findIndex(h => h.includes('remark') || h.includes('note'));

    const records: SalesRecord[] = [];

    for (let i = hIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const rawDateStr = dateIdx !== -1 ? row[dateIdx] : '';
      if (!rawDateStr || rawDateStr.toLowerCase().includes('total')) continue;

      const dateComp = parseDateComponents(rawDateStr);
      const dateStr = dateComp
        ? `${dateComp.year}-${String(dateComp.month).padStart(2, '0')}-${String(dateComp.day).padStart(2, '0')}`
        : rawDateStr.trim();

      const computerSales = compIdx !== -1 ? parseSanitizedNumber(row[compIdx]) : 0;
      const manualSales = manIdx !== -1 ? parseSanitizedNumber(row[manIdx]) : 0;
      const difference1 = diff1Idx !== -1 ? parseSanitizedNumber(row[diff1Idx]) : Math.abs(computerSales - manualSales);
      const salesReturn = returnIdx !== -1 ? parseSanitizedNumber(row[returnIdx]) : 0;
      const cash = cashIdx !== -1 ? parseSanitizedNumber(row[cashIdx]) : 0;
      const upi = upiIdx !== -1 ? parseSanitizedNumber(row[upiIdx]) : 0;
      const card = cardIdx !== -1 ? parseSanitizedNumber(row[cardIdx]) : 0;
      const charges = chargesIdx !== -1 ? parseSanitizedNumber(row[chargesIdx]) : 0;
      const bankCredit = bankCreditIdx !== -1 ? parseSanitizedNumber(row[bankCreditIdx]) : 0;
      const difference2 = diff2Idx !== -1 ? parseSanitizedNumber(row[diff2Idx]) : 0;

      let netSales = netIdx !== -1 ? parseSanitizedNumber(row[netIdx]) : 0;
      if (netSales === 0 && (computerSales > 0 || manualSales > 0)) {
        netSales = computerSales + manualSales - salesReturn;
      }
      if (netSales === 0 && (cash > 0 || upi > 0 || card > 0)) {
        netSales = cash + upi + card;
      }

      const remarks = remarksIdx !== -1 ? row[remarksIdx] || '' : '';

      if (dateStr || netSales > 0 || cash > 0 || upi > 0 || bankCredit > 0) {
        records.push({
          slNo: records.length + 1,
          date: dateStr,
          computerSales,
          manualSales,
          difference1,
          salesReturn,
          netSales,
          cash,
          upi,
          card,
          charges,
          bankCredit,
          difference2,
          remarks
        });
      }
    }

    return records;
  }

  public static mapRowsToExpenseRecords(rows: string[][]): ExpenseRecord[] {
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase());
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const catIdx = headers.findIndex(h => h.includes('category') || h.includes('particular'));
    const amtIdx = headers.findIndex(h => h.includes('amount') || h.includes('spend') || h.includes('outward'));
    const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('mode') || h.includes('payment'));

    const records: ExpenseRecord[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const dateStr = dateIdx !== -1 ? row[dateIdx] : new Date().toISOString().split('T')[0];
      const category = (catIdx !== -1 ? row[catIdx] : 'Miscellaneous') as any;
      const amount = amtIdx !== -1 ? parseFloat(row[amtIdx]?.replace(/[^0-9.]/g, '')) || 0 : 0;
      const paymentType = (typeIdx !== -1 && row[typeIdx]?.toLowerCase().includes('cash')) ? 'Cash' : 'Online';

      if (amount > 0) {
        records.push({
          id: `gs_exp_${i}_${Date.now()}`,
          date: dateStr,
          category: category || 'Miscellaneous',
          description: `Google Sheet entry - ${category}`,
          cashExpense: paymentType === 'Cash' ? amount : 0,
          upiExpense: paymentType === 'Online' ? amount : 0,
          totalExpense: amount,
          paymentType,
          amount,
        });
      }
    }

    return records;
  }
}
