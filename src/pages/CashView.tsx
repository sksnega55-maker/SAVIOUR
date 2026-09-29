import React from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import type { CashRecord, CashSheetSummary } from '../types/pharmacy';
import { formatINR, formatDateDisplay, getMonthName } from '../utils/formatters';

interface CashViewProps {
  records: CashRecord[];
  summary: CashSheetSummary;
  selectedYear: number;
  selectedMonth: number;
  searchQuery: string;
  onOpenAddModal: () => void;
}

export const CashView: React.FC<CashViewProps> = ({
  records,
  summary,
  selectedYear,
  selectedMonth,
  searchQuery,
  onOpenAddModal
}) => {
  const filteredRecords = records.filter(r => 
    r.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.date.includes(searchQuery) ||
    (r.remarks && r.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <span>Tab 2: Cash Register</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {filteredRecords.length} Transactions
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Petty Cash & Counter Cash Ledger for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cash Transaction</span>
        </button>
      </div>

      {/* Row 2: Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Inward (+)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatINR(summary.inward)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-rose-500 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total Outward (-)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {formatINR(summary.outward)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-blue-600 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Closing Cash Balance</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            {formatINR(summary.closingBalance)}
          </p>
        </div>
      </div>

      {/* Row 3 Headers & Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200 whitespace-nowrap">
                <th className="py-3.5 px-4">Sl No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Particulars</th>
                <th className="py-3.5 px-4 text-right text-emerald-700">Inward (+)</th>
                <th className="py-3.5 px-4 text-right text-rose-700">Outward (-)</th>
                <th className="py-3.5 px-4 text-right text-blue-800 bg-blue-50/50">Closing Balance</th>
                <th className="py-3.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No cash register entries for this period.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.slNo} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="py-3 px-4 text-slate-500 font-mono">#{r.slNo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{formatDateDisplay(r.date)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.particulars}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {r.inward > 0 ? formatINR(r.inward) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      {r.outward > 0 ? formatINR(r.outward) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-blue-700 bg-blue-50/30">
                      {formatINR(r.closingBalance)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{r.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
