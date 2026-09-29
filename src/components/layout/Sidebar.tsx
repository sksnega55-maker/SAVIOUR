import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Receipt, 
  Wallet, 
  Building2, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Pill, 
  LogOut,
  FileSpreadsheet
} from 'lucide-react';
import { AuthService } from '../../services/auth';
import type { FullGoogleSheetsConfig } from '../../services/googleSheets';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  sheetConfig: FullGoogleSheetsConfig;
  onOpenConnectModal: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  sheetConfig,
  onOpenConnectModal,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = AuthService.getCurrentUser();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/daily-sales', label: 'Daily Sales', icon: CalendarDays },
    { path: '/sales', label: 'Sales Ledger', icon: Receipt },
    { path: '/cash', label: 'Cash Register', icon: Wallet },
    { path: '/bank', label: 'Bank Register', icon: Building2 },
    { path: '/monthly-report', label: 'Monthly Report', icon: BarChart3 },
    { path: '/yearly-report', label: 'Yearly Report', icon: LineChart },
    { path: '/payment-analysis', label: 'Payment Analysis', icon: PieChart },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const isLive = sheetConfig.isLive;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-white border-r border-slate-200 text-slate-800 transition-all duration-300 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Pill className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Saviour
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Pharmacy Dashboard</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-700'
                }`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-l-full shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Google Sheet Connection Badge Button */}
        {!isCollapsed && (
          <div className="px-3 pb-2">
            <button
              onClick={onOpenConnectModal}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                isLive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <FileSpreadsheet className={`h-4 w-4 shrink-0 ${isLive ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div className="flex-1 truncate">
                <span className="text-[11px] font-bold block">
                  {isLive ? 'Google Sheets Live' : 'Connect Google Sheet'}
                </span>
                <span className="text-[10px] opacity-75 font-semibold block truncate">
                  {isLive ? 'Click to manage link' : 'Click to setup integration'}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Bottom Reminder Card */}
        {!isCollapsed && (
          <div className="p-3 pt-0">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Bell className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Reminder</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
                Enter today's sales in Google Sheets to keep reports up to date.
              </p>
            </div>
          </div>
        )}

        {/* Footer User Snippet */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                {user?.initials || user?.avatar || 'PS'}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || 'PS Saran'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                    {user?.role || 'Owner'}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
