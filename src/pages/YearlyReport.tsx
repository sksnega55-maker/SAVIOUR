import React from 'react';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award, 
  Calendar 
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Bar, 
  Line, 
  ComposedChart 
} from 'recharts';
import type { SalesRecord, ExpenseRecord, YearlySummary } from '../types/sales';
import { calculateYearlyReports } from '../services/calculations';
import { formatINR, formatPercent } from '../utils/currency';

interface YearlyReportProps {
  salesRecords: SalesRecord[];
  expenseRecords: ExpenseRecord[];
}

export const YearlyReport: React.FC<YearlyReportProps> = ({
  salesRecords,
  expenseRecords,
}) => {
  const { summaries, allTimeRevenue, currentYearRevenue, latestYoYGrowth } = calculateYearlyReports(salesRecords, expenseRecords);

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <LineChartIcon className="h-5 w-5 text-emerald-600" />
            <span>Year-over-Year Growth Analytics</span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Historical annual performance and revenue growth trajectory</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* All-Time Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All-Time Revenue</span>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-black text-slate-900">
            {formatINR(allTimeRevenue)}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">
            Combined revenue across all recorded years
          </div>
        </div>

        {/* Current Year Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Year ({currentYear})</span>
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-black text-emerald-600">
            {formatINR(currentYearRevenue)}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">
            Active YTD performance
          </div>
        </div>

        {/* YoY Growth */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">YoY Growth</span>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl lg:text-3xl font-black text-indigo-600">
            {latestYoYGrowth !== null ? formatPercent(latestYoYGrowth, true) : '—'}
          </div>
          <div className="mt-2 text-xs font-semibold">
            {latestYoYGrowth !== null && latestYoYGrowth >= 0 ? (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-flex items-center border border-emerald-200">
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                Positive growth vs last year
              </span>
            ) : (
              <span className="text-slate-500">Baseline comparison</span>
            )}
          </div>
        </div>
      </div>

      {/* YEARLY CHART */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">Annual Revenue Growth Chart</h3>
        <p className="text-xs font-semibold text-slate-500 mb-6">Comparison of total annual revenue per year</p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={summaries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 13, fontWeight: 'bold' }} />
              <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} stroke="#64748b" />
              <Tooltip
                formatter={(val: any) => [formatINR(Number(val)), 'Sales']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
              />
              <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} barSize={60} />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 6, fill: '#6366f1' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* YEARLY TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900">Yearly Summary Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3.5 px-6">Year</th>
                <th className="py-3.5 px-6 text-right">Total Annual Sales</th>
                <th className="py-3.5 px-6 text-right">YoY Revenue Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
              {summaries.map((y: YearlySummary) => {
                const growthVal = y.growth ?? y.yoyGrowthPct ?? null;
                return (
                  <tr key={y.year} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">{y.year}</td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-600 text-sm">
                      {formatINR(y.sales)}
                    </td>
                    <td className="py-4 px-6 text-right font-bold">
                      {growthVal === null || growthVal === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : growthVal >= 0 ? (
                        <span className="inline-flex items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                          {formatPercent(growthVal, true)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                          {formatPercent(growthVal, true)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
