import React from 'react';
import { PieChart, CreditCard, Banknote, Smartphone, ShieldAlert, Award } from 'lucide-react';
import type { SalesSheetSummary, BankSheetSummary, CashSheetSummary } from '../types/pharmacy';
import { formatINR, getMonthName } from '../utils/formatters';

interface PaymentAnalysisViewProps {
  salesSummary: SalesSheetSummary;
  bankSummary: BankSheetSummary;
  cashSummary: CashSheetSummary;
  selectedYear: number;
  selectedMonth: number;
}

export const PaymentAnalysisView: React.FC<PaymentAnalysisViewProps> = ({
  salesSummary,
  bankSummary,
  cashSummary,
  selectedYear,
  selectedMonth,
}) => {
  const totalEarned = salesSummary.netSales || 1;
  const cashPct = ((salesSummary.cash / totalEarned) * 100).toFixed(1);
  const upiPct = ((salesSummary.upi / totalEarned) * 100).toFixed(1);
  const cardPct = ((salesSummary.card / totalEarned) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <span>Payment Analysis & Mode Audit</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep dive into revenue streams & transaction charges for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2">
          <span>Net Collection:</span>
          <span className="text-emerald-400 font-extrabold text-sm">{formatINR(salesSummary.netSales)}</span>
        </div>
      </div>

      {/* 3 Main Mode Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cash Card */}
        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Banknote className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Cash Sales</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {cashPct}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-slate-900">{formatINR(salesSummary.cash)}</p>
            <p className="text-xs text-slate-400 mt-1">Direct Counter Cash Received</p>
          </div>
        </div>

        {/* UPI Card */}
        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-500 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm">UPI Payments</span>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {upiPct}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-slate-900">{formatINR(salesSummary.upi)}</p>
            <p className="text-xs text-slate-400 mt-1">GooglePay / PhonePe / QR Code</p>
          </div>
        </div>

        {/* Card Sales Card */}
        <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-blue-600 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Card POS Sales</span>
            </div>
            <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {cardPct}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-slate-900">{formatINR(salesSummary.card)}</p>
            <p className="text-xs text-slate-400 mt-1">Debit & Credit Card Machine</p>
          </div>
        </div>
      </div>

      {/* Audit & Charges Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* POS Charges Audit */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>POS Machine Charges & Bank Credit Audit</span>
          </h4>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Card + UPI Collection:</span>
              <span className="font-bold text-slate-900">{formatINR(salesSummary.card + salesSummary.upi)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Merchant POS Charges Deduction:</span>
              <span className="font-bold text-rose-600">-{formatINR(salesSummary.charges)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Actual Bank Credit Expected:</span>
              <span className="font-bold text-blue-600">{formatINR(salesSummary.bankCredit)}</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-slate-50 px-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">Reconciliation Difference:</span>
              <span className={`font-extrabold ${salesSummary.difference2 !== 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatINR(salesSummary.difference2)}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Financial Insights */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Owner Financial Insights</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Digital Payment Adoption:</strong> Digital modes (UPI + Card) make up{' '}
                  <strong className="text-slate-900 font-bold">
                    {(Number(upiPct) + Number(cardPct)).toFixed(1)}%
                  </strong>{' '}
                  of total store revenue.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Bank Settlement Health:</strong> Direct settlements in HDFC Bank account currently total{' '}
                  <strong className="text-blue-700 font-bold">{formatINR(bankSummary.inward)}</strong>.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Cash Outward Vigilance:</strong> Petty cash expenditures stand at{' '}
                  <strong className="text-rose-600 font-bold">{formatINR(cashSummary.outward)}</strong> for the month.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            💡 Tip: Ensure daily settlement reports from Pine Labs / Paytm soundboxes match Row 1 Bank Credit.
          </div>
        </div>
      </div>
    </div>
  );
};
