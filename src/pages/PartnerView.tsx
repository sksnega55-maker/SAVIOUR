import React from 'react';
import { Plus, Users, ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';
import type { PartnerRecord, PartnerSheetSummary, PartnerTab } from '../types/pharmacy';
import { formatINR, formatDateDisplay, getMonthName } from '../utils/formatters';

interface PartnerViewProps {
  partnerTab: PartnerTab;
  setPartnerTab: (tab: PartnerTab) => void;
  ramakrishnanRecords: PartnerRecord[];
  ramakrishnanSummary: PartnerSheetSummary;
  saranRecords: PartnerRecord[];
  saranSummary: PartnerSheetSummary;
  selectedYear: number;
  selectedMonth: number;
  searchQuery: string;
  onOpenAddModal: () => void;
}

export const PartnerView: React.FC<PartnerViewProps> = ({
  partnerTab,
  setPartnerTab,
  ramakrishnanRecords,
  ramakrishnanSummary,
  saranRecords,
  saranSummary,
  selectedYear,
  selectedMonth,
  searchQuery,
  onOpenAddModal
}) => {
  const currentRecords = partnerTab === 'ramakrishnan' ? ramakrishnanRecords : saranRecords;
  const currentSummary = partnerTab === 'ramakrishnan' ? ramakrishnanSummary : saranSummary;

  const filteredRecords = currentRecords.filter(r =>
    r.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.mopMor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.date.includes(searchQuery) ||
    (r.remarks && r.remarks.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Sub Tab Navigation: Ramakrishnan vs Saran */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setPartnerTab('ramakrishnan')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              partnerTab === 'ramakrishnan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Tab 4: Ramakrishnan Account
          </button>
          <button
            onClick={() => setPartnerTab('saran')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              partnerTab === 'saran'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Tab 5: Saran Account
          </button>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner Ledger Entry</span>
        </button>
      </div>

      {/* Row 2 Summary Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Inward (Capital Injection)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatINR(currentSummary.inward)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-rose-500 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Outward (Partner Drawings)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {formatINR(currentSummary.outward)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 border-l-4 border-l-amber-500 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Current Ledger Balance</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {formatINR(currentSummary.closingBalance)}
          </p>
        </div>
      </div>

      {/* Table Title Banner */}
      <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between text-xs">
        <span className="font-bold tracking-wide uppercase text-amber-400">
          {partnerTab === 'ramakrishnan' ? 'Ramakrishnan Statement of Account' : 'Saran Statement of Account'}
        </span>
        <span className="text-slate-400 font-medium">
          Period: {getMonthName(selectedMonth)} {selectedYear}
        </span>
      </div>

      {/* Row 2 Headers & Data Table */}
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
                <th className="py-3.5 px-4 text-right text-amber-800 bg-amber-50/50">Closing Balance</th>
                <th className="py-3.5 px-4">MOP / MOR</th>
                <th className="py-3.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No partner transactions found for this period.
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
                    <td className="py-3 px-4 text-right font-extrabold text-amber-700 bg-amber-50/30">
                      {formatINR(r.closingBalance)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                        <CreditCard className="w-3 h-3 mr-1 text-slate-500" />
                        {r.mopMor || 'N/A'}
                      </span>
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
