import type { SalesRecord, CashRecord, BankRecord, PartnerRecord } from '../types/pharmacy';

export const INITIAL_SALES_DATA: SalesRecord[] = [
  // March 2026
  {
    slNo: 1,
    date: '1-3-2026',
    computerSales: 55000,
    manualSales: 2000,
    difference1: 0,
    salesReturn: 1000,
    netSales: 56000,
    cash: 20000,
    upi: 24000,
    card: 12000,
    charges: 250,
    bankCredit: 35750,
    difference2: 0,
    remarks: 'March Opening Statement Entry'
  },
  {
    slNo: 2,
    date: '15-3-2026',
    computerSales: 62000,
    manualSales: 3000,
    difference1: 0,
    salesReturn: 1500,
    netSales: 63500,
    cash: 22000,
    upi: 28000,
    card: 13500,
    charges: 300,
    bankCredit: 41200,
    difference2: 0,
    remarks: 'Mid-month settlement'
  },
  // September 2026
  {
    slNo: 3,
    date: '2026-09-01',
    computerSales: 48500,
    manualSales: 2500,
    difference1: 0,
    salesReturn: 1200,
    netSales: 49800,
    cash: 18000,
    upi: 22000,
    card: 10000,
    charges: 200,
    bankCredit: 31800,
    difference2: 0,
    remarks: 'Daily settlement completed cleanly'
  },
  {
    slNo: 2,
    date: '2026-09-02',
    computerSales: 52300,
    manualSales: 1800,
    difference1: 0,
    salesReturn: 800,
    netSales: 53300,
    cash: 20500,
    upi: 21800,
    card: 11000,
    charges: 220,
    bankCredit: 32580,
    difference2: 0,
    remarks: 'Regular daily billing'
  },
  {
    slNo: 3,
    date: '2026-09-03',
    computerSales: 61000,
    manualSales: 3400,
    difference1: 500, // intentional difference alert!
    salesReturn: 1500,
    netSales: 62400,
    cash: 24000,
    upi: 26000,
    card: 12400,
    charges: 248,
    bankCredit: 38152,
    difference2: 0,
    remarks: 'Manual billing entry discrepancy under audit'
  },
  {
    slNo: 4,
    date: '2026-09-04',
    computerSales: 44200,
    manualSales: 1200,
    difference1: 0,
    salesReturn: 600,
    netSales: 44800,
    cash: 16000,
    upi: 19800,
    card: 9000,
    charges: 180,
    bankCredit: 28620,
    difference2: 0,
    remarks: 'Sufficient OTC stock sales'
  },
  {
    slNo: 5,
    date: '2026-09-05',
    computerSales: 58900,
    manualSales: 2100,
    difference1: 0,
    salesReturn: 1100,
    netSales: 59900,
    cash: 21000,
    upi: 25900,
    card: 13000,
    charges: 260,
    bankCredit: 38640,
    difference2: 0,
    remarks: 'Weekend batch sale'
  },

  // August 2026
  {
    slNo: 6,
    date: '2026-08-15',
    computerSales: 65400,
    manualSales: 3100,
    difference1: 0,
    salesReturn: 2000,
    netSales: 66500,
    cash: 25000,
    upi: 28500,
    card: 13000,
    charges: 260,
    bankCredit: 41240,
    difference2: 0,
    remarks: 'Independence Day Special Operations'
  },
  {
    slNo: 7,
    date: '2026-08-28',
    computerSales: 49000,
    manualSales: 1500,
    difference1: 0,
    salesReturn: 500,
    netSales: 50000,
    cash: 19000,
    upi: 21000,
    card: 10000,
    charges: 200,
    bankCredit: 30800,
    difference2: 0,
    remarks: 'End of month stock audit clean'
  },

  // July 2026
  {
    slNo: 8,
    date: '2026-07-20',
    computerSales: 51200,
    manualSales: 1900,
    difference1: 0,
    salesReturn: 1100,
    netSales: 52000,
    cash: 20000,
    upi: 22000,
    card: 10000,
    charges: 200,
    bankCredit: 31800,
    difference2: 0,
    remarks: 'Monsoon season supply sale'
  }
];

export const INITIAL_CASH_DATA: CashRecord[] = [
  // September 2026
  {
    slNo: 1,
    date: '2026-09-01',
    particulars: 'Counter Cash Collection (Daily Net)',
    inward: 18000,
    outward: 0,
    closingBalance: 43000,
    remarks: 'Opening Balance: ₹25,000'
  },
  {
    slNo: 2,
    date: '2026-09-01',
    particulars: 'Local Freight & Transport Charges',
    inward: 0,
    outward: 1200,
    closingBalance: 41800,
    remarks: 'Voucher #C-101'
  },
  {
    slNo: 3,
    date: '2026-09-02',
    particulars: 'Counter Cash Collection',
    inward: 20500,
    outward: 0,
    closingBalance: 62300,
    remarks: 'Shift 1 & Shift 2 cash'
  },
  {
    slNo: 4,
    date: '2026-09-02',
    particulars: 'Pharmacy Staff Refreshment & Tea',
    inward: 0,
    outward: 450,
    closingBalance: 61850,
    remarks: 'Monthly petty cash bill'
  },
  {
    slNo: 5,
    date: '2026-09-03',
    particulars: 'Counter Cash Collection',
    inward: 24000,
    outward: 0,
    closingBalance: 85850,
    remarks: 'Peak sales cash receipt'
  },
  {
    slNo: 6,
    date: '2026-09-03',
    particulars: 'Deposit Cash into Bank (HDFC)',
    inward: 0,
    outward: 50000,
    closingBalance: 35850,
    remarks: 'Bank pay-in slip #9921'
  },
  {
    slNo: 7,
    date: '2026-09-04',
    particulars: 'Counter Cash Collection',
    inward: 16000,
    outward: 0,
    closingBalance: 51850,
    remarks: 'Daily settlement'
  },
  {
    slNo: 8,
    date: '2026-09-05',
    particulars: 'Counter Cash Collection',
    inward: 21000,
    outward: 0,
    closingBalance: 72850,
    remarks: 'Daily collection'
  },
  {
    slNo: 9,
    date: '2026-09-05',
    particulars: 'Emergency Packaging Material Purchase',
    inward: 0,
    outward: 3200,
    closingBalance: 69650,
    remarks: 'Thermal roll & prescription covers'
  }
];

