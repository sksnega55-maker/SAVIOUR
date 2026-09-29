import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PiggyBank, 
  Calendar, 
  Info,
  TrendingUp,
  Receipt,
  Banknote
} from 'lucide-react';
import { SheetService } from '../services/sheetService';
import { formatINR } from '../utils/formatters';
import type { FullGoogleSheetsConfig } from '../services/googleSheets';

interface DashboardViewProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  sheetConfig: FullGoogleSheetsConfig;
  isSyncing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  sheetConfig,
  isSyncing = false,
}) => {
  const metrics = SheetService.getDashboardMetrics(selectedYear, selectedMonth);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = [2024, 2025, 2026];

  const todayDisplay = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const selectedMonthName = months[selectedMonth] || 'September';
  const monthYearDisplay = `${selectedMonthName} ${selectedYear}`;

  const earnTotal = metrics.breakdowns.earn.total || 1;
  const spendTotal = metrics.breakdowns.spend.total || 1;
  const balanceTotal = metrics.breakdowns.balance.total || 1;

  const earnCashPct = Math.round((metrics.breakdowns.earn.cash / earnTotal) * 100);
  const earnUpiPct = Math.round((metrics.breakdowns.earn.upi / earnTotal) * 100);
  const earnCardPct = Math.round((metrics.breakdowns.earn.card / earnTotal) * 100);

  const spendCashPct = Math.round((metrics.breakdowns.spend.cash / spendTotal) * 100);
  const spendBankPct = Math.round((metrics.breakdowns.spend.bankUpi / spendTotal) * 100);

  const balanceCashPct = Math.round((metrics.breakdowns.balance.cash / balanceTotal) * 100);
  const balanceBankPct = Math.round((metrics.breakdowns.balance.bank / balanceTotal) * 100);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Overview of Earns, Spends, Balance & Savings.
          </p>
        </div>

        {/* Month & Year Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
            >
              {months.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`px-4 py-3 rounded-2xl border flex items-center justify-between transition-all ${
        isSyncing
          ? 'bg-blue-50 border-blue-200 text-blue-900'
          : sheetConfig.isLive
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center space-x-2.5 text-xs font-bold">
          <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${
            isSyncing ? 'bg-blue-500' : sheetConfig.isLive ? 'bg-emerald-500' : 'bg-amber-500'
          }`} />
          <span>
            {isSyncing
              ? 'Loading data from your Google Sheet…'
              : sheetConfig.isLive
                ? 'Live: Google Sheets Connected — Real-time synced data'
                : 'Demo Mode: Displaying realistic pharmacy sample data'}
          </span>
        </div>

        <div className="text-[11px] font-semibold opacity-75 hidden sm:block">
          Selected Period: {monthYearDisplay}
        </div>
      </div>

      {/* Top 4 Metric Summary Cards (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Earned */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Earned</span>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl lg:text-3xl font-black text-slate-900">
            {formatINR(metrics.totalEarned)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-max border border-emerald-200">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>This Month ({selectedMonthName})</span>
          </div>
        </div>

        {/* Card 2: Total Spend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-rose-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Spend</span>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl lg:text-3xl font-black text-slate-900">
            {formatINR(metrics.totalSpend)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full w-max border border-rose-200">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>This Month ({selectedMonthName})</span>
          </div>
        </div>

        {/* Card 3: Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Balance</span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl lg:text-3xl font-black text-blue-600">
            {formatINR(metrics.totalBalance)}
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500">
            This Month ({selectedMonthName})
          </div>
        </div>

        {/* Card 4: Savings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Savings</span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl lg:text-3xl font-black text-slate-900">
            {formatINR(metrics.savings)}
          </div>
          <div className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-max border border-amber-200">
            Set aside this month
          </div>
        </div>
      </div>

      {/* 3-Column Payment Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Earn by Payment Mode */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-600" />
                <span>Earn by Payment Mode</span>
              </h3>
            </div>

            <div className="space-y-4 mt-5">
              {/* Cash Sales */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Cash
                  </span>
                  <span className="text-slate-900 font-extrabold">{formatINR(metrics.breakdowns.earn.cash)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${earnCashPct}%` }} />
                </div>
              </div>

              {/* UPI Sales */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    UPI
                  </span>
                  <span className="text-slate-900 font-extrabold">{formatINR(metrics.breakdowns.earn.upi)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${earnUpiPct}%` }} />
                </div>
              </div>

              {/* Card Sales */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                    Card
                  </span>
                  <span className="text-slate-900 font-extrabold">{formatINR(metrics.breakdowns.earn.card)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${earnCardPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Total Earned</span>
            <span className="text-base font-black text-emerald-600">{formatINR(metrics.breakdowns.earn.total)}</span>
          </div>
        </div>

        {/* Card 2: Spend by Payment Mode */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Receipt className="h-5 w-5 text-rose-600" />
                <span>Spend by Payment Mode</span>
              </h3>
            </div>

            <div className="space-y-4 mt-5">
              {/* Cash Spend */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Cash
                  </span>
                  <span className="text-slate-900 font-extrabold">{formatINR(metrics.breakdowns.spend.cash)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${spendCashPct}%` }} />
                </div>
              </div>

              {/* UPI & Bank Spend */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    UPI / Bank
                  </span>
                  <span className="text-slate-900 font-extrabold">{formatINR(metrics.breakdowns.spend.bankUpi)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${spendBankPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Total Spend</span>
            <span className="text-base font-black text-rose-600">{formatINR(metrics.breakdowns.spend.total)}</span>
          </div>
        </div>

        {/* Card 3: Balance by Payment Mode */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span>Balance by Payment Mode</span>
              </h3>
            </div>

            <div className="space-y-4 mt-5">
              {/* Cash Balance */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Cash Balance
                  </span>
                  <span className="text-slate-900 font-extrabold">{formatINR(metrics.breakdowns.balance.cash)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${balanceCashPct}%` }} />
                </div>
              </div>

              {/* UPI Balance */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    UPI / Bank Balance
                  </span>
                  <span className="text-slate-900 font-extrabold">{formatINR(metrics.breakdowns.balance.bank)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${balanceBankPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Total Balance</span>
            <span className="text-base font-black text-blue-600">{formatINR(metrics.breakdowns.balance.total)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Left Status Card: Today */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3 text-xs text-slate-600 font-semibold">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Today</span>
            <span className="text-slate-900 font-bold text-sm">{todayDisplay}</span>
          </div>
        </div>

        {/* Right Status Card: Calculation Note */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3 text-xs text-slate-600 font-semibold">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Calculation Period</span>
            <span className="text-slate-900 font-bold text-xs sm:text-sm">
              All amounts are calculated for the selected month: <strong className="text-emerald-700">{monthYearDisplay}</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
