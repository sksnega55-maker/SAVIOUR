import React from 'react';
import { RefreshCw, Settings, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { getMonthName } from '../utils/formatters';

interface HeaderProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSyncing: boolean;
  onSync: () => void;
  onOpenSyncModal: () => void;
  isLive: boolean;
  lastSyncedAt: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  searchQuery,
  setSearchQuery,
  isSyncing,
  onSync,
  onOpenSyncModal,
  isLive,
  lastSyncedAt,
}) => {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const years = [2024, 2025, 2026, 2027];

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Not synced';
    const date = new Date(iso);
    return `Last synced ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Live Status */}
      <div className="flex items-center space-x-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Saviour Pharmacy</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
              Owner Dashboard
            </span>
          </h2>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {isLive ? 'Google Sheet Connected' : 'Local / Mock Mode Active'}
            </span>
            <span>•</span>
            <span>{formatLastSync(lastSyncedAt)}</span>
          </div>
        </div>
      </div>

      {/* Controls & Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Quick Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 w-44 md:w-56"
          />
        </div>

        {/* Month Selector */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <Calendar className="w-4 h-4 text-slate-400 mr-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Sync Google Sheet Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Google Sheet'}</span>
        </button>

        {/* Sheet Settings Config */}
        <button
          onClick={onOpenSyncModal}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          title="Google Sheet Integration Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
