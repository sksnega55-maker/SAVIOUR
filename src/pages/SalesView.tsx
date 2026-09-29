import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  CreditCard,
  QrCode,
  Banknote
} from 'lucide-react';
import type { SalesRecord, SalesSheetSummary } from '../types/pharmacy';
import { formatINR, formatDateDisplay, getMonthName } from '../utils/formatters';

interface SalesViewProps {
  records: SalesRecord[];
  summary: SalesSheetSummary;
  selectedYear: number;
  selectedMonth: number;
  onOpenAddModal?: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  records,
  summary,
  selectedYear,
  selectedMonth,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchInv = (r.remarks || '').toLowerCase().includes(q);
      const matchDate = r.date.includes(q);
      const matchSl = r.slNo.toString().includes(q);
      return matchInv || matchDate || matchSl;
    });
  }, [records, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const getPrimaryPaymentBadge = (r: SalesRecord) => {
    if (r.upi >= r.cash && r.upi >= r.card) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
          <QrCode className="w-3 h-3" /> UPI
        </span>
      );
    }
    if (r.card >= r.cash && r.card >= r.upi) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
          <CreditCard className="w-3 h-3" /> Card
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
        <Banknote className="w-3 h-3" /> Cash
      </span>
    );
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Page Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-2 tracking-tight">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Sales Ledger</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {filteredRecords.length} Entries
            </span>
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Full invoice history & patient billing statement for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sales Bill</span>
          </button>
        )}
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Net Sales</span>
          <span className="text-lg font-black text-emerald-600">{formatINR(summary.netSales)}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Cash Collections</span>
          <span className="text-lg font-black text-amber-600">{formatINR(summary.cash)}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">UPI Collections</span>
          <span className="text-lg font-black text-indigo-600">{formatINR(summary.upi)}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Card Swipes</span>
          <span className="text-lg font-black text-blue-600">{formatINR(summary.card)}</span>
        </div>
      </div>

      {/* Search & Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bill No, Date, Patient or Description..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Showing Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 whitespace-nowrap">
                <th className="py-3.5 px-4">Bill / Sl No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Description / Patient Details</th>
                <th className="py-3.5 px-4 text-center">Payment Mode</th>
                <th className="py-3.5 px-4 text-right">Gross Sales</th>
                <th className="py-3.5 px-4 text-right text-rose-600">Return</th>
                <th className="py-3.5 px-4 text-right font-extrabold text-emerald-800 bg-emerald-50">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No sales ledger entries matching your query.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r.slNo} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">INV-2026-{String(r.slNo).padStart(3, '0')}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{formatDateDisplay(r.date)}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold max-w-xs truncate">
                      {r.remarks || 'Outpatient Counter Medicine Sale'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getPrimaryPaymentBadge(r)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">{formatINR(r.computerSales + r.manualSales)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">{r.salesReturn > 0 ? formatINR(r.salesReturn) : '-'}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 bg-emerald-50/50 text-sm">
                      {formatINR(r.netSales)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <div>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