export const INITIAL_BANK_DATA: BankRecord[] = [
  // September 2026
  {
    slNo: 1,
    date: '2026-09-01',
    particulars: 'UPI & POS Settlement (Pine Labs)',
    invNo: 'PL-9921',
    invDate: '2026-09-01',
    inward: 31800,
    outward: 0,
    closingBalance: 485000,
    remarks: 'Direct credit to HDFC A/C'
  },
  {
    slNo: 2,
    date: '2026-09-02',
    particulars: 'UPI & POS Settlement',
    invNo: 'PL-9922',
    invDate: '2026-09-02',
    inward: 32580,
    outward: 0,
    closingBalance: 517580,
    remarks: 'Direct credit to HDFC A/C'
  },
  {
    slNo: 3,
    date: '2026-09-02',
    particulars: 'Sun Pharma Stock Purchase Payment',
    invNo: 'INV-SP-4412',
    invDate: '2026-08-25',
    inward: 0,
    outward: 125000,
    closingBalance: 392580,
    remarks: 'NEFT Txn #N244192'
  },
  {
    slNo: 4,
    date: '2026-09-03',
    particulars: 'Cash Deposit from Counter',
    invNo: 'DEP-8831',
    invDate: '2026-09-03',
    inward: 50000,
    outward: 0,
    closingBalance: 442580,
    remarks: 'Cash deposit slip #9921'
  },
  {
    slNo: 5,
    date: '2026-09-03',
    particulars: 'UPI & POS Settlement',
    invNo: 'PL-9923',
    invDate: '2026-09-03',
    inward: 38152,
    outward: 0,
    closingBalance: 480732,
    remarks: 'Direct credit to HDFC A/C'
  },
  {
    slNo: 6,
    date: '2026-09-04',
    particulars: 'Cipla Medicine Stock Invoice Payment',
    invNo: 'INV-CIP-9011',
    invDate: '2026-08-30',
    inward: 0,
    outward: 88000,
    closingBalance: 392732,
    remarks: 'RTGS Txn #R882191'
  },
  {
    slNo: 7,
    date: '2026-09-05',
    particulars: 'UPI & POS Settlement',
    invNo: 'PL-9924',
    invDate: '2026-09-05',
    inward: 38640,
    outward: 0,
    closingBalance: 431372,
    remarks: 'Direct credit to HDFC A/C'
  }
];

export const INITIAL_RAMAKRISHNAN_DATA: PartnerRecord[] = [
  {
    slNo: 1,
    date: '2026-09-01',
    particulars: 'Partner Capital Investment Contribution',
    inward: 200000,
    outward: 0,
    closingBalance: 500000,
    mopMor: 'Bank Transfer',
    remarks: 'Opening ledger balance ₹3,00,000'
  },
  {
    slNo: 2,
    date: '2026-09-03',
    particulars: 'Partner Monthly Profit Withdrawal',
    inward: 0,
    outward: 45000,
    closingBalance: 455000,
    mopMor: 'UPI',
    remarks: 'Approved partner drawing'
  },
  {
    slNo: 3,
    date: '2026-08-15',
    particulars: 'Direct Payment to Equipment Vendor (AC Unit)',
    inward: 35000,
    outward: 0,
    closingBalance: 490000,
    mopMor: 'Bank Transfer',
    remarks: 'Reimbursement credit'
  }
];

export const INITIAL_SARAN_DATA: PartnerRecord[] = [
  {
    slNo: 1,
    date: '2026-09-01',
    particulars: 'Partner Capital Investment Contribution',
    inward: 200000,
    outward: 0,
    closingBalance: 450000,
    mopMor: 'Bank Transfer',
    remarks: 'Opening ledger balance ₹2,50,000'
  },
  {
    slNo: 2,
    date: '2026-09-04',
    particulars: 'Partner Monthly Profit Withdrawal',
    inward: 0,
    outward: 40000,
    closingBalance: 410000,
    mopMor: 'UPI',
    remarks: 'Approved partner drawing'
  },
  {
    slNo: 3,
    date: '2026-08-20',
    particulars: 'Software License Annual Renewal Payment',
    inward: 18000,
    outward: 0,
    closingBalance: 428000,
    mopMor: 'UPI',
    remarks: 'Pharmacy ERP Software payment'
  }
];
