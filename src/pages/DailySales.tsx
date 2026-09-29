import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import type { SalesRecord, QuickDateRange } from '../types/sales';
import { formatINR } from '../utils/currency';
import { formatDateShort, MONTH_NAMES_SHORT, getDateNDaysAgo } from '../utils/date';
import { ExcelImportService } from '../services/excelImport';

interface DailySalesProps {
  salesRecords: SalesRecord[];
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
}

export const DailySales: React.FC<DailySalesProps> = ({
  salesRecords,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}) => {
  const [quickRange, setQuickRange] = useState<QuickDateRange>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof SalesRecord>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const filteredRecords = useMemo(() => {
    return salesRecords.filter(r => {
      if (!r.date) return false;

      if (quickRange === '7days') {
        const threshold = getDateNDaysAgo(7);
        if (r.date < threshold) return false;
      } else if (quickRange === '15days') {
        const threshold = getDateNDaysAgo(15);
        if (r.date < threshold) return false;
      } else if (quickRange === 'month') {
        const d = new Date(r.date);
        if (d.getFullYear() !== selectedYear || d.getMonth() !== selectedMonth) return false;
      } else if (quickRange === 'custom') {
        if (customStartDate && r.date < customStartDate) return false;
        if (customEndDate && r.date > customEndDate) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = r.date.toLowerCase().includes(q);
        const matchesInv = (r.invoiceNo || '').toLowerCase().includes(q);
        if (!matchesDate && !matchesInv) return false;
      }

      return true;
    });
  }, [salesRecords, quickRange, selectedYear, selectedMonth, customStartDate, customEndDate, searchQuery]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage]);

  const handleSort = (field: keyof SalesRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const chartData = useMemo(() => {
    return [...filteredRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({
        displayDate: formatDateShort(r.date),
        rawDate: r.date,
        'Total Sales': r.totalSales,
        'Cash': r.cash,
        'UPI': r.upi,
        'Card': r.card,
        'Sales Return': r.salesReturn,
      }));
  }, [filteredRecords]);

  const totals = useMemo(() => {
    return filteredRecords.reduce((acc, r) => ({
      cash: acc.cash + r.cash,
      upi: acc.upi + r.upi,
      card: acc.card + r.card,
      salesReturn: acc.salesReturn + r.salesReturn,
      totalSales: acc.totalSales + r.totalSales,
    }), { cash: 0, upi: 0, card: 0, salesReturn: 0, totalSales: 0 });
  }, [filteredRecords]);

  const handleExport = () => {
    const exportData = filteredRecords.map(r => ({
      Date: r.date,
      InvoiceNo: r.invoiceNo || '',
      Cash: r.cash,
      UPI: r.upi,
      Card: r.card,
      SalesReturn: r.salesReturn,
      TotalSales: r.totalSales,
    }));
    ExcelImportService.exportToExcel(exportData, `Daily_Sales_${selectedYear}_${selectedMonth + 1}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-xs">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            Daily Sales Tracker
          </h2>
          <p className="text-xs text-slate-400">View daily revenue trends and payment mode breakdown</p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => { setQuickRange('7days'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                quickRange === '7days' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => { setQuickRange('15days'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                quickRange === '15days' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 15 Days
            </button>
            <button
              onClick={() => { setQuickRange('month'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                quickRange === 'month' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Current Month
            </button>
            <button
              onClick={() => { setQuickRange('custom'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                quickRange === 'custom' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom
            </button>
          </div>

          {quickRange === 'month' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                {MONTH_NAMES_SHORT.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {quickRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Sales</div>
          <div className="text-lg font-bold text-white mt-0.5">{formatINR(totals.totalSales)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-amber-400 font-semibold uppercase">Cash</div>
          <div className="text-lg font-bold text-amber-300 mt-0.5">{formatINR(totals.cash)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-indigo-400 font-semibold uppercase">UPI</div>
          <div className="text-lg font-bold text-indigo-300 mt-0.5">{formatINR(totals.upi)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] text-cyan-400 font-semibold uppercase">Card</div>
          <div className="text-lg font-bold text-cyan-300 mt-0.5">{formatINR(totals.card)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-[11px] text-rose-400 font-semibold uppercase">Sales Return</div>
          <div className="text-lg font-bold text-rose-300 mt-0.5">{formatINR(totals.salesReturn)}</div>
        </div>
      </div>

      {/* DAILY SALES CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1">Daily Sales Performance Chart</h3>
        <p className="text-xs text-slate-400 mb-6">Interactive revenue comparison line chart</p>

        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} stroke="#94a3b8" />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                <Area type="monotone" dataKey="Total Sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="UPI" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUpi)" />
                <Area type="monotone" dataKey="Cash" stroke="#f59e0b" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="Card" stroke="#06b6d4" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No sales records match the selected date range.
            </div>
          )}
        </div>
      </div>

      {/* DAILY SALES TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search date or invoice..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <th onClick={() => handleSort('date')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    Date <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Cash</th>
                <th className="py-3 px-4 text-right">UPI</th>
                <th className="py-3 px-4 text-right">Card</th>
                <th className="py-3 px-4 text-right text-rose-400">Sales Return</th>
                <th onClick={() => handleSort('totalSales')} className="py-3 px-4 text-right cursor-pointer hover:text-white">
                  <div className="flex items-center justify-end gap-1">
                    Total <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {r.date}
                      {r.invoiceNo && <span className="text-[10px] text-slate-500 block">{r.invoiceNo}</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-amber-300">{formatINR(r.cash)}</td>
                    <td className="py-3 px-4 text-right font-medium text-indigo-300">{formatINR(r.upi)}</td>
                    <td className="py-3 px-4 text-right font-medium text-cyan-300">{formatINR(r.card)}</td>
                    <td className="py-3 px-4 text-right font-medium text-rose-400">{formatINR(r.salesReturn)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400">{formatINR(r.totalSales)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No sales records found.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredRecords.length > 0 && (
              <tfoot>
                <tr className="bg-slate-800/90 font-bold text-white border-t-2 border-slate-700">
                  <td className="py-3 px-4">Total ({filteredRecords.length} records)</td>
                  <td className="py-3 px-4 text-right text-amber-400">{formatINR(totals.cash)}</td>
                  <td className="py-3 px-4 text-right text-indigo-400">{formatINR(totals.upi)}</td>
                  <td className="py-3 px-4 text-right text-cyan-400">{formatINR(totals.card)}</td>
                  <td className="py-3 px-4 text-right text-rose-400">{formatINR(totals.salesReturn)}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 text-sm">{formatINR(totals.totalSales)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedRecords.length)} of {sortedRecords.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-semibold text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
