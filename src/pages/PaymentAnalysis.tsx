import React from 'react';
import { 
  PieChart as PieChartIcon, 
  Banknote, 
  QrCode, 
  CreditCard 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import type { SalesRecord } from '../types/sales';
import { calculatePaymentBreakdown } from '../services/calculations';
import { formatINR, formatPercent } from '../utils/currency';
import { MONTH_NAMES_SHORT } from '../utils/date';

interface PaymentAnalysisProps {
  salesRecords: SalesRecord[];
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
}

export const PaymentAnalysis: React.FC<PaymentAnalysisProps> = ({
  salesRecords,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}) => {
  const breakdown = calculatePaymentBreakdown(salesRecords);

  const availableYears = [2024, 2025, 2026];

  const items = [
    { mode: 'Cash', amount: breakdown.cash, pct: breakdown.cashPct, color: '#f59e0b', icon: Banknote },
    { mode: 'UPI', amount: breakdown.upi, pct: breakdown.upiPct, color: '#6366f1', icon: QrCode },
    { mode: 'Card', amount: breakdown.card, pct: breakdown.cardPct, color: '#06b6d4', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <PieChartIcon className="h-5 w-5 text-emerald-600" />
            <span>Payment Method Mix Analysis</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Deep dive into Cash vs Digital wallet vs Card transactions for {MONTH_NAMES_SHORT[selectedMonth]} {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {MONTH_NAMES_SHORT.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PAYMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cash Card */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="h-4 w-4" /> Cash Payments
            </span>
            <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
              {formatPercent(breakdown.cashPct)}
            </span>
          </div>
          <div className="mt-4 text-2xl lg:text-3xl font-black text-slate-900">
            {formatINR(breakdown.cash)}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">
            Over-the-counter physical cash sales
          </div>
        </div>

        {/* UPI Card */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="h-4 w-4" /> UPI & QR Payments
            </span>
            <span className="text-xs font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-200">
              {formatPercent(breakdown.upiPct)}
            </span>
          </div>
          <div className="mt-4 text-2xl lg:text-3xl font-black text-slate-900">
            {formatINR(breakdown.upi)}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">
            GPay, PhonePe, Paytm & BHIM UPI transfers
          </div>
        </div>

        {/* Card Card */}
        <div className="bg-white border border-cyan-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Card Payments
            </span>
            <span className="text-xs font-extrabold bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded-full border border-cyan-200">
              {formatPercent(breakdown.cardPct)}
            </span>
          </div>
          <div className="mt-4 text-2xl lg:text-3xl font-black text-slate-900">
            {formatINR(breakdown.card)}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">
            POS Credit & Debit Card swipe transactions
          </div>
        </div>
      </div>

      {/* LARGE PAYMENT DONUT CHART */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">Payment Share Donut Chart</h3>
        <p className="text-xs font-semibold text-slate-500 mb-6">Visual comparison of revenue contributed by each payment method</p>

        <div className="h-80 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={125}
                paddingAngle={5}
                dataKey="amount"
              >
                {items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Earned</span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5">{formatINR(breakdown.total)}</span>
          </div>
        </div>
      </div>

      {/* PAYMENT TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900">Payment Method Distribution Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3.5 px-6">Payment Mode</th>
                <th className="py-3.5 px-6 text-right">Amount (₹)</th>
                <th className="py-3.5 px-6 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {items.map((item) => (
                <tr key={item.mode} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.mode}
                  </td>
                  <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                    {formatINR(item.amount)}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-slate-600">
                    {formatPercent(item.pct)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <td className="py-4 px-6 text-sm">Total Sales</td>
                <td className="py-4 px-6 text-right text-emerald-600 font-black text-base">{formatINR(breakdown.total)}</td>
                <td className="py-4 px-6 text-right text-emerald-600 text-sm">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
