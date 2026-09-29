export interface SalesRecord {
  slNo: number;
  date: string; // YYYY-MM-DD
  computerSales: number;
  manualSales: number;
  difference1: number; // Computer - Manual
  salesReturn: number;
  netSales: number;
  cash: number;
  upi: number;
  card: number;
  charges: number;
  bankCredit: number;
  difference2: number; // Net Sales vs Payments/Bank Credit diff
  remarks: string;
}

export interface CashRecord {
  slNo: number;
  date: string;
  particulars: string;
  inward: number;
  outward: number;
  closingBalance: number;
  remarks: string;
}

export interface BankRecord {
  slNo: number;
  date: string;
  particulars: string;
  invNo: string;
  invDate: string;
  inward: number;
  outward: number;
  closingBalance: number;
  remarks: string;
}

export interface PartnerRecord {
  slNo: number;
  date: string;
  particulars: string;
  inward: number;
  outward: number;
  closingBalance: number;
  mopMor: string; // Mode of Payment / Mode of Receipt (e.g., 'UPI', 'Bank Transfer', 'Cash')
  remarks: string;
}

export interface SalesSheetSummary {
  computerSales: number;
  manualSales: number;
  difference1: number;
  salesReturn: number;
  netSales: number;
  cash: number;
  upi: number;
  card: number;
  charges: number;
  bankCredit: number;
  difference2: number;
}

export interface CashSheetSummary {
  inward: number;
  outward: number;
  closingBalance: number;
}

export interface BankSheetSummary {
  inward: number;
  outward: number;
  closingBalance: number;
}

export interface PartnerSheetSummary {
  inward: number;
  outward: number;
  closingBalance: number;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetId: string;
  isLive: boolean;
  lastSyncedAt: string | null;
}

export type ActiveTab = 
  | 'dashboard'
  | 'sales'
  | 'cash'
  | 'bank'
  | 'partners'
  | 'analysis';

export type PartnerTab = 'ramakrishnan' | 'saran';
