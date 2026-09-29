import * as XLSX from 'xlsx';
import type { SalesRecord, ExpenseRecord, ExpenseCategory } from '../types/sales';

export interface ImportResult {
  sales: SalesRecord[];
  expenses: ExpenseRecord[];
  totalSalesCount: number;
  totalExpenseCount: number;
  warnings: string[];
  errors: string[];
  filename: string;
}

export class ExcelImportService {
  public static async parseFile(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const warnings: string[] = [];
          const errors: string[] = [];
          let sales: SalesRecord[] = [];
          let expenses: ExpenseRecord[] = [];

          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

            if (jsonData.length === 0) return;

            const nameLower = sheetName.toLowerCase();
            const firstRow = jsonData[0];
            const firstRowKeys = Object.keys(firstRow).map(k => k.toLowerCase());

            const isExpenseSheet = nameLower.includes('expense') || nameLower.includes('spend') || 
              firstRowKeys.some(k => k.includes('category') || k.includes('expense'));

            if (isExpenseSheet) {
              const parsedExp = this.parseExpenseRows(jsonData, sheetName);
              expenses.push(...parsedExp);
            } else {
              const parsedSales = this.parseSalesRows(jsonData, sheetName);
              sales.push(...parsedSales);
            }
          });

          if (sales.length === 0 && expenses.length === 0) {
            errors.push('No valid sales or expense rows could be parsed from the file.');
          }

          resolve({
            sales,
            expenses,
            totalSalesCount: sales.length,
            totalExpenseCount: expenses.length,
            warnings,
            errors,
            filename: file.name,
          });
        } catch (err: any) {
          reject(new Error(`Failed to read file: ${err.message || err}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file from disk.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private static parseSalesRows(rows: Record<string, any>[], sheetName: string): SalesRecord[] {
    return rows.map((row, idx) => {
      const getVal = (...keys: string[]): any => {
        for (const k of keys) {
          const foundKey = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim() || rk.toLowerCase().includes(k.toLowerCase()));
          if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
        }
        return '';
      };

      const numVal = (...keys: string[]): number => {
        const val = getVal(...keys);
        if (typeof val === 'number') return val;
        const cleaned = String(val).replace(/[^0-9.-]+/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      let rawDate = getVal('date', 'tx date', 'sales date', 'day');
      let dateStr = new Date().toISOString().split('T')[0];

      if (typeof rawDate === 'number') {
        const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        if (!isNaN(jsDate.getTime())) {
          dateStr = jsDate.toISOString().split('T')[0];
        }
      } else if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      }

      const cash = numVal('cash', 'cash sales');
      const upi = numVal('upi', 'upi sales', 'gpay', 'paytm', 'phonepe');
      const card = numVal('card', 'card sales', 'credit', 'debit');
      const salesReturn = numVal('sales return', 'return', 'returns');
      const costOfGoods = numVal('cost', 'cost of goods', 'cogs');

      let totalSales = numVal('total sales', 'total', 'net sales');
      if (totalSales === 0) {
        totalSales = Math.max(0, cash + upi + card - salesReturn);
      }

      return {
        id: `excel_sales_${sheetName}_${idx}_${Date.now()}`,
        date: dateStr,
        invoiceNo: String(getVal('invoice', 'inv', 'bill no') || `INV-${1000 + idx}`),
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
        costOfGoods: costOfGoods > 0 ? costOfGoods : undefined,
        notes: String(getVal('notes', 'remark', 'comments')),
      };
    });
  }

  private static parseExpenseRows(rows: Record<string, any>[], sheetName: string): ExpenseRecord[] {
    return rows.map((row, idx) => {
      const getVal = (...keys: string[]): any => {
        for (const k of keys) {
          const foundKey = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim() || rk.toLowerCase().includes(k.toLowerCase()));
          if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
        }
        return '';
      };

      const numVal = (...keys: string[]): number => {
        const val = getVal(...keys);
        if (typeof val === 'number') return val;
        const cleaned = String(val).replace(/[^0-9.-]+/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      };

      let rawDate = getVal('date', 'expense date');
      let dateStr = new Date().toISOString().split('T')[0];

      if (typeof rawDate === 'number') {
        const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        if (!isNaN(jsDate.getTime())) {
          dateStr = jsDate.toISOString().split('T')[0];
        }
      } else if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        }
      }

      const rawCat = String(getVal('category', 'expense category', 'type')).toLowerCase();
      let category: ExpenseCategory = 'Other';

      if (rawCat.includes('rent')) category = 'Rent';
      else if (rawCat.includes('electric') || rawCat.includes('power')) category = 'Utilities';
      else if (rawCat.includes('salary') || rawCat.includes('wage')) category = 'Salaries';
      else if (rawCat.includes('invent') || rawCat.includes('stock') || rawCat.includes('supplier')) category = 'Supplier Payments';
      else if (rawCat.includes('maint') || rawCat.includes('repair')) category = 'Miscellaneous';

      const cashExpense = numVal('cash expense', 'cash spend', 'cash');
      const upiExpense = numVal('upi expense', 'upi spend', 'upi');
      let totalExpense = numVal('total expense', 'total spend', 'amount');
      if (totalExpense === 0) {
        totalExpense = cashExpense + upiExpense;
      }
      const paymentType = cashExpense > upiExpense ? 'Cash' : 'Online';

      return {
        id: `excel_exp_${sheetName}_${idx}_${Date.now()}`,
        date: dateStr,
        category,
        description: String(getVal('description', 'desc', 'particulars')) || category,
        cashExpense,
        upiExpense,
        totalExpense,
        paymentType,
        amount: totalExpense,
      };
    });
  }

  public static exportToExcel(data: any[], filename: string = 'Saviour_Pharmacy_Report.xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, filename);
  }
}
