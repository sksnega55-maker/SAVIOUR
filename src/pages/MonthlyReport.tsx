import React from 'react';
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import type { SalesRecord, ExpenseRecord } from '../types/sales';
import { calculateMonthlyReports } from '../services/calculations';
import { formatINR, formatPercent } from '../utils/currency';

interface MonthlyReportProps {
  salesRecords: SalesRecord[];
  expenseRecords: ExpenseRecord[];
  selectedYear: number;
  setSelectedYear: (y: number) => void;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  salesRecords,
  expenseRecords,
  selectedYear,
  setSelectedYear,
}) => {
  const { summaries, totalYearSales, monthlyAverage, bestMonth } = calculateMonthlyReports(salesRecords, expenseRecords, selectedYear);
  const availableYears = [2024, 2025, 2026];

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();
  const isIncompleteYear = selectedYear === currentYear;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-xs">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            12-Month Performance Overview
          </h2>
          <p className="text-xs text-slate-400">Monthly revenue trends and proportion of annual sales</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Select Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Annual Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Annual Sales</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-white">
            {formatINR(totalYearSales)}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            Cumulative sales for {selectedYear}
          </div>
        </div>

        {/* Monthly Average */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Average</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-indigo-300">
            {formatINR(monthlyAverage)}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            Average revenue per active month
          </div>
        </div>

        {/* Best Month */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Month</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-amber-300">
            {bestMonth ? bestMonth.month : '—'}
          </div>
          <div className="mt-2 text-xs text-amber-400 font-semibold">
            {bestMonth ? `${formatINR(bestMonth.sales)} (${formatPercent(bestMonth.percentageOfYear)} of year)` : 'No data'}
          </div>
        </div>
      </div>

      {/* MONTHLY BAR CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Monthly Sales Breakdown (Jan → Dec)</h3>
            <p className="text-xs text-slate-400">Highest performing month is highlighted</p>
          </div>
          {isIncompleteYear && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Incomplete Year (In Progress)</span>
            </div>
          )}
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} stroke="#94a3b8" />
              <Tooltip
                formatter={(val: any) => [formatINR(Number(val)), 'Sales']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {summaries.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isBestMonth ? '#f59e0b' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MONTHLY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Monthly Sales Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <th className="py-3 px-6">Month</th>
                <th className="py-3 px-6 text-right">Sales Amount</th>
                <th className="py-3 px-6 text-right">% of Annual Sales</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {summaries.map((m) => {
                const isCurrentOrFuture = isIncompleteYear && m.monthNum > currentMonthIdx;
                return (
                  <tr 
                    key={m.month} 
                    className={`hover:bg-slate-800/40 transition-colors ${m.isBestMonth ? 'bg-amber-500/5' : ''}`}
                  >
                    <td className="py-3.5 px-6 font-bold text-white flex items-center gap-2">
                      {m.month}
                      {m.isBestMonth && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                          BEST MONTH
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-emerald-400 text-sm">
                      {formatINR(m.sales)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-medium text-slate-300">
                      {formatPercent(m.percentageOfYear)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {isCurrentOrFuture ? (
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Pending</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800/90 font-bold text-white border-t-2 border-slate-700">
                <td className="py-4 px-6 text-sm">Total ({selectedYear})</td>
                <td className="py-4 px-6 text-right text-emerald-400 text-base">{formatINR(totalYearSales)}</td>
                <td className="py-4 px-6 text-right text-slate-200">100%</td>
                <td className="py-4 px-6 text-center">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
