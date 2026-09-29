import React, { useState } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  Menu, 
  Calendar, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { AuthService } from '../../services/auth';
import type { FullGoogleSheetsConfig } from '../../services/googleSheets';

interface HeaderProps {
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenConnectModal: () => void;
  onToggleMobileMenu: () => void;
  sheetConfig: FullGoogleSheetsConfig;
  lastSyncedAt: string | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSyncing,
  onRefresh,
  onOpenConnectModal,
  onToggleMobileMenu,
  sheetConfig,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = AuthService.getCurrentUser();

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isLive = sheetConfig.isLive;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-800 py-3.5 px-4 lg:px-8 transition-all font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Title & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 lg:hidden border border-slate-200"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Saviour Pharmacy
              </span>

              {/* Status Indicator Badge */}
              {isLive ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live: Google Sheets Connected
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-300 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Demo Mode: Connect Sheet
                </span>
              )}
            </div>

            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 mt-0.5">
              Saviour Pharmacy - Owner Dashboard
            </h1>
          </div>
        </div>

        {/* Right Header Quick Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Date Display */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span>{todayStr}</span>
          </div>

          {/* Connect Google Sheet Button */}
          <button
            onClick={onOpenConnectModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isLive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Connect Google Sheet</span>
          </button>

          {/* Sync Data Button */}
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs transition-all disabled:opacity-50"
            title="Refresh latest data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing…' : 'Sync Data'}</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                {user?.initials || user?.avatar || 'PS'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none">
                  {user?.name || 'PS Saran'}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 leading-none mt-0.5">
                  {user?.role || 'Owner'}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-slate-800 font-sans animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{user?.name || 'PS Saran'}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      {user?.role || 'Owner'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{user?.email || 'admin@saviourpharmacy.com'}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={onOpenConnectModal}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>Google Sheet Settings</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
